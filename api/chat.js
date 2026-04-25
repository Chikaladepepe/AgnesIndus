export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "REO_ERROR: API_KEY_NOT_FOUND." });
  }

  try {
    // 1. SWITCHED TO PRODUCTION STABLE URL (v1)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history.map(item => ({
            role: item.role,
            parts: [{ text: item.parts[0].text }]
          })),
          {
            role: "user",
            parts: [{ text: `SYSTEM_DIRECTIVE: You are REO, Master Jin's AI. Use Jarvis terminology. Be concise. USER_INPUT: ${message}` }]
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok && data.candidates) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      // If it still fails, this will show the STABLE error
      const errorMsg = data.error ? data.error.message : JSON.stringify(data);
      return res.status(200).json({ reply: `STABLE_UPLINK_ERROR: ${errorMsg}` });
    }

  } catch (error) {
    return res.status(200).json({ reply: "REO_OFFLINE: PHYSICAL_CONNECTION_LOST." });
  }
        }
