/**
 * Device Token Registration Service
 * Handles Firebase device token registration with the notifications microservice
 */

import axios from 'axios';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@state/useAuthStore';
import DeviceInfo from 'react-native-device-info';
import { getConfigValue } from '../config/envConfig';

// Notification Service Base URL from config
const SOCIAL_API_URL = getConfigValue('SOCIAL_API_URL');
const DEVICE_TOKEN_ENDPOINT = '/notifications/device-token';

/**
 * Interface for device token registration request
 */
export interface DeviceTokenPayload {
  token: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
}

/**
 * Interface for device token registration response
 */
export interface DeviceTokenResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    _id: string;
    userUUID: string;
    token: string;
    deviceType: string;
    deviceName?: string;
    osVersion?: string;
    appVersion?: string;
    isInvalid: boolean;
    lastUsed: string;
    createdAt: string;
  };
}

/**
 * Get device information using react-native-device-info
 */
export const getDeviceInfo = async () => {
  console.log('[DEVICE_TOKEN] 📋 Getting device information...');
  
  const deviceType = Platform.select<'ios' | 'android' | 'web'>({
    ios: 'ios',
    android: 'android',
    web: 'web',
  });

  const deviceName = await DeviceInfo.getDeviceName();
  const osVersion = Platform.select({
    ios: `iOS ${Platform.Version}`,
    android: `Android ${Platform.Version}`,
    web: 'Web',
  });

  const appVersion = await DeviceInfo.getVersion();

  console.log('[DEVICE_TOKEN] 📋 Device info collected:', {
    deviceType,
    deviceName,
    osVersion,
    appVersion,
  });

  return {
    deviceType: deviceType as 'ios' | 'android' | 'web',
    deviceName,
    osVersion,
    appVersion,
  };
};

/**
 * Register device token with the notifications microservice
 * @param token - Firebase Cloud Messaging token
 * @param authToken - Bearer token for authentication
 * @returns Promise with registration response
 */
