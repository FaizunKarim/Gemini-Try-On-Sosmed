// Vercel Serverless Function Proxy Module — Google Gemini API & Cloudflare Workers AI
// Environment variables: GEMINI_API_KEY, CF_ACCOUNT_ID, CF_API_TOKEN

async function urlToInlineData(imageUrl) {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/png';
  return { mimeType, data: base64 };
}

module.exports = async function handler(req, res) {
  const action = req.query.action;
  const model = req.query.model;

  // Handler untuk Cloudflare Workers AI Image Generation (@cf/runwayml/stable-diffusion-v1-5-img2img)
  if (action === 'cloudflare-image' || model === 'cloudflare-image' || (model && model.includes('stable-diffusion'))) {
    const cfAccountId = process.env.CF_ACCOUNT_ID;
    const cfApiToken = process.env.CF_API_TOKEN;

    if (!cfAccountId || !cfApiToken) {
      return res.status(500).json({ error: 'CF_ACCOUNT_ID or CF_API_TOKEN not configured on server' });
    }

    let { prompt, image_b64, image_url, strength = 0.65, guidance = 7, num_steps = 8 } = req.body || {};

    // Jika image_url diberikan, konversi ke base64 di server (bebas CORS)
    if (!image_b64 && image_url) {
      try {
        const inlineData = await urlToInlineData(image_url);
        image_b64 = inlineData.data;
      } catch (err) {
        console.error(`Gagal mengunduh gambar dari URL di server (${image_url}):`, err.message);
        return res.status(400).json({ error: `Gagal mengambil gambar dari URL: ${err.message}` });
      }
    }

    if (!prompt || !image_b64) {
      return res.status(400).json({ error: 'Parameters "prompt" and ("image_b64" or "image_url") are required' });
    }

    // Stripping header data:image/...;base64, jika ada
    const cleanImageB64 = image_b64.includes(',') ? image_b64.split(',')[1] : image_b64;

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/runwayml/stable-diffusion-v1-5-img2img`;

    try {
      const response = await fetch(cfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          image_b64: cleanImageB64,
          strength: Number(strength),
          guidance: Number(guidance),
          num_steps: Number(num_steps)
        })
      });

      if (!response.ok) {
        let errText = await response.text();
        console.error('Cloudflare Workers AI Error:', errText);
        return res.status(response.status).json({ error: `Cloudflare Workers AI Error: ${errText}` });
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const jsonRes = await response.json();
        if (jsonRes.result && jsonRes.result.image) {
          return res.status(200).json({ resultImage: `data:image/png;base64,${jsonRes.result.image}` });
        } else if (typeof jsonRes.result === 'string') {
          return res.status(200).json({ resultImage: `data:image/png;base64,${jsonRes.result}` });
        }
        return res.status(200).json(jsonRes);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = contentType.split(';')[0] || 'image/png';
        return res.status(200).json({ resultImage: `data:${mimeType};base64,${base64Data}` });
      }
    } catch (error) {
      console.error('Cloudflare Proxy Error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Handler untuk Google Gemini API (Caption Generator)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  if (!model) {
    return res.status(400).json({ error: 'Query parameter "model" is required' });
  }

  // Clone body and resolve URL-based images to inlineData
  const body = JSON.parse(JSON.stringify(req.body));
  
  if (body.contents) {
    for (const content of body.contents) {
      if (content.parts) {
        for (let i = 0; i < content.parts.length; i++) {
          const part = content.parts[i];
          if (part.fileData && part.fileData.uri) {
            try {
              const inlineData = await urlToInlineData(part.fileData.uri);
              content.parts[i] = { inlineData };
              console.log(`Converted URL to inlineData: ${part.fileData.uri}`);
            } catch (err) {
              console.error(`Failed to fetch URL ${part.fileData.uri}:`, err.message);
              return res.status(400).json({ error: `Failed to fetch image from URL: ${part.fileData.uri}` });
            }
          }
        }
      }
    }
  }

  // Resolution nama model resmi di Google AI Studio v1beta
  let targetModel = model;
  if (targetModel === 'gemini-1.5-flash') {
    targetModel = 'gemini-1.5-flash-latest';
  }

  const apiVersion = (targetModel.includes('exp-') || targetModel.includes('preview')) ? 'v1' : 'v1beta';
  const googleUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${targetModel}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
