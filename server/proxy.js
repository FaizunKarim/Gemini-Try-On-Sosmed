// Vercel Serverless Function Proxy Module
// Pipeline: Cloudflare Flux 2 Klein 4B (Image Gen) → Cloudflare Llama 3.2 Vision (Analysis) → Google Gemini (Caption)
// Environment variables: GEMINI_API_KEY, CF_ACCOUNT_ID, CF_API_TOKEN

const CF_FLUX_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';
const CF_VISION_MODEL = '@cf/meta/llama-3.2-11b-vision-instruct';

async function urlToBase64(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch URL: ${imageUrl} (status ${response.status})`);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/png';
  return { mimeType, data: base64 };
}

async function callCloudflare(accountId, token, model, body) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudflare ${model} error (${res.status}): ${errText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return { type: 'json', data: await res.json() };
  } else {
    const buf = await res.arrayBuffer();
    return { type: 'binary', data: buf, mimeType: contentType.split(';')[0] || 'image/png' };
  }
}

module.exports = async function handler(req, res) {
  const action = req.query.action;
  const model = req.query.model;

  const cfAccountId = process.env.CF_ACCOUNT_ID;
  const cfApiToken = process.env.CF_API_TOKEN;

  // =============================================
  // ACTION: cloudflare-image
  // Step 1 — Flux 2 Klein 4B: Prompt → Image
  // =============================================
  if (action === 'cloudflare-image') {
    if (!cfAccountId || !cfApiToken) {
      return res.status(500).json({ error: 'CF_ACCOUNT_ID or CF_API_TOKEN not configured on server' });
    }

    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "prompt" is required' });
    }

    try {
      const result = await callCloudflare(cfAccountId, cfApiToken, CF_FLUX_MODEL, { prompt });

      if (result.type === 'json') {
        const img = result.data?.result?.image || result.data?.result;
        if (img && typeof img === 'string') {
          return res.status(200).json({ resultImage: `data:image/png;base64,${img}` });
        }
        // fallback: return raw json for debugging
        return res.status(200).json(result.data);
      } else {
        const b64 = Buffer.from(result.data).toString('base64');
        return res.status(200).json({ resultImage: `data:${result.mimeType};base64,${b64}` });
      }
    } catch (err) {
      console.error('Flux Image Gen Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // =============================================
  // ACTION: cloudflare-vision
  // Step 2 — Llama 3.2 11B Vision: Image → JSON Analysis
  // =============================================
  if (action === 'cloudflare-vision') {
    if (!cfAccountId || !cfApiToken) {
      return res.status(500).json({ error: 'CF_ACCOUNT_ID or CF_API_TOKEN not configured on server' });
    }

    let { prompt, image_b64, image_url } = req.body || {};

    // Fetch URL gambar server-side jika input adalah URL (bebas CORS browser)
    if (!image_b64 && image_url) {
      try {
        const fetched = await urlToBase64(image_url);
        image_b64 = fetched.data;
      } catch (err) {
        return res.status(400).json({ error: `Failed to fetch image from URL: ${err.message}` });
      }
    }

    if (!prompt || !image_b64) {
      return res.status(400).json({ error: 'Parameters "prompt" and ("image_b64" or "image_url") are required' });
    }

    const cleanB64 = image_b64.includes(',') ? image_b64.split(',')[1] : image_b64;

    // Llama 3.2 Vision menggunakan format messages multimodal
    const visionBody = {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${cleanB64}` }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      max_tokens: 512
    };

    try {
      const result = await callCloudflare(cfAccountId, cfApiToken, CF_VISION_MODEL, visionBody);
      const text = result.data?.result?.response || result.data?.response || '';
      return res.status(200).json({ analysis: text });
    } catch (err) {
      console.error('Llama Vision Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // =============================================
  // Google Gemini API — Caption Generation
  // =============================================
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }
  if (!model) {
    return res.status(400).json({ error: 'Query parameter "model" is required' });
  }

  const body = JSON.parse(JSON.stringify(req.body));

  // Resolve URL-based images to inlineData untuk Gemini
  if (body.contents) {
    for (const content of body.contents) {
      if (content.parts) {
        for (let i = 0; i < content.parts.length; i++) {
          const part = content.parts[i];
          if (part.fileData && part.fileData.uri) {
            try {
              const fetched = await urlToBase64(part.fileData.uri);
              content.parts[i] = { inlineData: { mimeType: fetched.mimeType, data: fetched.data } };
            } catch (err) {
              return res.status(400).json({ error: `Failed to fetch image from URL: ${part.fileData.uri}` });
            }
          }
        }
      }
    }
  }

  let targetModel = model;
  if (targetModel === 'gemini-1.5-flash') targetModel = 'gemini-1.5-flash-latest';

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
