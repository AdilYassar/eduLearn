import { ThemeColors, MoodType, MOOD_THEMES } from '../redux/reducers/themeSlice';

// Utility functions for working with themes

/**
 * Get theme by mood type
 */
export const getThemeByMood = (mood: MoodType): ThemeColors => {
  return MOOD_THEMES[mood];
};

/**
 * Get mood from theme colors (reverse lookup)
 */
export const getMoodFromTheme = (theme: ThemeColors): MoodType => {
  for (const [mood, moodTheme] of Object.entries(MOOD_THEMES)) {
    if (moodTheme.primary === theme.primary) {
      return mood as MoodType;
    }
  }
  return 'happy'; // fallback
};

/**
 * Convert mood to emoji for display
 */
export const getMoodEmoji = (mood: MoodType): string => {
  const emojiMap: Record<MoodType, string> = {
    sad: '😢',
    neutral: '😐',
    happy: '😊',
    angry: '😡',
    crying: '😭',
  };
  return emojiMap[mood];
};

/**
 * Get mood display name
 */
export const getMoodDisplayName = (mood: MoodType): string => {
  const displayMap: Record<MoodType, string> = {
    sad: 'Sad',
    neutral: 'Neutral',
    happy: 'Happy',
    angry: 'Angry',
    crying: 'Crying',
  };
  return displayMap[mood];
};

/**
 * Create styles with theme colors
 */
export const createThemedStyles = (theme: ThemeColors) => ({
  container: {
    backgroundColor: theme.surface,
  },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    shadowColor: theme.shadow,
  },
  text: {
    primary: {
      color: theme.text.primary,
    },
    secondary: {
      color: theme.text.secondary,
    },
    accent: {
      color: theme.text.accent,
    },
  },
  button: {
    primary: {
      backgroundColor: theme.primary,
    },
    secondary: {
      backgroundColor: theme.secondary,
    },
    accent: {
      backgroundColor: theme.accent,
    },
  },
  border: {
    borderColor: theme.border,
  },
  shadow: {
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

/**
 * Get contrasting text color for a background
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in a real app you might want a more sophisticated algorithm
  const color = backgroundColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#000000' : '#FFFFFF';
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (color: string, percent: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  
  // Extract RGB components using Math operations instead of bitwise
  const R = Math.floor(num / 65536) + amt;
  const G = Math.floor((num % 65536) / 256) + amt;
  const B = (num % 256) + amt;
  
  const finalR = R < 255 ? (R < 1 ? 0 : R) : 255;
  const finalG = G < 255 ? (G < 1 ? 0 : G) : 255;
  const finalB = B < 255 ? (B < 1 ? 0 : B) : 255;
  
  return '#' + (
    0x1000000 + finalR * 0x10000 + finalG * 0x100 + finalB
  ).toString(16).slice(1);
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (color: string, percent: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * percent);
  
  // Extract RGB components using Math operations instead of bitwise
  const R = Math.floor(num / 65536) - amt;
  const G = Math.floor((num % 65536) / 256) - amt;
  const B = (num % 256) - amt;
  
  const finalR = R > 255 ? 255 : (R < 0 ? 0 : R);
  const finalG = G > 255 ? 255 : (G < 0 ? 0 : G);
  const finalB = B > 255 ? 255 : (B < 0 ? 0 : B);
  
  return '#' + (
    0x1000000 + finalR * 0x10000 + finalG * 0x100 + finalB
  ).toString(16).slice(1);
};
