export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "SYSTEM_ERROR: API_KEY_NOT_INJECTED." });
  }

  try {
    // This is the most stable URL for the Gemini 1.5 Flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // We build the prompt to include your "REO" personality directly in the message
    const systemPrompt = "You are REO, a high-tech AI strategist for Master Jin. Use Jarvis-like terminology. Be concise, loyal, and result-oriented.";
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Understood. Reo online. How can I assist, Master Jin?" }] },
          ...history, 
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ reply: `BRAIN_ERROR: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "CRITICAL_FAILURE: UNABLE_TO_REACH_CORE." });
  }
} 
