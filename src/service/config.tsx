import { getConfigValue } from '../config/envConfig';

// Base URL Configuration
export const BASE_URL = getConfigValue('BASE_URL');

// Gemini API Configuration
export const GEMINI_API_KEY = getConfigValue('GEMINI_API_KEY');

// API Configuration
export const AI_CONFIG = {
  // Rate limiting settings
  MAX_REQUESTS_PER_MINUTE: getConfigValue('MAX_REQUESTS_PER_MINUTE'),
  REQUEST_INTERVAL: getConfigValue('REQUEST_INTERVAL'),
  
  // Model settings
  MODEL_NAME: 'gemini-2.5-flash', // Supported model in v1beta API
  
  // Retry settings
  MAX_RETRIES: getConfigValue('MAX_RETRIES'),
  RETRY_DELAY: getConfigValue('RETRY_DELAY'),
  
  // Feature flags
  ENABLE_FALLBACK: true,
  ENABLE_RATE_LIMITING: true,
};


