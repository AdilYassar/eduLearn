// Configuration Validation Script
// Run this to check if your API keys are properly configured

import { validateApiKeys, ENV_CONFIG } from './envConfig';

console.log('🔍 EduLearn API Configuration Validation');
console.log('==========================================');

const validation = validateApiKeys();

console.log(`✅ Configuration Status: ${validation.isValid ? 'VALID' : 'INCOMPLETE'}`);

if (validation.isValid) {
  console.log('🎉 All required API keys are configured!');
  console.log('');
  console.log('📊 Current Configuration:');
  console.log(`- Base URL: ${ENV_CONFIG.BASE_URL}`);
  console.log(`- Gemini API: ${ENV_CONFIG.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`- Hugging Face: ${ENV_CONFIG.HUGGING_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`- Stable Diffusion: ${ENV_CONFIG.STABLE_DIFFUSION_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`- Google Drive: ${ENV_CONFIG.GOOGLE_DRIVE_API_KEY && !ENV_CONFIG.GOOGLE_DRIVE_API_KEY.includes('your_') ? '✅ Configured' : '⚠️ Optional - Not configured'}`);
  console.log(`- YouTube: ${ENV_CONFIG.YOUTUBE_API_KEY && !ENV_CONFIG.YOUTUBE_API_KEY.includes('your_') ? '✅ Configured' : '⚠️ Optional - Not configured'}`);
} else {
  console.log('❌ Missing or incomplete API keys:');
  validation.missing.forEach(key => {
    console.log(`   - ${key}`);
  });
  console.log('');
  console.log('📝 To fix this:');
  console.log('1. Open src/config/envConfig.ts');
  console.log('2. Replace placeholder values with your actual API keys');
  console.log('3. Run this script again to validate');
}

console.log('');
console.log('🔒 Security Reminder:');
console.log('- Never commit API keys to version control');
console.log('- Keep your .env file secure');
console.log('- Rotate keys regularly');

export default validation;
