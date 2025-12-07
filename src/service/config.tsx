// Base URL Configuration
export const BASE_URL = 'https://romantic-nanete-adildevelopment-3ec66986.koyeb.app'; // Update this with your actual ngrok URL

// Gemini API Configuration
// WARNING: API keys should be stored securely and not committed to version control
export const GEMINI_API_KEY = ''; // Set this in your app configuration securely

// API Configuration
export const AI_CONFIG = {
  // Rate limiting settings
  MAX_REQUESTS_PER_MINUTE: 5,
  REQUEST_INTERVAL: 60000, // 1 minute
  
  // Model settings
  MODEL_NAME: 'gemini-2.5-flash', // Supported model in v1beta API
  
  // Retry settings
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000, // 1 second
  
  // Feature flags
  ENABLE_FALLBACK: true,
  ENABLE_RATE_LIMITING: true,
};