export const registerDeviceToken = async (
  token: string,
  authToken: string
): Promise<DeviceTokenResponse> => {
  try {
    console.log('[DEVICE_TOKEN] 🚀 Starting device token registration...');
    console.log('[DEVICE_TOKEN] 🔑 Auth token:', authToken.substring(0, 15) + '...');
    
    if (!token) {
      throw new Error('Device token is required');
    }

    if (!authToken) {
      throw new Error('Authentication token is required');
    }

    console.log('[DEVICE_TOKEN] 📱 Getting device information...');
    const deviceInfo = await getDeviceInfo();

    const payload: DeviceTokenPayload = {
      token,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      osVersion: deviceInfo.osVersion,
      appVersion: deviceInfo.appVersion,
    };

    console.log('[DEVICE_TOKEN] 📤 Preparing request payload:', {
      token: token.substring(0, 30) + '...',
      deviceType: payload.deviceType,
      deviceName: payload.deviceName,
      osVersion: payload.osVersion,
      appVersion: payload.appVersion,
    });

    const apiUrl = `${SOCIAL_API_URL}${DEVICE_TOKEN_ENDPOINT}`;
    console.log('[DEVICE_TOKEN] 🌐 API Endpoint:', apiUrl);
    console.log('[DEVICE_TOKEN] 📨 Sending POST request...');

    const response = await axios.post<DeviceTokenResponse>(
      apiUrl,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('[DEVICE_TOKEN] ✅ Registration successful!');
    console.log('[DEVICE_TOKEN] 📥 Response:', {
      status: response.data.status,
      message: response.data.message,
      userUUID: response.data.data?.userUUID,
      tokenId: response.data.data?._id,
      createdAt: response.data.data?.createdAt,
    });

    console.log('[DEVICE_TOKEN] 💾 Saving token to local storage...');
    await saveCurrentDeviceToken(token);
    console.log('[DEVICE_TOKEN] ✅ Token saved to AsyncStorage');

    return response.data;
  } catch (error: any) {
    console.error('[DEVICE_TOKEN] ❌ Error during registration:', error.message);
    
    if (error.response) {
      console.error('[DEVICE_TOKEN] 🔴 API Error:', {
        status: error.response.status,
        message: error.response.data?.message,
        errorDetails: error.response.data,
      });
    } else if (error.request) {
      console.error('[DEVICE_TOKEN] 🔴 No response from server:', error.request);
    } else {
      console.error('[DEVICE_TOKEN] 🔴 Error details:', error);
    }

    if (error.response?.status === 401) {
      console.error('[DEVICE_TOKEN] 🔐 Authentication failed - invalid or expired token');
      throw new Error('Authentication failed. Please log in again.');
    }

    if (error.response?.status === 400) {
      console.error('[DEVICE_TOKEN] ❌ Bad request:', error.response.data?.message);
      throw new Error(error.response.data?.message || 'Invalid device token format');
    }

    throw error;
  }
};

/**
 * Get Firebase Cloud Messaging token
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  try {
    console.log('[DEVICE_TOKEN] 🔄 Requesting Firebase token from FCM...');
    const token = await messaging().getToken();
    console.log('[DEVICE_TOKEN] 🎟️ Firebase Token obtained:', token.substring(0, 30) + '...');
    return token;
  } catch (error) {
    console.error('[DEVICE_TOKEN] ❌ Error getting Firebase token:', error);
    return null;
  }
};

/**
 * Check if Firebase messaging is authorized
 */
export const checkMessagingPermission = async (): Promise<boolean> => {
  try {
    console.log('[DEVICE_TOKEN] 🔐 Checking Firebase messaging permissions...');
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    console.log('[DEVICE_TOKEN] 🔐 Firebase Messaging Status:', {
      status: authStatus,
      enabled,
      statusName: authStatus === 1 ? 'AUTHORIZED' : authStatus === 0 ? 'DENIED' : 'PROVISIONAL',
    });
    return enabled;
  } catch (error) {
    console.error('[DEVICE_TOKEN] ❌ Error checking messaging permission:', error);
    return false;
  }
};

/**
 * Save current device token to AsyncStorage to avoid re-registering
 */
export const saveCurrentDeviceToken = async (token: string) => {
  try {
    console.log('[DEVICE_TOKEN] 💾 Saving token to AsyncStorage...');
    await AsyncStorage.setItem('currentDeviceToken', token);
    console.log('[DEVICE_TOKEN] ✅ Token saved successfully');
  } catch (error) {
    console.warn('[DEVICE_TOKEN] ⚠️ Could not save device token to storage:', error);
  }
};

/**
 * Get previously saved device token from AsyncStorage
 */
export const getSavedDeviceToken = async (): Promise<string | null> => {
  try {
    console.log('[DEVICE_TOKEN] 🔍 Retrieving saved token from AsyncStorage...');
    const savedToken = await AsyncStorage.getItem('currentDeviceToken');
    console.log('[DEVICE_TOKEN] 📥 Saved token retrieved:', savedToken ? savedToken.substring(0, 30) + '...' : 'No saved token');
    return savedToken;
  } catch (error) {
    console.warn('[DEVICE_TOKEN] ⚠️ Could not retrieve saved device token:', error);
    return null;
  }
};

/**
 * Check if we need to register a new device token
 * (only if token changed)
 */
export const shouldRegisterNewToken = async (newToken: string): Promise<boolean> => {
  console.log('[DEVICE_TOKEN] 🔄 Checking if token needs registration...');
  const savedToken = await getSavedDeviceToken();
  const shouldRegister = savedToken !== newToken;
  console.log('[DEVICE_TOKEN] 📊 Token comparison:', {
    newToken: newToken.substring(0, 30) + '...',
    savedToken: savedToken ? savedToken.substring(0, 30) + '...' : 'none',
    shouldRegister,
  });
  return shouldRegister;
};

/**
 * Register device token using auth from store
 * This is the main function to call from your app
 */
export const registerDeviceTokenWithAuth = async (token: string): Promise<boolean> => {
  try {
    console.log('[DEVICE_TOKEN] 🚀 Starting token registration with auth...');
    
    console.log('[DEVICE_TOKEN] 🔑 Retrieving auth token from storage...');
    const authToken = await AsyncStorage.getItem('accessToken');

    if (!authToken) {
      console.warn('[DEVICE_TOKEN] ⚠️ No auth token available. Device token registration skipped.');
      console.warn('[DEVICE_TOKEN] ⏰ Device token will be registered after user logs in.');
      return false;
    }
    console.log('[DEVICE_TOKEN] ✅ Auth token found:', authToken.substring(0, 15) + '...');

    console.log('[DEVICE_TOKEN] � Sending device token to backend...');
    const response = await registerDeviceToken(token, authToken);

    if (response.status === 'success') {
      console.log('[DEVICE_TOKEN] ✅ Firebase device token registered successfully with user:', response.data?.userUUID);
      return true;
    } else {
      console.error('[DEVICE_TOKEN] ❌ Failed to register device token:', response.message);
      return false;
    }
  } catch (error) {
    console.error('[DEVICE_TOKEN] ❌ Error in registerDeviceTokenWithAuth:', error);
    return false;
  }
};

/**
 * Handle new token from Firebase
 * Call this when Firebase returns a new token
 */
export const handleNewDeviceToken = async (token: string) => {
  try {
    console.log('[DEVICE_TOKEN] 📲 New Firebase token received:', token.substring(0, 30) + '...');

    console.log('[DEVICE_TOKEN] 🔍 Checking if token needs registration...');
    const shouldRegister = await shouldRegisterNewToken(token);

    if (!shouldRegister) {
      console.log('[DEVICE_TOKEN] ⏭️ Token already registered. Skipping...');
      return;
    }

    console.log('[DEVICE_TOKEN] 🆕 New token detected. Starting registration flow...');
    const success = await registerDeviceTokenWithAuth(token);

    if (!success) {
      console.warn('[DEVICE_TOKEN] ⚠️ Could not register new device token. Will retry on next app launch.');
    } else {
      console.log('[DEVICE_TOKEN] 🎉 Device token registration completed successfully!');
    }
  } catch (error) {
    console.error('[DEVICE_TOKEN] ❌ Error in handleNewDeviceToken:', error);
  }
};

/**
 * Retry registration for all stored tokens
 * Useful if previous registrations failed
 */
export const retryDeviceTokenRegistration = async (token: string) => {
  try {
    console.log('[DEVICE_TOKEN] 🔄 Retrying device token registration...');
    const success = await registerDeviceTokenWithAuth(token);
    console.log('[DEVICE_TOKEN] 📊 Retry result:', success ? '✅ Success' : '❌ Failed');
    return success;
  } catch (error) {
    console.error('[DEVICE_TOKEN] ❌ Error retrying device token registration:', error);
    throw error;
  }
};
