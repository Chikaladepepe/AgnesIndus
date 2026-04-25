export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "POST_REQUIRED" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ reply: "ENV_KEY_MISSING" });
  }

  const { message, history } = req.body;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // 2. Format history strictly for the Gemini API
    const contents = history.map(item => ({
      role: item.role,
      parts: [{ text: item.parts[0].text }]
    }));

    // 3. Add the current user message with Reo's personality instruction
    contents.push({
      role: "user",
      parts: [{ text: `SYSTEM_INSTRUCTION: You are REO, Master Jin's AI. Be concise and loyal. USER_MESSAGE: ${message}` }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    // 4. Handle Google API errors
    if (data.error) {
      return res.status(500).json({ reply: `API_REJECTION: ${data.error.message}` });
    }

    // 5. Check if we have a valid reply
    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ reply: "EMPTY_RESPONSE_FROM_CORE" });
    }

  } catch (error) {
    return res.status(500).json({ reply: `RUNTIME_ERROR: ${error.message}` });
  }
}
