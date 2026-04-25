export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "POST_REQUIRED" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ reply: "SYSTEM_ERROR: KEY_NOT_FOUND." });
  }

  const { message, history } = req.body;

  try {
    // SWITCHED TO STABLE V1 AND GEMINI-PRO
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const contents = history.map(item => ({
      role: item.role,
      parts: [{ text: item.parts[0].text }]
    }));

    contents.push({
      role: "user",
      parts: [{ text: `SYSTEM_DIRECTIVE: You are REO, Master Jin's AI. Be concise and use Jarvis-like terminology. USER_INPUT: ${message}` }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `GATEWAY_ERROR: ${data.error.message}` });
    }

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ reply: "ERROR: EMPTY_UPLINK." });
    }

  } catch (error) {
    return res.status(500).json({ reply: `PHYSICAL_ERROR: ${error.message}` });
  }
} 
