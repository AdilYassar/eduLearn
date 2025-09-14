/* eslint-disable @typescript-eslint/no-unused-vars */
import { Platform } from 'react-native';
import {
  requestMultiple,
  PERMISSIONS,
  RESULTS,
  request,
  PermissionStatus,
  Permission,
} from 'react-native-permissions';

type PermissionsResult = Record<Permission, PermissionStatus>;

export const requestPermissions = async (): Promise<{
  isCameraGranted: boolean;
  isMicrophoneGranted: boolean;
}> => {
  try {
    console.log('🔐 Requesting permissions...');
    const permissionsToRequest =
      Platform.OS === 'ios'
        ? [
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE,
          ]
        : [
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
            // Removed READ_EXTERNAL_STORAGE as it's not needed for WebRTC
            // and can cause permission issues on newer Android versions
          ];

    console.log('📱 Platform:', Platform.OS);
    console.log('🔑 Requesting permissions:', permissionsToRequest);

    const results = await requestMultiple(permissionsToRequest);
    console.log('📋 Raw permission results:', results);

    for (const [permission, status] of Object.entries(results)) {
      logPermissionStatus(permission as Permission, status as PermissionStatus);
    }

    const isCameraGranted =
      Platform.OS === 'ios'
        ? results[PERMISSIONS.IOS.CAMERA] === RESULTS.GRANTED
        : results[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED;

    const isMicrophoneGranted =
      Platform.OS === 'ios'
        ? results[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED
        : results[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED;

    const result = { isCameraGranted, isMicrophoneGranted };
    console.log('✅ Final permission result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error requesting permissions:', error);
    return { isCameraGranted: false, isMicrophoneGranted: false };
  }
};

const logPermissionStatus = (permission: Permission, status: PermissionStatus): void => {
  if (status === RESULTS.GRANTED) {
    console.log(`${permission} PERMISSION GRANTED ✅`);
  } else if (status === RESULTS.DENIED) {
    console.log(`${permission} PERMISSION DENIED ❌`);
  } else if (status === RESULTS.BLOCKED) {
    console.log(`${permission} PERMISSION BLOCKED 🚫`);
  } else {
    console.log(`${permission} PERMISSION STATUS: ${status}`);
  }
};

export const addHyphens = (str: string | null | undefined): string | undefined => {
  return str?.replace(/(.{3})(?=.)/g, '$1-');
};

export const removeHyphens = (str: string | null | undefined): string | undefined => {
  return str?.replace(/-/g, '');
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permissionToRequest =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const status = await request(permissionToRequest);

    logPermissionStatus(permissionToRequest, status);

    return status === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permissionToRequest =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const status = await request(permissionToRequest);

    logPermissionStatus(permissionToRequest, status);

    return status === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
};

export const peerConstraints = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const sessionConstraints = {
  mandatory: {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true,
    VoiceActivityDetection: true,
  },
};