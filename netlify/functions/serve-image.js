const { connectLambda, getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  connectLambda(event);
  // Kimliği birkaç yerden dene: ?id=..., sonra orijinal URL / yol içindeki UUID
  // (/img/<uuid>.jpg yönlendirmesi kimliği query olarak iletmeyebilir, bu yüzden yoldan da okuyoruz)
  const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  let id = event.queryStringParameters && event.queryStringParameters.id;
  // /img/<id>.png gibi uzantılı geliyorsa uzantıyı at (Vela linkin .png/.jpg ile bitmesini ister)
  if (id) id = id.replace(/\.(png|jpe?g|webp|gif)$/i, '');
  if (!id || !UUID_RE.test(id)) {
    const m = UUID_RE.exec((event.rawUrl || '') + ' ' + (event.path || ''));
    id = m ? m[1] : '';
  }
  if (!id) {
    return { statusCode: 400, body: 'id gerekli' };
  }
  try {
    const store = getStore('etsy-vela-photos');
    const arrayBuffer = await store.get(id, { type: 'arrayBuffer' });
    if (!arrayBuffer) {
      return { statusCode: 404, body: 'Görsel bulunamadı' };
    }
    const metaResult = await store.getMetadata(id);
    const contentType = (metaResult && metaResult.metadata && metaResult.metadata.contentType) || 'image/png';
    const buffer = Buffer.from(arrayBuffer);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: 'Hata: ' + err.message };
  }
};
