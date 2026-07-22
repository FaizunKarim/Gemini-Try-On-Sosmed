// API Key Configuration
// Priority: 1. User's custom API key (localStorage) > 2. Environment variable

function getApiKey() {
  // Priority 1: Check for user's custom API key in localStorage
  const userApiKey = localStorage.getItem('user_gemini_api_key');
  
  if (userApiKey && userApiKey.trim() !== '') {
    return userApiKey.trim();
  }
  
  // Priority 2: Check for environment variable (injected at build time or runtime)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.GEMINI_API_KEY) {
    return import.meta.env.GEMINI_API_KEY;
  }
  
  // No API key found - return empty string (app will prompt user)
  return '';
}

function hasCustomApiKey() {
  const userApiKey = localStorage.getItem('user_gemini_api_key');
  return userApiKey && userApiKey.trim() !== '';
}

function getApiKeyStatus() {
  const apiKey = getApiKey();
  
  if (hasCustomApiKey()) {
    return "API Key: Custom (Tersimpan)";
  }
  
  if (apiKey) {
    return "API Key: Default (Environment)";
  }
  
  return "API Key: Belum Dikonfigurasi";
}

function isApiKeyConfigured() {
  return getApiKey() !== '';
}
