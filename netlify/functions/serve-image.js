const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;
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
