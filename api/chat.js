export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "REO_BRIDGE: API_KEY_NOT_FOUND." });
  }

  try {
    // The most standard, direct URL possible
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          ...history, 
          { role: "user", parts: [{ text: `SYSTEM: You are REO. USER: ${message}` }] }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      // THIS WILL PRINT THE RAW GOOGLE ERROR IN THE CHAT
      const errorDetail = data.error ? `${data.error.message} (Status: ${data.error.status})` : "UNKNOWN_GATEWAY_ERROR";
      return res.status(response.status).json({ reply: `DIAGNOSTIC_FAILURE: ${errorDetail}` });
    }

  } catch (error) {
    res.status(500).json({ reply: "REO_UPLINK: PHYSICAL_BRIDGE_ERROR." });
  }
}
