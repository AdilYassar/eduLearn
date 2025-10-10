# SRC Folder Migration - Configuration & Import Issues Report

## Date: October 6, 2025
## Status: ⚠️ Multiple Issues Found

---

## 📋 Summary

After replacing the `src` folder from another project (video call/WebRTC project), several configuration and import issues have been identified that need to be resolved.

---

## 🔴 Critical Issues

### 1. **Duplicate Folder Structure**
**Location:** `src/components/src/`
**Issue:** The new src folder was placed inside `src/components/src/` creating a nested structure. This is causing path confusion.

**Current Structure:**
```
src/
├── components/
│   ├── src/           ← IMPORTED PROJECT (WebRTC/Video Call)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── service/
│   │   ├── styles/
│   │   └── utils/
│   ├── chat/          ← EXISTING PROJECT
│   ├── dashboard/     ← EXISTING PROJECT
│   └── Podcasts/      ← EXISTING PROJECT
```

**Expected Structure:**
The imported project files should either:
- Be integrated into existing folders, OR
- Be in a separate module like `src/videocall/`

---

### 2. **TypeScript Type Annotations in JavaScript Files**
**Location:** `src/components/src/navigation/NavigationUtil.js`
**Issue:** File uses `.js` extension but contains TypeScript syntax

**Errors Found:**
```
src/components/src/navigation/NavigationUtil.js(5,37): error TS8010: Type annotations can only be used in TypeScript files.
src/components/src/navigation/NavigationUtil.js(5,51): error TS8009: The '?' modifier can only be used in TypeScript files.
```

**Code:**
```javascript
// ❌ This won't work in .js file
export function navigate(routeName: string, params?: object) { }

// ✅ Should either remove types or rename to .ts
export function navigate(routeName, params) { }
```

**Solution:**
- Rename `NavigationUtil.js` to `NavigationUtil.ts`

---

### 3. **Duplicate Utils Constants**
**Conflict:** Two separate `Constants` files exist:
- `src/utils/Constants.tsx` (existing EduLearn project)
- `src/components/src/utils/Constants.ts` (imported video call project)

**Issue:** Both export similar but different constants:
- `screenHeight`, `screenWidth`, `Colors`

**Risk:** Import confusion and potential runtime errors

---

### 4. **Missing Babel Alias for Nested Structure**
**Location:** `babel.config.js`
**Issue:** The `@components` alias points to `./src/components` but imported files are in `./src/components/src`

**Current Babel Config:**
```javascript
alias: {
  '@components':'./src/components',  // Points to parent folder
}
```

**Imported Files Try to Import:**
```javascript
// From navigation.tsx
import { WSProvider } from '@components/src/service/api/WSProvider';
import HomeScreen from '@components/src/screens/HomeScreen';
```

**This creates:** `src/components/src/...` path which is confusing.

---

## ⚠️ Major Issues

### 5. **Duplicate Navigation Utilities**
**Conflict:**
- `src/utils/Navigation.tsx` (existing)
- `src/components/src/navigation/NavigationUtil.js` (imported)

Both provide similar navigation helper functions but with different implementations.

---

### 6. **WebRTC Dependencies**
**Package:** `react-native-webrtc` v124.0.5
**Status:** ✅ Already in package.json

**Used in:**
- `src/components/src/hooks/useWebRTC.js`
- `src/components/src/screens/LiveMeetScreen.js`

**Note:** Ensure native linking is complete for iOS and Android.

---

### 7. **Socket.IO Integration**
**Package:** `socket.io-client` v4.8.1
**Status:** ✅ Already in package.json

**Config Issue:**
- `src/components/src/service/config.js` uses:
  ```javascript
  export const BASE_URL = "https://2ba31a06d84e.ngrok-free.app";
  export const SOCKET_URL = "wss://2ba31a06d84e.ngrok-free.app"
  ```
- **Action Required:** Update URLs to match your backend server

---

### 8. **Missing State Management Files**
**Missing:**
- `src/components/src/service/userStore.js` - Imported by HomeScreen, JoinMeetScreen
- `src/components/src/service/meetStore.js` - Imported by multiple screens

**Impact:** These screens will fail at runtime

---

## ⚙️ Configuration Issues

### 9. **TypeScript Configuration**
**Location:** `tsconfig.json`
**Issue:** Paths don't include the nested `src` structure

**Current:**
```json
"paths": {
  "@components/*": ["components/*"]
}
```

