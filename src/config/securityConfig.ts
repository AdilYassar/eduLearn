// Secure Configuration Helper
// This file should contain instructions for setting up environment variables
// and secure configuration management

/**
 * SECURITY NOTICE:
 * 
 * This app uses sensitive API keys that should NEVER be committed to version control.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Copy your API keys to the appropriate configuration files
 * 2. Make sure these files are listed in .gitignore
 * 3. For production deployment, use environment variables or secure secret management
 * 
 * API KEYS NEEDED:
 * - GEMINI_API_KEY: For Google Gemini API
 * - HUGGING_API_KEY: For Hugging Face API  
 * - STABLE_DIFFUSION_KEY: For Stable Diffusion API
 * 
 * CONFIGURATION FILES TO UPDATE:
 * - src/redux/API.tsx: Update HUGGING_API_KEY and STABLE_DIFFUSION_KEY
 * - src/service/config.tsx: Update GEMINI_API_KEY
 * 
 * For React Native, consider using:
 * - react-native-config for environment variables
 * - react-native-keychain for secure storage
 * - Firebase Remote Config for dynamic configuration
 */

export const CONFIG_INSTRUCTIONS = {
  message: 'Please set up your API keys in the configuration files',
  files: [
    'src/redux/API.tsx',
    'src/service/config.tsx'
  ]
};
