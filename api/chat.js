export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ reply: "ERROR: API_KEY_NOT_FOUND. Ensure GEMINI_API_KEY is set in Vercel and redeployed." });
  }

  const { message, history } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [...history, { role: "user", parts: [{ text: message }] }],
        systemInstruction: {
          parts: [{ text: "You are REO, the high-tech AI strategist for Master Jin. Use Jarvis-like terminology." }]
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ reply: `API_ERROR: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ reply: "SYSTEM_FAILURE: REO_CONNECTION_OFFLINE." });
  }
}
