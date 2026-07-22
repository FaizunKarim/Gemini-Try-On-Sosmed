// API Key Configuration
// Menggunakan environment variable dari Vercel
// Di Vercel dashboard, set environment variable: GEMINI_API_KEY

const GEMINI_API_KEY = `${GEMINI_API_KEY}`;

function getApiKey() {
  return GEMINI_API_KEY || '';
}

function isApiKeyConfigured() {
  return getApiKey() !== '';
}