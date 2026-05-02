# Frontend Event-Driven Strategy for Real-Time Social Updates

To handle real-time updates immediately when they happen on the backend, the frontend must listen for **FCM Data Messages** and broadcast them locally to relevant UI components.

## 1. Global Event Listener
We need a central place (e.g., `App.tsx` or a dedicated `SocialEventsProvider`) to listen for incoming Firebase messages.

```tsx
// src/service/socialEventsHandler.ts
import messaging from '@react-native-firebase/messaging';
import { DeviceEventEmitter } from 'react-native';

export const setupSocialEventListeners = () => {
  // Foreground listener
  messaging().onMessage(async remoteMessage => {
    console.log('New Social Event:', remoteMessage.data);
    
    if (remoteMessage.data?.type === 'SOCIAL_EVENT') {
       // Broadcast locally
       DeviceEventEmitter.emit('social_event', remoteMessage.data);
    }
  });

  // Background/Quit state listener
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    // Note: This runs in its own JS context
    console.log('Social Event in Background:', remoteMessage.data);
  });
};
```

## 2. Component-Level Handling
Each social component should subscribe to the `social_event` and react based on the `subType`.

### A. Conversations List (`ConversationsList.tsx`)
```tsx
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
    if (event.subType === 'MESSAGE_RECEIVED') {
      // Option 1: Trigger a refetch if using React Query
      queryClient.invalidateQueries(['conversations']);
      
      // Option 2: Manually update local state if needed
      const payload = JSON.parse(event.payload);
      updateConversationLastMessage(payload.conversationId, payload.message);
    }
  });
  return () => subscription.remove();
}, []);
```

### B. Message Bubble / Chat Screen (`MessageBubble.tsx`)
```tsx
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
    if (event.subType === 'MESSAGE_RECEIVED') {
      const payload = JSON.parse(event.payload);
      if (payload.conversationId === activeConversationId) {
        // Append message to current chat immediately
        setMessages(prev => [...prev, payload.message]);
      }
    }
  });
  return () => subscription.remove();
}, [activeConversationId]);
```

### C. Friend Requests (`FriendRequests.tsx`)
```tsx
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
    if (event.subType === 'FRIEND_REQUEST_RECEIVED') {
      // Show local toast and refresh list
      showToast('New Friend Request!');
      refreshFriendRequests();
    }
  });
  return () => subscription.remove();
}, []);
```

## 3. Recommended Event Names
Use these constants for consistency:
- `MESSAGE_RECEIVED`: New chat message.
- `FRIEND_REQUEST_RECEIVED`: Someone added you.
- `FRIEND_ACCEPTED`: Friend request approved.
- `POST_CREATED`: Someone you follow posted.
- `NOTIFICATION_RECEIVED`: General notification update.

## 4. Why This Works
1. **Immediate**: FCM delivers the message in milliseconds.
2. **No Polling**: The app doesn't waste battery asking "is there new data?".
3. **No Sockets**: No persistent connection to manage, no "reconnecting..." issues.
4. **Decoupled**: Components only listen for what they care about.
