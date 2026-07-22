// config.js
const DEFAULT_API_KEY = ""; // Biarkan kosong di local/GitHub

function getApiKey() {
  // 1. Prioritas utama: API Key buatan user di Modal (localStorage)
  const userApiKey = localStorage.getItem('user_gemini_api_key');
  if (userApiKey && userApiKey.trim() !== '') {
    return userApiKey.trim();
  }

  // 2. Prioritas kedua: API Key otomatis dari Vercel Build Command
  if (typeof DEFAULT_API_KEY !== 'undefined' && DEFAULT_API_KEY.trim() !== '') {
    return DEFAULT_API_KEY.trim();
  }

  return '';
}

function hasCustomApiKey() {
  const userApiKey = localStorage.getItem('user_gemini_api_key');
  return Boolean(userApiKey && userApiKey.trim() !== '');
}

function getApiKeyStatus() {
  if (hasCustomApiKey()) {
    return "API Key: Custom (User)";
  }
  if (getApiKey()) {
    return "API Key: Default (System)";
  }
  return "API Key: Belum Dikonfigurasi";
}

function isApiKeyConfigured() {
  return getApiKey() !== '';
}