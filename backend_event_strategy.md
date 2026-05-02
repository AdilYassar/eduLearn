# Backend Event-Driven Strategy for Real-Time Social Updates

To achieve immediate updates on the frontend without using WebSockets, we will leverage **Firebase Cloud Messaging (FCM) Data Messages**. Unlike regular notifications, data messages are handled by the app's JavaScript layer immediately, allowing us to update the UI in real-time.

## 1. Core Concept: Silent Data Messages
Instead of just sending a "visual notification" which the OS handles, the backend will send a **Data-Only payload**. 
- **Notification Message**: Triggers a system popup.
- **Data Message**: Triggers a callback in the app's JavaScript (even in foreground).

## 2. Standardized Event Payload
Every social event should follow a consistent data structure:

```json
{
  "data": {
    "type": "SOCIAL_EVENT",
    "subType": "MESSAGE_RECEIVED | FRIEND_REQUEST | POST_CREATED | NOTIFICATION",
    "payload": "{ \"id\": \"123\", \"content\": \"...\" }", // JSON stringified object
    "sentAt": "2024-04-27T..."
  }
}
```

## 3. Implementation in Microservices

### A. Chatting Microservice (`ChatService.sendMessage`)
When a message is sent, call the notification service with a `data` block.

```javascript
// src/services/chat.service.js
async sendMessage(...) {
    // ... save message ...
    
    // Trigger Data Message
    await firebaseNotificationService.sendDataToUser(recipientUUID, {
        subType: 'MESSAGE_RECEIVED',
        payload: JSON.stringify({
            conversationId,
            message: messageObject
        })
    });
}
```

### B. Friends Microservice (`FriendService.sendRequest`)
```javascript
// src/services/friends.service.js
async sendRequest(...) {
    // ... save request ...
    
    await firebaseNotificationService.sendDataToUser(recipientUUID, {
        subType: 'FRIEND_REQUEST_RECEIVED',
        payload: JSON.stringify(requestObject)
    });
}
```

### C. Feed Microservice (Post Creation)
When a user creates a post, broadcast an event to their friends.

```javascript
// src/services/feed.service.js
async createPost(...) {
    // ... save post ...
    
    // Broadcast to friends
    await firebaseNotificationService.broadcastToFriends(userUUID, {
        subType: 'NEW_POST',
        payload: JSON.stringify(postObject)
    });
}
```

## 4. Enhanced `FirebaseNotificationService`
Update your service to support data-only messages.

```javascript
// src/services/firebase-notification.service.js
async sendDataToUser(recipientUUID, eventData) {
    const tokens = await deviceTokenRepository.findValidTokens(recipientUUID);
    
    const message = {
        data: {
            ...eventData,
            isSilent: 'true' 
        },
        android: { priority: 'high' },
        apns: { payload: { aps: { 'content-available': 1 } } }
    };

    return messaging.sendEachForMulticast({ tokens, ...message });
}
```

## 5. Event Flow Diagram
1. **Action**: User A sends message.
2. **Backend**: Saves to MongoDB.
3. **Event**: Backend triggers `firebaseNotificationService`.
4. **Transport**: FCM sends Data Message to User B's device.
5. **Frontend**: App receives data -> Emits local event -> UI Updates.
