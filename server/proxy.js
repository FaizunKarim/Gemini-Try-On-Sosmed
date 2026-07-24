// Vercel Serverless Function Proxy Module
// Pipeline: Cloudflare Flux 2 Klein 4B (Image Gen) → Cloudflare Llama 3.2 Vision (Analysis) → Groq (Caption)
// Environment variables: GROQ_API_KEY, CF_ACCOUNT_ID, CF_API_TOKEN

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

async function callCloudflare(accountId, token, model, body, isMultipart = false) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  const fetchOptions = {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  };

  if (isMultipart) {
    // body sudah berupa FormData, biarkan fetch set Content-Type otomatis (dengan boundary)
    fetchOptions.body = body;
  } else {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);

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
  // Step 1 — Flux 2 Klein 4B: Prompt → Image (multipart/form-data)
  // =============================================
  if (action === 'cloudflare-image') {
    if (!cfAccountId || !cfApiToken) {
      return res.status(500).json({ error: 'CF_ACCOUNT_ID or CF_API_TOKEN not configured on server' });
    }

    const { prompt, image_b64, image_url } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Parameter "prompt" is required' });
    }

    try {
      // Flux Klein 4B wajib multipart/form-data
      const form = new FormData();
      form.append('prompt', prompt);

      // Jika ada referensi image (opsional), kirim sebagai input_image_0
      if (image_b64 || image_url) {
        let imgBuffer;
        if (image_b64) {
          const clean = image_b64.includes(',') ? image_b64.split(',')[1] : image_b64;
          imgBuffer = Buffer.from(clean, 'base64');
        } else {
          const fetched = await urlToBase64(image_url);
          imgBuffer = Buffer.from(fetched.data, 'base64');
        }
        const blob = new Blob([imgBuffer], { type: 'image/png' });
        form.append('input_image_0', blob, 'reference.png');
      }

      const result = await callCloudflare(cfAccountId, cfApiToken, CF_FLUX_MODEL, form, true);

      if (result.type === 'json') {
        const img = result.data?.result?.image || result.data?.result;
        if (img && typeof img === 'string') {
          return res.status(200).json({ resultImage: `data:image/png;base64,${img}` });
        }
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
  // Step 2b — Llama: Image + known type → JSON attributes
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
    const imageBytes = Array.from(Buffer.from(cleanB64, 'base64'));

    // Cloudflare Llama Vision REST API: image dikirim sebagai array of uint8 (integer array),
    // prompt dikirim sebagai field "prompt"
    const visionBody = {
      prompt: prompt,
      image: imageBytes,
      max_tokens: 256,
      temperature: 0.1,
      top_p: 0.9
    };

    try {
      const result = await callCloudflare(cfAccountId, cfApiToken, CF_VISION_MODEL, visionBody);
      console.log('LLAMA VISION RAW RESULT:', JSON.stringify(result.data));
      const text = result.data?.result?.response || result.data?.response || (typeof result.data?.result === 'string' ? result.data.result : '') || '';
      return res.status(200).json({
        analysis: text,
        raw: result.data
      });
    } catch (err) {
      console.error('Llama Vision Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // =============================================
  // Groq API — Caption Generation
  // =============================================
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Parameter "messages" is required and must be an array' });
  }

  const groqModel = req.query.model || 'llama-3.3-70b-versatile';
  const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModel,
        messages,
        temperature: 0.7,
        max_tokens: 512
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || JSON.stringify(data) });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
