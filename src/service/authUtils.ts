import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetAndNavigate } from '@utils/Navigation';
import { BASE_URL } from './config';

/**
 * Complete logout function that clears ALL AsyncStorage data
 * and navigates to the login screen
 */
export const performCompleteLogout = async (): Promise<void> => {
  try {
    console.log('PerformCompleteLogout: Starting complete logout process...');
    
    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('PerformCompleteLogout: Found storage keys:', allKeys);
    
    // Clear ALL data from AsyncStorage
    if (allKeys.length > 0) {
      await AsyncStorage.multiRemove(allKeys);
      console.log('PerformCompleteLogout: Cleared all AsyncStorage data');
    }
    
    // Reset mood to neutral for next login/new user
    await AsyncStorage.setItem('@edulearn_mood', 'neutral');
    console.log('PerformCompleteLogout: Reset mood to neutral');
    
    // Navigate to login screen
    console.log('PerformCompleteLogout: Navigating to LoginScreen');
    resetAndNavigate('LoginScreen');
    
  } catch (error) {
    console.error('PerformCompleteLogout: Error during logout:', error);
    // Even if there's an error, try to navigate to login
    resetAndNavigate('LoginScreen');
  }
};

/**
 * Save authentication data after successful login
 */
export const saveAuthData = async (authData: {
  accessToken: string;
  refreshToken?: string;
  student: any;
}): Promise<void> => {
  try {
    console.log('SaveAuthData: Saving authentication data...');
    
    // Save tokens and user data
    const savePromises = [
      AsyncStorage.setItem('accessToken', authData.accessToken),
      AsyncStorage.setItem('userData', JSON.stringify(authData.student)),
    ];
    
    // Save refresh token if provided
    if (authData.refreshToken) {
      savePromises.push(AsyncStorage.setItem('refreshToken', authData.refreshToken));
    }
    
    await Promise.all(savePromises);
    console.log('SaveAuthData: Authentication data saved successfully');
    
  } catch (error) {
    console.error('SaveAuthData: Error saving auth data:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated by validating stored token
 */
export const checkAuthStatus = async (baseUrl: string): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('CheckAuthStatus: No access token found');
      return false;
    }
    
    console.log('CheckAuthStatus: Validating stored token...');
    
    // Validate token with backend
    const response = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (response.ok) {
      console.log('CheckAuthStatus: Token is valid');
      return true;
    } else {
      console.log('CheckAuthStatus: Token is invalid, clearing storage');
      await performCompleteLogout();
      return false;
    }
    
  } catch (error) {
    console.error('CheckAuthStatus: Error checking auth status:', error);
    await performCompleteLogout();
    return false;
  }
};

/**
 * Refresh access token using stored refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    console.log('RefreshAccessToken: Attempting to refresh access token...');
    
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('RefreshAccessToken: No refresh token found');
      await performCompleteLogout();
      return null;
    }

    const response = await fetch(`${BASE_URL}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (response.ok && result.accessToken) {
      console.log('RefreshAccessToken: Successfully refreshed access token');
      
      // Save new tokens
      const savePromises = [
        AsyncStorage.setItem('accessToken', result.accessToken),
      ];
      
      if (result.refreshToken) {
        savePromises.push(AsyncStorage.setItem('refreshToken', result.refreshToken));
      }
      
      await Promise.all(savePromises);
      return result.accessToken;
    } else {
      console.log('RefreshAccessToken: Failed to refresh token:', result.message);
      await performCompleteLogout();
      return null;
    }
  } catch (error) {
    console.error('RefreshAccessToken: Error refreshing token:', error);
    await performCompleteLogout();
    return null;
  }
};

/**
 * Make authenticated API request with automatic token refresh
 */
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response | null> => {
  try {
    let accessToken = await AsyncStorage.getItem('accessToken');
    
    if (!accessToken) {
      console.log('MakeAuthenticatedRequest: No access token found');
      await performCompleteLogout();
      return null;
    }

    // First attempt with current token
    console.log('MakeAuthenticatedRequest: Making request with current token...');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      console.log('MakeAuthenticatedRequest: Token expired, attempting refresh...');
      
      const newToken = await refreshAccessToken();
      if (newToken) {
        console.log('MakeAuthenticatedRequest: Retrying with new token...');
        
        // Retry with new token
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };

        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });
      } else {
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('MakeAuthenticatedRequest: Error making request:', error);
    return null;
  }
};
