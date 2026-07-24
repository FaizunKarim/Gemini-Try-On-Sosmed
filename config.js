// API Key Configuration
// API keys dibaca server-side via Vercel Serverless Function (/api/proxy.js)
// Environment variables CF_ACCOUNT_ID, CF_API_TOKEN, GROQ_API_KEY harus diset di Vercel Dashboard

function getApiKey() {
  // Tidak perlu API key di client — proxy server yang handle
  return 'configured-on-server';
}

function isApiKeyConfigured() {
  return true;
}