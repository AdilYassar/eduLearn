import messaging from '@react-native-firebase/messaging';
import { DeviceEventEmitter } from 'react-native';

/**
 * Standardized Social Event Object
 */
export interface SocialEvent {
  type: string;
  subType: 'MESSAGE_RECEIVED' | 'FRIEND_REQUEST_RECEIVED' | 'FRIEND_ACCEPTED' | 'POST_CREATED' | 'NOTIFICATION_RECEIVED';
  payload: string; // JSON string
  sentAt: string;
}

/**
 * Setup listeners for social events via FCM Data Messages.
 * These are "silent" messages that trigger local UI updates.
 */
export const setupSocialEventListeners = () => {
  console.log('[SOCIAL_EVENTS] 📡 Setting up social event listeners...');
  
  // 1. Foreground listener
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log('[SOCIAL_EVENTS] 📬 Foreground Data Message:', remoteMessage.data);
    
    if (remoteMessage.data?.type === 'SOCIAL_EVENT') {
       const eventData: SocialEvent = {
         type: remoteMessage.data.type,
         subType: remoteMessage.data.subType as any,
         payload: remoteMessage.data.payload,
         sentAt: remoteMessage.data.sentAt,
       };

       // Broadcast locally to any UI components listening
       DeviceEventEmitter.emit('social_event', eventData);
       console.log(`[SOCIAL_EVENTS] 📢 Emitted local event: ${eventData.subType}`);
    }
  });

  // 2. Background/Quit state handler (Static listener)
  // This is usually handled in index.js via setBackgroundMessageHandler
  // but we can ensure it's registered here if needed.
  
  return () => {
    unsubscribeOnMessage();
  };
};

/**
 * Helper to subscribe to social events within a component
 */
export const useSocialEventListener = (callback: (event: SocialEvent) => void) => {
  const subscription = DeviceEventEmitter.addListener('social_event', callback);
  return () => subscription.remove();
};
