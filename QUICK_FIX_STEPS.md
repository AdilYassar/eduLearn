# Quick Fix Steps - Copy & Paste Commands

## Windows Command Prompt (or PowerShell)

### Step 1: Clean Build Cache
```batch
cd android
gradlew clean
cd ..
```

### Step 2: Clean Node Modules (if needed)
```batch
rmdir /s /q node_modules
npm install
```

### Step 3: Rebuild the App
```batch
npx react-native run-android --reset-cache
```

### For Production Build
```batch
cd android
gradlew assembleRelease
cd ..
```

---

## What Each Command Does

| Command | Purpose |
|---------|---------|
| `gradlew clean` | Removes all Android build artifacts |
| `rmdir /s node_modules` | Deletes node modules folder |
| `npm install` | Reinstalls all dependencies |
| `npx react-native run-android --reset-cache` | Rebuilds app with cache cleared |

---

## Expected Console Output (Success)

After running the commands, when you launch the app, you should see in console:

```
SendButton.tsx:60 Voice module initialized as singleton
SendButton.tsx:470 Voice event listeners attached
SendButton.tsx:480 Voice recognition initialized successfully
```

Then when you tap the voice button:

```
SendButton.tsx:555 Starting voice recognition...
SendButton.tsx:560 Voice recognition started successfully with locale: en-US
```

---

## Troubleshooting Commands

### If You Still Get the Error

1. **Full reset** (nuclear option):
```batch
rmdir /s /q node_modules
rmdir /s /q android/build
rmdir /s /q android/app/build
npm install
npx react-native run-android --reset-cache
```

2. **Check if module is linked properly**:
```batch
npx react-native unlink @react-native-voice/voice
npx react-native link @react-native-voice/voice
```

3. **Force reinstall voice module**:
```batch
npm uninstall @react-native-voice/voice
npm install @react-native-voice/voice@7.8.0
```

### Monitor Real-time Logs
```batch
npx react-native log-android
```

---

## Testing the Fix

1. **Start fresh app**:
```batch
npx react-native run-android --reset-cache
```

2. **Open React Native debugger console** (usually F12 or Cmd+D on iOS)

3. **Look for these three success messages**:
   - ✅ `"Voice module initialized as singleton"`
   - ✅ `"Voice event listeners attached"`
   - ✅ `"Voice recognition initialized successfully"`

4. **Tap audio icon** and try speaking

5. **Expected result**: Speech recognized without `startSpeech null` error

---

## If Still Stuck

Try these diagnostics:

```bash
# Check Java version
java -version

# Check Android version
adb --version

# List connected devices
adb devices

# Clear app cache
adb shell pm clear com.edulearn

# Reinstall app completely
adb uninstall com.edulearn
npx react-native run-android
```

---

## Key Point
The fix changed how the Voice module is loaded from **"get fresh reference each time"** to **"load once, reuse forever"**. This ensures the native bridge is properly initialized before you try to start voice recognition.
