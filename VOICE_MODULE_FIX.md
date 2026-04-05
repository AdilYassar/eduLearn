# Voice Recognition Module - Fix & Troubleshooting

## Problem Fixed
**Error:** `TypeError: Cannot read property 'startSpeech' of null`

This error was caused by the Voice module not being properly initialized before calling `start()`. The fix implements a proper singleton pattern with correct event listener attachment timing.

## Changes Made

### 1. **Singleton Module Pattern**
- Module is now loaded **once** at app startup instead of getting fresh references
- Prevents race conditions and null reference errors
- Single instance throughout the app lifecycle

### 2. **Event Listeners Attached Before Initialization**
- Event listeners are now attached immediately when Voice module is available
- This ensures the native bridge is ready for `start()` calls
- Removed unnecessary `destroy()` calls that were breaking the native bridge

### 3. **Simplified Start/Stop Logic**
- Removed complex fresh reference retrieval
- Uses the singleton module instance
- Better error handling for null references

## Next Steps

### Step 1: Clear Native Build Cache
Before testing, clear the Android build cache:

```bash
# Windows Command Prompt or PowerShell
cd android
  
# On Windows:
gradlew clean

# Or manually delete:
rmdir /s build
cd app
rmdir /s build
cd ../..
```

### Step 2: Reinstall Dependencies
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Step 3: Rebuild Android App
```bash
# For Android
npx react-native run-android --reset-cache

# Or for production build:
cd android
gradlew assembleRelease
```

## If the Issue Persists

### Option A: Verify Android Linking
The `@react-native-voice/voice` module requires proper Android linking. Verify:

1. **Check `settings.gradle` includes the package:**
   ```gradle
   include ':@_react-native-voice_voice'
   project(':@_react-native-voice_voice').projectDir = new File(rootProject.projectDir, '../node_modules/@react-native-voice/voice/android')
   ```

2. **Check `android/app/build.gradle` includes the dependency:**
   ```gradle
   dependencies {
     ...
     implementation project(':@_react-native-voice_voice')
   }
   ```

### Option B: Manual Linking (if autolinking failed)
```bash
# From project root
npx react-native link @react-native-voice/voice
```

### Option C: Check Android Permissions
Ensure `android/app/src/main/AndroidManifest.xml` includes:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### Option D: Update @react-native-voice/voice
If issues persist, try updating to the latest version:
```bash
npm install @react-native-voice/voice@latest
# or 
npm install @react-native-voice/voice@7.8.0
```

## Debugging Tips

### 1. Monitor Logs During Startup
Watch console logs for:
- ✅ `"Voice module initialized as singleton"` - Module loaded
- ✅ `"Voice event listeners attached"` - Listeners ready
- ✅ `"Voice recognition initialized successfully"` - Module ready
- ❌ Error messages - Indicates where initialization failed

### 2. Test Voice Recognition
After app starts and logs show successful initialization:
1. Tap the audio icon
2. Watch console for: `"Starting voice recognition..."` 
3. Speak clearly into microphone
4. Watch for results or errors

### 3. Common Error Messages

| Error | Cause | Fix |
|-------|-------| ----|
| `startSpeech of null` | Native bridge not initialized | Rebuild app, clear cache |
| `RECORD_AUDIO` permission error | App lacks permission | Check Android permissions |
| `No previous voice session to stop` | First time running | Normal - ignore |
| `Voice became null after destroy` | Module lifecycle issue | Clear cache, rebuild |

## Architecture Overview

```
App Start
   ↓
Module Loads (Singleton)
   ↓
Initialize Event Listeners
   ↓
Check Permissions
   ↓
Check Voice Availability
   ↓
Voice Ready ✓
   ↓
User Taps Audio Button
   ↓
startListening() calls voice.start(locale)
   ↓
Native Bridge Receives Call
   ↓
startSpeech handler called (no longer null!)
   ↓
Speech Recognition Begins
```

## Related Files Modified
- `src/components/chat/SendButton.tsx` - Main voice recognition component

## Support
If issues persist after these steps:
1. Check if `@react-native-voice/voice` version is compatible with your React Native version
2. Verify Android SDK and build-tools versions match project requirements
3. Consider testing on a real Android device (emulator can have audio issues)
