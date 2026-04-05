/**
 * Device Token Registration Service
 * Handles Firebase device token registration with the shared DB via social microservice
 */

import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { getConfigValue } from "../config/envConfig";

// Base URL from config
const BASE_URL = getConfigValue("BASE_URL");
const DEVICE_TOKEN_ENDPOINT = "/api/device/register";

/**
 * Interface for device token registration request
 */
export interface DeviceTokenPayload {
  userUUID: string;
  deviceToken: string;
  deviceName: string;
  deviceType: string;
}

/**
 * Interface for device token registration response
 */
export interface DeviceTokenResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Register device token with the shared DB via fetch
 * @param token - Firebase Cloud Messaging token
 * @param uuid - User UUID from registration
 * @returns Promise with registration response
 */
export const registerDeviceToken = async (
  token: string,
  uuid: string
): Promise<DeviceTokenResponse> => {
  const apiUrl = `${BASE_URL}${DEVICE_TOKEN_ENDPOINT}`;
  console.log("[DEVICE_TOKEN] \ud83d\ude80 Starting registration with CORRECTED fields...");

  try {
    const deviceName = await DeviceInfo.getDeviceName();
    const deviceType = Platform.OS; // 'ios' or 'android'

    const payload: DeviceTokenPayload = {
      userUUID: uuid,
      deviceToken: token,
      deviceName: deviceName || "Unknown Device",
      deviceType: deviceType,
    };

    console.log("[DEVICE_TOKEN] \ud83d\udce4 Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { message: "Non-JSON response received", raw: responseText };
    }

    console.log(`[DEVICE_TOKEN] \ud83d\udce5 STATUS: ${status}`);
    console.log("[DEVICE_TOKEN] \ud83d\udce5 FULL BODY:", JSON.stringify(result, null, 2));

    if (response.ok) {
        console.log("[DEVICE_TOKEN] \u2705 Success!");
        return result;
    } else {
        throw new Error(result.message || "Device registration failed");
    }
  } catch (error: any) {
    console.error("[DEVICE_TOKEN] \ud83d\udea8 ERROR:", error.message);
    throw error;
  }
};

/**
 * Get Firebase Cloud Messaging token
 */
export const getFirebaseToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error("[DEVICE_TOKEN] \u274c FCM Token Error:", error);
    return null;
  }
};

/**
 * Check Firebase messaging permissions
 */
export const checkMessagingPermission = async (): Promise<boolean> => {
  try {
    const authorizationStatus = await messaging().requestPermission();
    const granted =
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log("[PERMISSIONS] Firebase messaging permission status:", authorizationStatus);
    return granted;
  } catch (error) {
    console.error("[PERMISSIONS] Error requesting Firebase permission:", error);
    return false;
  }
};

/**
 * Register device token with authenticated user
 */
export const registerDeviceTokenWithAuth = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: token,
        deviceName: await DeviceInfo.getDeviceName() || 'Unknown Device',
        deviceType: Platform.OS,
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('[AUTH_DEVICE_TOKEN] ✅ Device token registered with auth');
      return true;
    } else {
      console.error('[AUTH_DEVICE_TOKEN] ❌ Failed:', result.message);
      return false;
    }
  } catch (error: any) {
    console.error('[AUTH_DEVICE_TOKEN] Error:', error.message);
    return false;
  }
};

/**
 * Handle new device token (when Firebase refreshes token)
 */
export const handleNewDeviceToken = async (newToken: string): Promise<void> => {
  try {
    console.log('[NEW_TOKEN] 🔄 New Firebase token received. Attempting registration...');
    await registerDeviceTokenWithAuth(newToken);
  } catch (error: any) {
    console.error('[NEW_TOKEN] Error handling new token:', error.message);
  }
};
