// API Key Configuration
// API key dibaca server-side via Vercel Serverless Function (/api/proxy.js)
// Environment variable GEMINI_API_KEY harus diset di Vercel Dashboard

function getApiKey() {
  // Tidak perlu API key di client — proxy server yang handle
  return 'configured-on-server';
}

function isApiKeyConfigured() {
  return true;
}