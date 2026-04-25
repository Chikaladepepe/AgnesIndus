export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "REO_BRIDGE_ERROR: API_KEY_NOT_INJECTED." });
  }

  try {
    // Using the absolute stable v1 endpoint and 1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history, 
          { role: "user", parts: [{ text: `SYSTEM: You are REO, Master Jin's AI. Be concise. USER: ${message}` }] }
        ]
      })
    });

    const data = await response.json();

    if (response.ok && data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      // Print the raw error if it fails
      const rawError = JSON.stringify(data.error || data); 
