function doGet() {
  return jsonResponse({ ok: true, service: 'NeuronX quote relay' });
}

function doPost(e) {
  const properties = PropertiesService.getScriptProperties();
  const expectedSecret = properties.getProperty('QUOTE_FORWARD_SECRET');
  const recipient = properties.getProperty('QUOTE_TO_EMAIL');

  if (!expectedSecret || !recipient) {
    return jsonResponse({ ok: false, error: 'The quote relay is not configured.' });
  }

  let payload;
  try {
    payload = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Invalid request.' });
  }

  if (!payload || typeof payload.secret !== 'string' || payload.secret !== expectedSecret) {
    return jsonResponse({ ok: false, error: 'Unauthorized.' });
  }

  const name = typeof payload.name === 'string' ? payload.name.trim().slice(0, 200) : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().slice(0, 320) : '';
  const service = typeof payload.service === 'string' ? payload.service.trim().slice(0, 200) : '';
  const message = typeof payload.message === 'string' ? payload.message.trim().slice(0, 5000) : '';

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ ok: false, error: 'A valid name and email are required.' });
  }

  const body = [
    'Nouvelle demande de devis depuis neuronx-site.vercel.app',
    '',
    'Nom : ' + name,
    'Email : ' + email,
    'Service : ' + (service || 'Non précisé'),
    '',
    'Besoin :',
    message || 'Aucun détail supplémentaire.'
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: recipient,
      replyTo: email,
      subject: 'Nouvelle demande de devis — NeuronX',
      body: body
    });
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: 'Email delivery failed.' });
  }
}

function authorizeEmail() {
  MailApp.getRemainingDailyQuota();
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
