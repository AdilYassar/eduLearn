import AsyncStorage from '@react-native-async-storage/async-storage';

interface QuotaInfo {
  requestCount: number;
  lastResetTime: number;
  isQuotaExceeded: boolean;
}

const QUOTA_STORAGE_KEY = 'gemini_quota_info';
const QUOTA_RESET_INTERVAL = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 5;

export const getQuotaInfo = async (): Promise<QuotaInfo> => {
  try {
    const storedInfo = await AsyncStorage.getItem(QUOTA_STORAGE_KEY);
    if (!storedInfo) {
      return {
        requestCount: 0,
        lastResetTime: Date.now(),
        isQuotaExceeded: false,
      };
    }

    const quotaInfo: QuotaInfo = JSON.parse(storedInfo);
    const currentTime = Date.now();

    // Reset quota if interval has passed
    if (currentTime - quotaInfo.lastResetTime >= QUOTA_RESET_INTERVAL) {
      const resetInfo: QuotaInfo = {
        requestCount: 0,
        lastResetTime: currentTime,
        isQuotaExceeded: false,
      };
      await AsyncStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(resetInfo));
      return resetInfo;
    }

    return quotaInfo;
  } catch (error) {
    console.error('Error reading quota info:', error);
    return {
      requestCount: 0,
      lastResetTime: Date.now(),
      isQuotaExceeded: false,
    };
  }
};

export const incrementQuotaCount = async (): Promise<QuotaInfo> => {
  const currentInfo = await getQuotaInfo();
  const newCount = currentInfo.requestCount + 1;
  
  const updatedInfo: QuotaInfo = {
    ...currentInfo,
    requestCount: newCount,
    isQuotaExceeded: newCount >= MAX_REQUESTS_PER_MINUTE,
  };

  await AsyncStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(updatedInfo));
  return updatedInfo;
};

export const getTimeUntilQuotaReset = async (): Promise<number> => {
  const quotaInfo = await getQuotaInfo();
  const currentTime = Date.now();
  const timePassed = currentTime - quotaInfo.lastResetTime;
  const timeRemaining = Math.max(0, QUOTA_RESET_INTERVAL - timePassed);
  
  return Math.ceil(timeRemaining / 1000); // Return in seconds
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) {
    return '0s';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
};
