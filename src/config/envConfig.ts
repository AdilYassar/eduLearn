// Environment Configuration Loader
// This file loads configuration from environment variables for React Native

// Since React Native doesn't support process.env the same way as Node.js,
// we'll use a simple configuration object that can be updated manually

interface EnvConfig {
  BASE_URL: string;
  SOCKET_URL: string;
  SOCIAL_API_URL: string;
  SOCIAL_SOCKET_URL: string;
  GEMINI_API_KEY: string;
  HUGGING_API_KEY: string;
  STABLE_DIFFUSION_KEY: string;
  HUGGING_API_URL: string;
  STABLE_DIFFUSION_URL: string;
  GOOGLE_DRIVE_API_KEY?: string;
  YOUTUBE_API_KEY?: string;
  MAX_REQUESTS_PER_MINUTE: number;
  REQUEST_INTERVAL: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  LIVEKIT_URL: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
}

// Configuration loaded from your .env file
// Update these values with your actual credentials
//https://romantic-nanete-adildevelopment-3ec66986.koyeb.app
export const ENV_CONFIG: EnvConfig = {
  BASE_URL: 'https://romantic-nanete-adildevelopment-3ec66986.koyeb.app',
  SOCKET_URL: 'wss://romantic-nanete-adildevelopment-3ec66986.koyeb.app',
  SOCIAL_API_URL: 'https://7673-101-53-234-27.ngrok-free.app/api/v1',
  SOCIAL_SOCKET_URL: 'https://7673-101-53-234-27.ngrok-free.app',
  
  // AI Service API Keys - Update these with your actual keys
  GEMINI_API_KEY: 'AIzaSyB5wjKi39RLvrDjDuegIZb7PEaeTU8l13g',
  HUGGING_API_KEY: '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',
  STABLE_DIFFUSION_KEY: 'jnv4mot6KcMCthcStfNEjkVYyGUDNcbalmW97v11r1JlBTxL9ByaXG7Nw94E',
  
  // API URLs
  HUGGING_API_URL: 'https://router.huggingface.co/together/v1/chat/completions',
  STABLE_DIFFUSION_URL: 'https://modelslab.com/api/v6/realtime/text2img',
  
  // Additional APIs (add your keys here)
  GOOGLE_DRIVE_API_KEY: 'your_google_drive_api_key_here',
  YOUTUBE_API_KEY: 'your_youtube_api_key_here',
  
  // Rate limiting settings
  MAX_REQUESTS_PER_MINUTE: 5,
  REQUEST_INTERVAL: 60000,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  
  // LiveKit Configurations
  LIVEKIT_URL: 'wss://edulearn-yk8z461f.livekit.cloud',
  LIVEKIT_API_KEY: 'APICnhfusNi9Gcz',
  LIVEKIT_API_SECRET: 'g5on4I7v5SmcZ53LpA8c7lEsi38MzSy1HesNl0M4GfY',
};

// Validation function to check if all required keys are set
export const validateApiKeys = (): { isValid: boolean; missing: string[] } => {
  const requiredKeys = [
    'BASE_URL',
    'GEMINI_API_KEY',
    'HUGGING_API_KEY',
    'STABLE_DIFFUSION_KEY',
  ];
  
  const missing: string[] = [];
  
  for (const key of requiredKeys) {
    const value = ENV_CONFIG[key as keyof EnvConfig];
    if (!value || value === '' || (typeof value === 'string' && (value.includes('your_') || value.includes('_here')))) {
      missing.push(key);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
};

// Helper function to get config value safely
export const getConfigValue = <K extends keyof EnvConfig>(key: K): EnvConfig[K] => {
  return ENV_CONFIG[key];
};

export default ENV_CONFIG;
