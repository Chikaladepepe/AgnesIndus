export default async function handler(req, res) {
  const { message } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    // If it works, send the reply. 
    // If it fails, send the EXACT error Google gives.
    if (response.ok) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(200).json({ reply: `GOOGLE_SAYS: ${data.error.message} (${data.error.status})` });
    }
  } catch (err) {
    res.status(200).json({ reply: "BRIDGE_CRASHED: CHECK_VERCEL_LOGS" });
  }
}
