/**
 * useDeviceTokenRegistration Hook
 * Handles Firebase device token registration on app startup and token refresh
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   useDeviceTokenRegistration();
 *   // ... rest of your app
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerDeviceTokenWithAuth,
  handleNewDeviceToken,
  getFirebaseToken,
  checkMessagingPermission,
} from '@service/deviceTokenService';

/**
 * Hook to handle Firebase device token registration
 * Should be called once in your main App component
 */
export const useDeviceTokenRegistration = () => {
  const messageListenerRef = useRef<any>(null);
  const tokenRefreshListenerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeFirebaseMessaging = async () => {
      try {
        console.log('\n[FIREBASE_INIT] 🚀 ========== INITIALIZING FIREBASE MESSAGING ==========');
        console.log('[FIREBASE_INIT] 🔔 Starting Firebase device token registration...\n');

        // 1. Request notification permissions and check authorization
        console.log('[FIREBASE_INIT] Step 1️⃣  Checking Firebase messaging permissions...');
        const isAuthorized = await checkMessagingPermission();
        
        if (!isAuthorized) {
          console.warn('[FIREBASE_INIT] ⚠️ Firebase messaging permissions DENIED. User will NOT receive notifications.');
          return;
        }

        console.log('[FIREBASE_INIT] ✅ Firebase messaging permissions GRANTED\n');

        // 2. Get the Firebase Cloud Messaging token
        console.log('[FIREBASE_INIT] Step 2️⃣  Requesting Firebase Cloud Messaging token...');
        const firebaseToken = await getFirebaseToken();
        
        if (!firebaseToken) {
          console.error('[FIREBASE_INIT] ❌ FAILED to retrieve Firebase token');
          return;
        }

        console.log('[FIREBASE_INIT] ✅ Firebase token obtained\n');

        if (!isMounted) return;

        // 3. Try to register the token with auth service
        console.log('[FIREBASE_INIT] Step 3️⃣  Checking for authentication token...');
        const authToken = await AsyncStorage.getItem('accessToken');
        
        if (authToken) {
          console.log('[FIREBASE_INIT] ✅ Auth token FOUND');
          console.log('[FIREBASE_INIT] Step 4️⃣  Registering Firebase device token with backend...\n');
          await registerDeviceTokenWithAuth(firebaseToken);
        } else {
          console.log('[FIREBASE_INIT] ⏳ No auth token available. Token will be registered AFTER user logs in.');
          console.log('[FIREBASE_INIT] 💾 Saving token as PENDING for later registration...');
          await AsyncStorage.setItem('pendingDeviceToken', firebaseToken);
          console.log('[FIREBASE_INIT] ✅ Pending token SAVED\n');
        }

        // 4. Listen for foreground messages (when app is in focus)
        console.log('[FIREBASE_INIT] Step 5️⃣  Setting up FOREGROUND message listener...');
        if (messageListenerRef.current) {
          messageListenerRef.current();
        }

        messageListenerRef.current = messaging().onMessage(async (remoteMessage) => {
          console.log('[FIREBASE_MESSAGE] 📬 Foreground message received');
          handleForegroundMessage(remoteMessage);
        });
        console.log('[FIREBASE_INIT] ✅ Foreground message listener REGISTERED\n');

        // 5. Listen for notification response (when user taps notification)
        console.log('[FIREBASE_INIT] Step 6️⃣  Setting up NOTIFICATION TAP listener...');
        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log('[FIREBASE_MESSAGE] 👆 User tapped notification');
          if (remoteMessage) {
            handleNotificationResponse(remoteMessage.data);
          }
        });
        console.log('[FIREBASE_INIT] ✅ Notification tap listener REGISTERED\n');

        // 6. Check for notification that launched the app
        console.log('[FIREBASE_INIT] Step 7️⃣  Checking for INITIAL notification...');
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('[FIREBASE_MESSAGE] 🚀 App was LAUNCHED from notification');
          handleNotificationResponse(initialNotification.data);
        } else {
          console.log('[FIREBASE_INIT] ✅ No initial notification\n');
        }

        // 7. Listen for token refresh (when Firebase generates new token)
        console.log('[FIREBASE_INIT] Step 8️⃣  Setting up TOKEN REFRESH listener...');
        if (tokenRefreshListenerRef.current) {
          tokenRefreshListenerRef.current();
        }

        tokenRefreshListenerRef.current = messaging().onTokenRefresh(async (newToken) => {
          console.log('[FIREBASE_MESSAGE] 🔄 Firebase token REFRESHED (new token received)');
          await handleNewDeviceToken(newToken);
        });
        console.log('[FIREBASE_INIT] ✅ Token refresh listener REGISTERED\n');

        console.log('[FIREBASE_INIT] 🎉 ========== FIREBASE MESSAGING INITIALIZED SUCCESSFULLY ==========\n');

      } catch (error) {
        console.error('[FIREBASE_INIT] ❌ ERROR initializing Firebase messaging:', error);
      }
    };

    initializeFirebaseMessaging();

    // Cleanup
    return () => {
      isMounted = false;
      console.log('[FIREBASE_CLEANUP] 🧹 Cleaning up Firebase message listeners...');
      if (messageListenerRef.current) {
        messageListenerRef.current();
        console.log('[FIREBASE_CLEANUP] ✅ Foreground message listener removed');
      }
      if (tokenRefreshListenerRef.current) {
        tokenRefreshListenerRef.current();
        console.log('[FIREBASE_CLEANUP] ✅ Token refresh listener removed');
      }
      console.log('[FIREBASE_CLEANUP] 🧹 Cleanup completed\n');
    };
  }, []);
};

