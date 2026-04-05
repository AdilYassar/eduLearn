/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

/**
 * Background message handler - handles notifications when app is closed or backgrounded
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FIREBASE_BACKGROUND] 📬 Message received in background/quit state');
  console.log('[FIREBASE_BACKGROUND] Notification:', remoteMessage.notification);
  console.log('[FIREBASE_BACKGROUND] Data:', remoteMessage.data);
  // Message should be handled by the notification tray
  // Firebase will automatically display the notification
});

AppRegistry.registerComponent(appName, () => App);
