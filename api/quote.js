module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(503).json({ error: 'The quote form is not configured.' });
  }

  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 320) : '';
  const service = typeof body.service === 'string' ? body.service.trim().slice(0, 200) : '';
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : '';

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid name and email are required.' });
  }

  try {
    const formData = new FormData();
    formData.append('nom', name);
    formData.append('email', email);
    formData.append('service', service);
    formData.append('message', message);

    const response = await fetch(webhookUrl, { method: 'POST', body: formData });
    if (!response.ok) {
      return res.status(502).json({ error: 'The quote request could not be delivered.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ error: 'The quote request could not be delivered.' });
  }
};
