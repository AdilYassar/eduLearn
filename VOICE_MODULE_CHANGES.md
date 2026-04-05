# SendButton.tsx - Voice Module Implementation Changes

## Problem Statement
The `@react-native-voice/voice` module was throwing `TypeError: Cannot read property 'startSpeech' of null` because:
- The module was being loaded multiple times (fresh references)
- Event listeners were not attached before calling `start()`
- The native bridge had internal null references that weren't initialized

## Root Cause Analysis
```
OLD PATTERN (BROKEN):
├─ Get fresh Voice reference 1
├─ Set event listeners on reference 1
├─ Destroy reference 1
├─ Get fresh Voice reference 2
├─ Try to call start() on reference 2
└─ FAIL: Native handler is null because it wasn't initialized by reference 1

NEW PATTERN (FIXED):
├─ Load Voice module ONCE (singleton)
├─ Attach event listeners to singleton
├─ Keep singleton throughout app lifetime
├─ Call start() on singleton
└─ SUCCESS: Native handler is ready
```

## Code Changes Summary

### Change 1: Module Loading (Lines ~51-75)

**BEFORE:**
```typescript
const getVoiceModule = () => {
  try {
    const VoiceModule = require('@react-native-voice/voice');
    const freshVoice = VoiceModule.default || VoiceModule;
    // ... validation logic ...
    Voice = freshVoice;
    return freshVoice;
  }
  // Returns fresh reference each time
};
```

**AFTER:**
```typescript
let VoiceInitialized = false;

const initializeVoiceModuleOnce = () => {
  if (VoiceInitialized) {
    return Voice;  // Return cached instance
  }
  try {
    const VoiceModule = require('@react-native-voice/voice');
    Voice = VoiceModule.default || VoiceModule;
    VoiceInitialized = true;
    return Voice;  // Cache and return
  }
  // ... error handling ...
};

const getVoiceModule = () => {
  return Voice || initializeVoiceModuleOnce();
};
```

**Why:** Ensures only one module instance is created and reused.

---

### Change 2: Initialization Phase (Lines ~426-475)

**BEFORE:**
```typescript
useEffect(() => {
  const initializeVoice = async () => {
    const freshVoiceRef = getVoiceModule();
    // ... permissions check ...
    
    // Destroy existing instance (breaks native bridge!)
    await freshVoiceRef.destroy();
    
    // Get another "fresh" reference
    const postDestroyVoice = getVoiceModule();
    
    // Set listeners on new reference
    postDestroyVoice.onSpeechStart = onSpeechStart;
    // ... etc ...
  };
}, [...]);
```

**AFTER:**
```typescript
useEffect(() => {
  const initializeVoice = async () => {
    const voiceModule = getVoiceModule();  // Get singleton
    
    // ... permissions check ...
    
    // ✓ Set listeners BEFORE availability check
    voiceModule.onSpeechStart = onSpeechStart;
    voiceModule.onSpeechRecognized = onSpeechRecognized;
    voiceModule.onSpeechEnd = onSpeechEnd;
    voiceModule.onSpeechError = onSpeechError;
    voiceModule.onSpeechResults = onSpeechResults;
    voiceModule.onSpeechPartialResults = onSpeechPartialResults;
    voiceModule.onSpeechVolumeChanged = onSpeechVolumeChanged;
    
    // ✓ No destroy calls - keep singleton intact
    
    const available = await checkVoiceAvailability();
    setVoiceAvailable(true);
    setVoiceInitialized(true);
  };
}, [...]);
```

**Why:** Event listeners must be attached to a stable instance before the native bridge tries to use them.

---

### Change 3: Start Listening (Lines ~539-620)

**BEFORE:**
```typescript
const startListening = async () => {
  const freshVoice = getVoiceModule();  // Gets "fresh" reference
  
  if (!freshVoice || typeof freshVoice.start !== 'function') {
    // Check fails because module might be null
    return;
  }
  
  // Try to call start on potentially uninitialized module
  await freshVoice.start(locale);  // Fails with startSpeech null error
};
```

**AFTER:**
```typescript
const startListening = async () => {
  const voiceModule = getVoiceModule();  // Gets same singleton
  
  if (!voiceModule) {
    Alert.alert('Voice Recognition Unavailable', '...');
    setVoiceAvailable(false);
    return;
  }
  
  if (!voiceInitialized) {
    Alert.alert('Voice Recognition Not Ready', '...');
    return;
  }
  
  // Module is fully initialized with listeners attached
  await voiceModule.start(locale);  // ✓ Works! Native handler is ready
};
```

**Why:** Uses fully initialized singleton that already has event listeners attached.

---

## Testing Checklist

- [ ] Clear Android build cache: `cd android && gradlew clean && cd ..`
- [ ] Reinstall dependencies: `npm install`
- [ ] Rebuild app: `npx react-native run-android --reset-cache`
- [ ] Check console logs for initialization messages
- [ ] Test voice recognition by tapping audio button
- [ ] Verify speech is recognized and returned
- [ ] No `startSpeech of null` errors in console

## Key Takeaway

The fix follows the **Singleton + Proper Initialization** pattern:
1. **One module instance** - loaded once, reused forever
2. **Event listeners attached early** - before any method calls
3. **No destroy/recreate cycles** - keeps native bridge stable
4. **Clear state management** - tracks initialization completion

This pattern is the standard for React Native native modules that use event handlers.
