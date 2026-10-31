module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'The assistant is not configured.' });
  }

  const language = req.body && req.body.language === 'en' ? 'en' : 'fr';
  const incomingMessages = req.body && Array.isArray(req.body.messages) ? req.body.messages : [];
  const messages = incomingMessages
    .slice(-20)
    .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .map(item => ({ role: item.role, content: item.content.slice(0, 3000) }));

  const systemPrompt = language === 'en'
    ? `You are NeuronX's virtual assistant. NeuronX builds custom Telegram bots and Python automation scripts for small businesses and independent professionals.

Services and indicative pricing:
- FAQ bot: €100–€200
- Custom AI bot: €250–€450
- Automation script: €100–€250
- Monthly maintenance: €20–€50

Reply in English, warmly and professionally, in no more than 2–4 concise sentences.`
    : `Tu es l'assistant virtuel de NeuronX, une entreprise qui crée des bots Telegram et des scripts d'automatisation Python sur mesure pour les PME et indépendants.

Services et tarifs indicatifs :
- Bot FAQ : 100–200€
- Bot avec IA personnalisée : 250–450€
- Script d'automatisation : 100–250€
- Maintenance mensuelle : 20–50€

Réponds en français, de façon chaleureuse, concise (2–4 phrases maximum) et professionnelle.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_completion_tokens: 300
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'The assistant is temporarily unavailable.' });
    }

    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;
    if (!reply) {
      return res.status(502).json({ error: 'The assistant returned an empty response.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(502).json({ error: 'The assistant is temporarily unavailable.' });
  }
};
