# Mood Selector Feature

## Overview
A new interactive mood selector has been added to the Dashboard that allows users to select their mood using emoji buttons. When a mood is selected, the dashboard's background color changes to match the mood.

## Components Created

### 1. MoodSelector Component (`src/components/dashboard/MoodSelector.tsx`)

**Features:**
- **5 Mood Options:**
  - 😢 Sad (Light Blue - `#A8C5E6`)
  - 😐 Neutral (Gray - `#D1D1D1`)
  - 😊 Happy (Light Green - `#A8E6CF`) - Default
  - 😠 Angry (Light Red - `#FFB3B3`)
  - 😆 Excited (Light Yellow - `#FFE6A8`)

- **Interactive Features:**
  - Circular emoji buttons in a horizontal FlatList
  - Scale animation on selection (grows and shrinks)
  - Selected mood has a border highlight
  - Small dot indicator below selected mood
  - Smooth transitions between selections

- **Props:**
  - `userName?: string` - Displays personalized greeting
  - `onMoodChange: (color: string) => void` - Callback when mood changes

## Integration

### DashboardScreen Updates (`src/features/screens/DashboardScreen.tsx`)

**Changes Made:**
1. Imported `MoodSelector` component
2. Added state management:
   - `backgroundColor` - Controls dashboard background color
   - `fadeAnim` - Animated value for smooth color transitions

3. Added `handleMoodChange` function:
   - Receives color from MoodSelector
   - Animates the transition
   - Updates dashboard background color

4. Integrated MoodSelector into content FlatList:
   - Positioned after the header
   - Before SuggestionBox
   - Passes userName and onMoodChange callback

5. Updated container from `View` to `Animated.View`:
   - Enables smooth background color transitions
   - Background dynamically changes based on selected mood

## User Experience

1. **Initial Load:**
   - Dashboard loads with default teal background
   - MoodSelector displays with "Happy" mood pre-selected (light green)

2. **Selecting a Mood:**
   - User taps on any emoji button
   - Button scales up briefly (animation)
   - Border appears around selected emoji
   - Dot indicator appears below
   - Dashboard background smoothly transitions to mood color

3. **Visual Feedback:**
   - Immediate visual response on tap
   - Smooth color transitions
   - Clear indication of selected mood

## Styling

### MoodSelector Styles:
- Circular buttons: 70x70 pixels
- Emoji size: 35px
- Elevation and shadows for depth
- Horizontal scrollable list with proper spacing
- Clean typography for title and subtitle

### Dashboard Updates:
- Animated background color transitions
- Maintains all existing layout and functionality
- Seamlessly integrated with other dashboard components

## Technical Implementation

### Animation:
- Uses `Animated.Value` from React Native
- Scale animation on button press
- Fade animation on background color change
- All animations use `useNativeDriver` where possible for performance

### Performance:
- Optimized FlatList rendering
- Proper component separation
- Minimal re-renders
- Smooth 60fps animations

## Future Enhancements (Optional)

1. **Persistence:**
   - Save mood selection to AsyncStorage
   - Restore last selected mood on app restart

2. **More Moods:**
   - Add additional mood options
   - Customizable mood colors

3. **Mood Analytics:**
   - Track mood patterns over time
   - Display mood history

4. **Themed Components:**
   - Make other dashboard components adapt to mood colors
   - Adjust text colors based on background

## Files Modified

1. ✅ Created: `src/components/dashboard/MoodSelector.tsx`
2. ✅ Modified: `src/features/screens/DashboardScreen.tsx`
3. ✅ Created: `MOOD_SELECTOR_FEATURE.md` (this file)

## Usage

The feature is now fully integrated and ready to use. Simply run the app and navigate to the Dashboard to see the mood selector in action!

```typescript
// Example: Using MoodSelector in another component
import MoodSelector from '@components/dashboard/MoodSelector';

<MoodSelector 
  userName="John"
  onMoodChange={(color) => {
    console.log('Mood color changed to:', color);
  }}
/>
```

## Testing Recommendations

1. Test all 5 mood selections
2. Verify smooth animations
3. Check color transitions
4. Test on both iOS and Android
5. Verify proper spacing and layout on different screen sizes
6. Test with and without userName prop
