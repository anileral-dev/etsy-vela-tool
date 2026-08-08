const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const { base64Data, mimeType } = JSON.parse(event.body || '{}');
    if (!base64Data) {
      return { statusCode: 400, body: JSON.stringify({ error: 'base64Data gerekli' }) };
    }
    if (!process.env.BLOBS_SITE_ID || !process.env.BLOBS_TOKEN) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'BLOBS_SITE_ID / BLOBS_TOKEN ortam değişkenleri ayarlanmamış.' }) };
    }

    const store = getStore({
      name: 'etsy-vela-photos',
      siteID: process.env.BLOBS_SITE_ID,
      token: process.env.BLOBS_TOKEN
    });
    const id = crypto.randomUUID();
    const buffer = Buffer.from(base64Data, 'base64');
    await store.set(id, buffer, { metadata: { contentType: mimeType || 'image/png' } });

    const siteUrl = process.env.URL || '';
    const url = `${siteUrl}/.netlify/functions/serve-image?id=${id}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, provider: 'netlify-blobs' })
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};