**Missing:**
```json
"paths": {
  "@components/*": ["components/*"],
  "@videocall/*": ["components/src/*"]  // Or whatever you decide
}
```

---

### 10. **Import Path Inconsistencies**

#### In Imported Files (src/components/src/):
Files use relative imports that work within their own structure:
```javascript
// src/components/src/screens/HomeScreen.js
import { homeStyles } from '../styles/homeStyles';
import HomeHeader from '../components/home/HomeHeader';
import { navigate } from '../navigation/NavigationUtil';
import { useUserStore } from '../service/userStore';
```

#### In Main App (navigation.tsx):
Main app uses alias imports to reference these files:
```javascript
import { WSProvider } from '@components/src/service/api/WSProvider';
import HomeScreen from '@components/src/screens/HomeScreen';
```

**Problem:** This creates two different import patterns for the same codebase.

---

## 🔧 Recommended Solutions

### Option 1: Keep Separate (Recommended for Quick Fix)
1. **Rename folder:** `src/components/src/` → `src/videocall/`
2. **Update babel.config.js:**
   ```javascript
   alias: {
     '@videocall': './src/videocall',
   }
   ```
3. **Update imports in navigation.tsx:**
   ```javascript
   import { WSProvider } from '@videocall/service/api/WSProvider';
   import HomeScreen from '@videocall/screens/HomeScreen';
   ```
4. **Rename NavigationUtil.js to NavigationUtil.ts**

### Option 2: Integrate Fully (Better Long-term)
1. Move files from `src/components/src/` to appropriate locations:
   - `screens/` → `src/features/screens/`
   - `components/` → `src/components/videocall/`
   - `service/` → `src/service/videocall/`
   - `hooks/` → `src/service/hooks/` or `src/hooks/`
2. Resolve duplicate files (Constants, Navigation utils)
3. Update all imports to use standard aliases

### Option 3: Module-based (Best for Scalability)
1. Create `src/modules/` folder
2. Place video call project as `src/modules/videocall/`
3. Add alias: `@modules/*`: `./src/modules/*`
4. Keep each module self-contained

---

## 📝 Required Actions

### Immediate (Critical):
- [ ] Fix NavigationUtil.js TypeScript errors (rename to .ts or remove types)
- [ ] Add missing store files (userStore.js, meetStore.js)
- [ ] Update server URLs in config.js
- [ ] Decide on folder structure (Option 1, 2, or 3)

### High Priority:
- [ ] Update babel.config.js with correct aliases
- [ ] Update tsconfig.json paths
- [ ] Update imports in navigation.tsx
- [ ] Test all video call screens

### Medium Priority:
- [ ] Resolve Constants file duplication
- [ ] Resolve Navigation utilities duplication
- [ ] Document video call feature integration
- [ ] Add proper TypeScript types where missing

### Low Priority:
- [ ] Verify WebRTC native linking (iOS/Android)
- [ ] Test permissions flow
- [ ] Review and optimize folder structure
- [ ] Add proper error handling

---

## 🧪 Testing Checklist

After fixes:
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] App builds successfully on Android
- [ ] App builds successfully on iOS
- [ ] Video call screens are accessible
- [ ] WebRTC permissions work
- [ ] Socket connection establishes
- [ ] No import/module errors in console

---

## 📚 Related Files

### Configuration Files:
- `babel.config.js`
- `tsconfig.json`
- `metro.config.js`
- `package.json`

### Key Imported Files:
- `src/components/src/screens/HomeScreen.js`
- `src/components/src/screens/JoinMeetScreen.js`
- `src/components/src/screens/PrepareMeetScreen.js`
- `src/components/src/screens/LiveMeetScreen.js`
- `src/components/src/service/api/WSProvider.js`
- `src/components/src/service/config.js`
- `src/components/src/navigation/NavigationUtil.js`

### Integration Point:
- `src/navigation/navigation.tsx` (lines 37-41)

---

## 💡 Notes

1. The imported project appears to be a WebRTC-based video calling feature
2. It uses Socket.IO for signaling
3. Main screens: HomeScreen, JoinMeetScreen, PrepareMeetScreen, LiveMeetScreen
4. The project is well-structured but needs integration with existing EduLearn structure
5. Dependencies are already installed, mainly needs configuration updates

---

## 🤝 Next Steps

**Recommended Approach:**
1. Start with Option 1 (Quick Fix) to get it working
2. Run tests to ensure basic functionality
3. Plan Option 2 (Full Integration) for next refactoring cycle
4. Document the video call feature properly

Would you like me to implement any of these solutions?
