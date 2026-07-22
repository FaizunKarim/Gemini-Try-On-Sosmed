// Vercel Serverless Function — Proxy untuk Google Gemini API
// Environment variable GEMINI_API_KEY dibaca server-side (aman)

// Helper: fetch URL eksternal dan konversi ke base64
async function urlToInlineData(imageUrl) {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/png';
  return { mimeType, data: base64 };
}

module.exports = async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const model = req.query.model;
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
            // Fetch URL and convert to inlineData
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

  // Use v1 for experimental/preview models, v1beta for stable models
  const apiVersion = (model.includes('exp-') || model.includes('preview')) ? 'v1' : 'v1beta';
  const googleUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

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