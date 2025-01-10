/* eslint-disable @typescript-eslint/no-unused-vars */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Store the access token in AsyncStorage
export const storeAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error storing the access token:', error);
  }
};

// Retrieve the access token from AsyncStorage
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('Error retrieving the access token:', error);
    return null;
  }
};

// Remove the access token from AsyncStorage
export const removeAccessToken = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error removing the access token:', error);
  }
};
