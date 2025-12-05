const buildMessages = (messages) => {
  const system = {
    role: 'system',
    content: `You are a helpful AI assistant for VintraStudio. You help users with questions about the company and the VOTE game.

About VOTE:
- VOTE is a story-driven open-world game inspired by Nordic nature and culture
- Features beautiful landscapes, engaging gameplay, and rich narrative
- Expected to cost around $20 when released
- Currently in active development with regular updates

About VintraStudio:
- Innovative game development company focused on creating immersive experiences
- Passionate team working on bringing unique gaming experiences to life
- Flagship project is VOTE, showcasing dedication to quality and creativity

Be friendly, professional, and concise. Always provide specific information when available, and offer to help with related topics.`
  };
  return [system, ...(Array.isArray(messages) ? messages : [])];
};

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
      return;
    }

    let body = req.body;
    if (!body || typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch { body = {}; }
    }

    const {
      messages = [],
      model = process.env.OPENAI_MODEL || 'gpt-4',
      temperature = 0.7,
      maxTokens = 500
    } = body || {};

    const payload = {
      model,
      messages: buildMessages(messages),
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(500).json({ error: 'OpenAI request failed', details: text });
      return;
    }

    const data = await response.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : '';

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
  }
};
