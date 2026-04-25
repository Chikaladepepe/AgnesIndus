export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "SYSTEM_ERROR: API_KEY_NOT_FOUND." });
  }

  try {
    // UNIVERSAL STABLE URL: Using gemini-pro for 100% compatibility
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history, 
          { role: "user", parts: [{ text: `SYSTEM_DIRECTIVE: You are REO, Master Jin's AI strategist. Be concise, result-oriented, and use Jarvis-like terminology. USER_INPUT: ${message}` }] }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `CORE_GATEWAY_ERROR: ${data.error.message}` });
    }

    // Extraction for the Pro model
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "REO_UPLINK_OFFLINE: BRIDGE_TIMEOUT." });
  }
} 
