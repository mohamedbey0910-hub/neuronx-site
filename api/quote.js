module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const sharedSecret = process.env.QUOTE_FORWARD_SECRET;
  if (!appsScriptUrl || !sharedSecret) {
    return res.status(503).json({ error: 'The quote form is not configured.' });
  }

  let endpoint;
  try {
    endpoint = new URL(appsScriptUrl);
  } catch (error) {
    return res.status(503).json({ error: 'The quote form is not configured.' });
  }
  if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com') {
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
    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: sharedSecret, name, email, service, message })
    });
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      result = null;
    }

    if (!response.ok || !result || result.ok !== true) {
      return res.status(502).json({ error: 'The quote request could not be delivered.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({ error: 'The quote request could not be delivered.' });
  }
};
