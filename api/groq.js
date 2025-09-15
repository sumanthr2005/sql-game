export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
  }

  try {
    const { model, messages, max_tokens, temperature, stream } = req.body || {};

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        max_tokens: typeof max_tokens === 'number' ? max_tokens : 1000,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        stream: !!stream
      })
    });

    if (!groqResponse.ok) {
      const text = await groqResponse.text();
      return res.status(groqResponse.status).json({ error: 'Groq API error', details: text });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
  }
}


