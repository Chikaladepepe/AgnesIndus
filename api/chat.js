export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const { message, history } = req.body;

  if (!API_KEY) {
    return res.status(500).json({ reply: "REO_ERROR: API_KEY_NOT_FOUND_IN_VERCEL." });
  }

  // List of models to try in order of speed
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro"
  ];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...history, 
            { role: "user", parts: [{ text: `SYSTEM: You are REO, Master Jin's AI. Use Jarvis terminology. USER: ${message}` }] }
          ]
        })
      });

      const data = await response.json();

      // If this model worked, return the reply
      if (response.ok && data.candidates && data.candidates[0].content) {
        const reply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply });
      }
      
      // If we get here, this specific model failed, loop continues to next model
      console.log(`Model ${model} failed, trying next...`);

    } catch (err) {
      continue; // Try next model
    }
  }

  // If ALL models fail
  res.status(404).json({ reply: "CRITICAL_404: NO_MODELS_AVAILABLE_FOR_THIS_KEY. Please verify key in Google AI Studio." });
}
