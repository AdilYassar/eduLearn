import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, AI_CONFIG } from '../../service/config';
import { getQuotaInfo, incrementQuotaCount } from '../../service/quotaMonitor';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Rate limiting variables
let lastRequestTime = 0;
const REQUEST_INTERVAL = AI_CONFIG.REQUEST_INTERVAL;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = AI_CONFIG.MAX_REQUESTS_PER_MINUTE;

// Fallback suggestions for when API is unavailable
const fallbackSuggestions = [
  '📚 Try learning something new about space exploration today!',
  '🧠 Practice a new language for 10 minutes - your brain will thank you!',
  '🔬 Discover an interesting scientific fact and share it with a friend.',
  '📖 Read one chapter of a book you\'ve been meaning to finish.',
  '🎯 Set a small learning goal for today and work towards it.',
  '💡 Watch an educational video on a topic you\'re curious about.',
  '✍️ Write down three things you learned this week.',
  '🌟 Explore a new hobby or skill that interests you.',
];

const getRandomFallbackSuggestion = (): string => {
  const randomIndex = Math.floor(Math.random() * fallbackSuggestions.length);
  return fallbackSuggestions[randomIndex];
};

const isRateLimited = (): boolean => {
  const currentTime = Date.now();
  
  // Reset request count every minute
  if (currentTime - lastRequestTime >= REQUEST_INTERVAL) {
    requestCount = 0;
    lastRequestTime = currentTime;
  }
  
  return requestCount >= MAX_REQUESTS_PER_MINUTE;
};

export const askAI = async (prompt: string): Promise<string> => {
    try {
        // Check quota using persistent storage
        const quotaInfo = await getQuotaInfo();
        if (AI_CONFIG.ENABLE_RATE_LIMITING && quotaInfo.isQuotaExceeded) {
            console.warn('Quota exceeded, using fallback suggestion');
            return getRandomFallbackSuggestion();
        }

        const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_NAME });

        // Increment quota count
        await incrementQuotaCount();
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return response;

    } catch (error: any) {
        console.error('Error with Gemini API:', error);
        
        // Handle specific quota exceeded error
        if (error.message?.includes('Quota exceeded') ||
            error.message?.includes('RATE_LIMIT_EXCEEDED') ||
            error.message?.includes('429')) {
            console.warn('Quota exceeded, using fallback suggestion');
            return getRandomFallbackSuggestion();
        }

        // Handle model not found error
        if (error.message?.includes('404') ||
            error.message?.includes('not found') ||
            error.message?.includes('not supported')) {
            console.error('Model not supported, using fallback suggestion');
            return getRandomFallbackSuggestion();
        }

        // Handle other API errors
        if (error.message?.includes('API key') ||
            error.message?.includes('authentication')) {
            throw new Error('API configuration error. Please check your settings.');
        }
        
        // For any other error, use fallback if enabled
        if (AI_CONFIG.ENABLE_FALLBACK) {
            console.warn('API error, using fallback suggestion:', error.message);
            return getRandomFallbackSuggestion();
        }

        // If fallback is disabled, throw the error
        throw error;
    }
};