/**
 * Handle foreground message (when app is open and receives notification)
 */
const handleForegroundMessage = (remoteMessage: any) => {
  console.log('[FOREGROUND_MSG] 📨 Processing foreground message');
  const { notification, data } = remoteMessage;

  if (notification) {
    console.log('[FOREGROUND_MSG] 📨 Notification:', {
      title: notification.title,
      body: notification.body,
    });
  }

  if (data) {
    console.log('[FOREGROUND_MSG] 📋 Message Data:', data);
  }
};

/**
 * Handle notification response when user taps on a notification
 */
const handleNotificationResponse = (data: any) => {
  console.log('[NOTIFICATION_RESPONSE] 👆 User tapped notification. Processing data...');

  if (!data) {
    console.warn('[NOTIFICATION_RESPONSE] ⚠️ No data in notification');
    return;
  }

  console.log('[NOTIFICATION_RESPONSE] 📋 Notification Type:', data.type);
  console.log('[NOTIFICATION_RESPONSE] 📋 Notification Data:', data);

  // Example handling based on notification type
  switch (data.type) {
    case 'quiz':
      console.log('[NOTIFICATION_RESPONSE] ✏️ Opening Quiz:', data.quizId);
      // TODO: Navigate to quiz screen
      // navigation.navigate('QuizScreen', { quizId: data.quizId });
      break;
    case 'message':
      console.log('[NOTIFICATION_RESPONSE] 💬 Opening Chat:', data.conversationId);
      // TODO: Navigate to chat screen
      // navigation.navigate('ChatScreen', { conversationId: data.conversationId });
      break;
    case 'friend_request':
      console.log('[NOTIFICATION_RESPONSE] 👥 Opening Friend Requests');
      // TODO: Navigate to friend requests screen
      // navigation.navigate('FriendsScreen', { tab: 'requests' });
      break;
    default:
      console.warn('[NOTIFICATION_RESPONSE] ⚠️ Unknown notification type:', data.type);
  }
};

/**
 * Register pending device token after user logs in
 * Call this in your login/auth success handler
 */
export const registerPendingDeviceToken = async () => {
  try {
    console.log('[PENDING_TOKEN] 🔄 Checking for PENDING device token registration...');
    
    const pendingToken = await AsyncStorage.getItem('pendingDeviceToken');
    
    if (!pendingToken) {
      console.log('[PENDING_TOKEN] ✅ No pending tokens found');
      return;
    }

    console.log('[PENDING_TOKEN] 📲 Found pending token! Registering now...');
    console.log('[PENDING_TOKEN] 📲 Token:', pendingToken.substring(0, 30) + '...');
    
    const success = await registerDeviceTokenWithAuth(pendingToken);

    if (success) {
      console.log('[PENDING_TOKEN] ✅ Pending device token REGISTERED successfully');
      console.log('[PENDING_TOKEN] 🗑️ Removing pending token from storage...');
      await AsyncStorage.removeItem('pendingDeviceToken');
      console.log('[PENDING_TOKEN] ✅ Pending token REMOVED from storage');
    } else {
      console.warn('[PENDING_TOKEN] ⚠️ Could NOT register pending token');
    }
  } catch (error) {
    console.error('[PENDING_TOKEN] ❌ Error registering pending device token:', error);
  }
};

export default useDeviceTokenRegistration;
