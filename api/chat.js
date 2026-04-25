export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reply: "POST_REQUIRED" });

  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  // List of possible model paths to try (Google's regional naming variations)
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`
  ];

  for (let url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history.map(item => ({ role: item.role, parts: [{ text: item.parts[0].text }] })),
            { role: "user", parts: [{ text: `SYSTEM_NOTE: You are REO, Master Jin's AI. Be concise. USER_MESSAGE: ${message}` }] }
          ]
        })
      });

      const data = await response.json();

      // If the model is found and returns a reply, we STOP and return it
      if (response.ok && data.candidates && data.candidates[0].content) {
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
      }
      
      // If we get here, this specific URL failed, the loop moves to the next one
      console.log(`Endpoint failed: ${url}`);

    } catch (err) {
      continue; // Try the next endpoint in the list
    }
  }

  // If ALL endpoints fail, we send a clear diagnostic
  res.status(404).json({ reply: "CRITICAL_FAILURE: All regional AI cores are currently unresponsive to this API key. Verify key status in Google AI Studio." });
} 
