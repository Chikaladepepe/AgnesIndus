export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "SYSTEM_ERROR: API_KEY_MISSING." });
  }

  try {
    // SWITCHED TO STABLE V1 URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history, 
          { role: "user", parts: [{ text: `SYSTEM_NOTE: You are REO, Master Jin's AI. Be concise and use Jarvis-like terminology. USER_MESSAGE: ${message}` }] }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will catch if the model name is still being rejected
      return res.status(500).json({ reply: `V1_GATEWAY_ERROR: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "REO_UPLINK_TIMEOUT: CHECK_NETWORK_PROTOCOL." });
  }
}
