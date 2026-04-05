# Native Notification Actions Implementation

This document explains the native notification action buttons implemented for Firebase notifications in the EduLearn app.

## Overview

Custom notification action buttons have been implemented at the native level for both Android and iOS. When Firebase sends a notification containing an OTP code or a link, the notification will automatically display:

- **Copy OTP Button** - For notifications with OTP codes (4-6 digits)
- **Open Link Button** - For notifications with URLs

## Architecture

### Android Implementation

#### Components Created:

1. **NotificationContentAnalyzer** (`notifications/NotificationContentAnalyzer.kt`)
   - Analyzes notification content using regex patterns
   - Detects OTP codes: `123456`, `1234`, `123-456`, etc.
   - Detects URLs: `https://`, `www.`, domain names

2. **CustomFirebaseMessagingService** (`notifications/CustomFirebaseMessagingService.kt`)
   - Intercepts incoming Firebase messages
   - Analyzes content for OTP and links
   - Creates notification with appropriate actions
   - Manages notification channels for Android 8+

3. **NotificationActionReceiver** (`notifications/NotificationActionReceiver.kt`)
   - BroadcastReceiver for action button clicks
   - Handles "Copy OTP" action → Copies to clipboard
   - Handles "Open Link" action → Opens URL in browser
   - Shows toast feedback to user

#### AndroidManifest.xml Changes:
- Registered `CustomFirebaseMessagingService` with Firebase messaging intent filter
- Registered `NotificationActionReceiver` for action broadcasts

### iOS Implementation

#### Components Created:

1. **NotificationHandler.swift** (`NotificationHandler.swift`)
   - `NotificationContentAnalyzer` class
     - Same regex patterns as Android
     - Extracts OTP and links from notification text
   - `NotificationDelegateHandler` class
     - Implements `UNUserNotificationCenterDelegate`
     - Handles notification taps and custom actions
     - Copies OTP to pasteboard
     - Opens links using `UIApplication.openURL()`

2. **AppDelegate.swift Updates** (`AppDelegate.swift`)
   - Requests user notification permissions on app launch
   - Registers for remote notifications
   - Sets up `UNNotificationCategory` and `UNNotificationAction` objects
   - Handles device token registration
   - Implements notification delegate methods

## Notification Content Analysis

### OTP Detection Patterns

The system detects these OTP formats:

```
6 digits:     123456
4 digits:     1234
Hyphenated:   123-456, 123-4567
Spaced:       1 2 3 4 5 6 (will be converted to 123456)
```

### Link Detection Patterns

The system detects:

```
Full URLs:    https://example.com, http://example.com
WWW URLs:     www.example.com (converts to https://www.example.com)
Domain URLs:  example.com/path
```

## How to Send Notifications from Backend

### Using Firebase Cloud Messaging (FCM)

#### Example: OTP Notification

```json
{
  "notification": {
    "title": "Verification Code",
    "body": "Your one-time password is: 123456"
  },
  "data": {
    "type": "otp",
    "action": "verify"
  },
  "android": {
    "priority": "high"
  },
  "apns": {
    "headers": {
      "apns-priority": "10"
    }
  }
}
```

When received:
- ✅ "Copy OTP" button will appear automatically
- ✅ User can tap to copy `123456` to clipboard
- ✅ Toast "OTP copied to clipboard" shows briefly

---

#### Example: Link Notification

```json
{
  "notification": {
    "title": "Verify Your Account",
    "body": "Please verify your account: https://app.example.com/verify?token=abc123"
  },
  "data": {
    "type": "verification",
    "action": "open_link"
  },
  "android": {
    "priority": "high"
  },
  "apns": {
    "headers": {
      "apns-priority": "10"
    }
  }
}
```

When received:
- ✅ "Open Link" button will appear automatically
- ✅ User can tap to open the URL in default browser

---

#### Example: Combined OTP + Link Notification

```json
{
  "notification": {
    "title": "Complete Verification",
    "body": "Your code is 654321. Verify here: https://verify.example.com/code=654321"
  },
  "data": {
    "type": "complete_verification"
  },
  "android": {
    "priority": "high"
  },
  "apns": {
    "headers": {
      "apns-priority": "10"
    }
  }
}
```

When received:
- ✅ Both "Copy OTP" and "Open Link" buttons will appear
- ✅ Up to 2 links will have "Open Link" actions

---

## User Experience Flow

### Android
1. User receives push notification in system notification tray
2. Two action buttons appear below notification
3. **Tap "Copy OTP"** → OTP copied to clipboard, toast appears
4. **Tap "Open Link"** → Browser opens with the URL
5. **Tap notification** → App opens and receives notification data

### iOS
1. User receives push notification badge
2. User pulls down notification center or taps notification
3. Action buttons appear on notification
4. **Tap "Copy OTP"** → OTP copied to pasteboard
5. **Tap "Open Link"** → Safari opens with the URL
6. **Tap notification area** → App opens and navigates

## Technical Details

### Android
- **Notification ID**: Random 4-digit ID to ensure uniqueness
- **Pending Intent Flags**: `FLAG_UPDATE_CURRENT | FLAG_IMMUTABLE` (Android 12+)
- **Channel**: Creates "edulearn_notifications" channel with HIGH importance
- **Max Actions**: 2 link actions (Android limitation)

### iOS
- **Notification Categories**: Three categories registered
  - `OTP_NOTIFICATION` - Has Copy OTP action
  - `LINK_NOTIFICATION` - Has Open Link action
  - `COMBINED_NOTIFICATION` - Has both actions
- **Delegate Pattern**: `NotificationDelegateHandler` handles all notification events
- **Pasteboard**: Uses `UIPasteboard.general` for clipboard operations

## Error Handling

### If Copy OTP Fails
- **Android**: Shows "Cannot copy to clipboard" toast
- **iOS**: Shows alert with error message

### If Open Link Fails
- **Android**: Shows "Cannot open link" toast
- **iOS**: Shows alert with error message

### If OTP/Link Not Detected
- Buttons simply won't appear
- Standard notification behavior applies

## Testing

### Testing OTP Detection
1. Send notification body: `"Your code is 123456"`
2. Should see "Copy OTP" button
3. Tap it → Should copy "123456"

### Testing Link Detection
1. Send notification body: `"Visit https://example.com"`
2. Should see "Open Link" button
3. Tap it → Should open in browser

### Testing Both
1. Send notification body: `"Code: 789456 Verify: https://app.example.com/verify"`
2. Should see both buttons
3. Both should work correctly

## Debugging

### Android Logcat
```bash
# Search for custom Firebase logs
adb logcat | grep "CustomFCM"
adb logcat | grep "NOTIFICATION"
```

### iOS Console
```
Search for logs containing:
- "[iOS Notification]"
- "[iOS Notifications]"
```

## Limitations

1. **Android**: Only first 2 links will have action buttons (system limitation)
2. **iOS**: Notification actions are only visible when notification is expanded
3. **Both**: OTP must be 4-6 digits for reliable detection
4. **Both**: Links must have proper format (http://, https://, or www.)

## Future Enhancements

Potential improvements:
- [ ] Add phone number detection for calling
- [ ] Add email detection for mailto links
- [ ] Add custom notification icons per type
- [ ] Add vibration patterns for critical OTPs
- [ ] Add do-not-disturb mode handling
- [ ] Add notification grouping
- [ ] Add action analytics

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify notification body contains OTP/link in expected format
3. Ensure Firebase messaging is properly configured
4. Check device has notifications enabled in system settings
