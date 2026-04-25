export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "DEBUG_ERROR: API_KEY_NOT_FOUND_IN_VERCEL." });
  }

  try {
    // This URL uses the 'latest' alias which bypasses versioning bugs
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history, 
          { 
            role: "user", 
            parts: [{ text: `SYSTEM: You are REO, Master Jin's Jarvis-like AI. Be concise. USER: ${message}` }] 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      // This will give us the FINAL diagnostic if it still fails
      return res.status(500).json({ reply: `GATEWAY_DIAGNOSTIC: ${data.error.message} (Code: ${data.error.code})` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "CRITICAL_CONNECTION_FAILURE: CHECK_SERVER_LOGS." });
  }
}
