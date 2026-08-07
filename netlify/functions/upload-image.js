exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const { base64Data, mimeType } = JSON.parse(event.body || '{}');
    if (!base64Data) {
      return { statusCode: 400, body: JSON.stringify({ error: 'base64Data gerekli' }) };
    }

    const imgbbKey = process.env.IMGBB_API_KEY;
    let imgbbFailReason = null;

    // Try ImgBB first if a key is configured server-side
    if (imgbbKey) {
      try {
        const form = new FormData();
        form.append('image', base64Data);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbKey)}`, {
          method: 'POST',
          body: form
        });
        const rawText = await res.text();
        let data = {};
        try { data = JSON.parse(rawText); } catch (e) { /* non-JSON response */ }
        if (res.ok && data.success) {
          const url = data.data && (data.data.url || data.data.display_url);
          if (url) {
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, provider: 'imgbb' }) };
          }
          imgbbFailReason = 'ImgBB "success" dedi ama url dönmedi: ' + rawText.slice(0, 150);
        } else {
          imgbbFailReason = 'ImgBB HTTP ' + res.status + ': ' + ((data.error && data.error.message) || rawText.slice(0, 150));
        }
        // fall through to catbox.moe below if ImgBB didn't return a usable url
      } catch (imgbbErr) {
        imgbbFailReason = 'ImgBB ağ hatası: ' + imgbbErr.message;
        // network-level failure on ImgBB — fall through to catbox.moe
      }
    } else {
      imgbbFailReason = 'IMGBB_API_KEY ayarlanmamış';
    }

    // Default / fallback: catbox.moe, no key needed
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'image/png' });
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('fileToUpload', blob, 'photo.png');
    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: catboxForm
    });
    const catboxText = (await catboxRes.text()).trim();
    if (catboxRes.ok && catboxText.startsWith('http')) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: catboxText, provider: 'catbox' }) };
    }

    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Hem ImgBB (${imgbbFailReason}) hem catbox.moe (${catboxText.slice(0, 150)}) yüklemesi başarısız oldu.` })
    };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: err.message }) };
  }
};
