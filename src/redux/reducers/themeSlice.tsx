import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MoodType = 'sad' | 'neutral' | 'happy' | 'angry' | 'crying';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string[];
  componentBackground: string[];
  surface: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: string;
  border: string;
  card: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
  statusBar: 'light-content' | 'dark-content';
  lightest: string;
  isDark: boolean;
}

export const MOOD_THEMES: Record<MoodType, ThemeColors> = {
  // NEUTRAL - Periwinkle + Light Periwinkle cards (light theme)
  // background: white/off-white
  // card/componentBackground: light periwinkle tint for visibility
  neutral: {
    primary: '#5D4BA3', // Darker periwinkle — more visible on light background for buttons
    secondary: '#A8A4E8', // Soft periwinkle — secondary accents
    background: ['#FFFFFF', '#FAFAFA'],
    componentBackground: ['#EDE5F8', '#E8DFF5'], // Light periwinkle — subtle contrast for light theme
    surface: '#FFFFFF',
    text: {
      primary: '#2D2560', // Dark purple — readable on white + periwinkle cards
      secondary: '#5B4EA4', // Deep purple — secondary text
      accent: '#7B6EC4',  // Mid purple — labels, small text
    },
    accent: '#E8E3F5', // Light periwinkle accent
    border: '#6B5BA8', // Darker periwinkle for strong visible borders
    card: '#EDE5F8', // Light periwinkle for containers
    shadow: 'rgba(123, 110, 196, 0.15)', // Stronger, more visible shadow
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444',
    statusBar: 'dark-content',
    lightest: '#FFFFFF',
    isDark: false,
  },

  // HAPPY - Emerald Night + Neon Mint
  happy: {
    primary: '#4ADE80', // Luminous Neon Mint Green
    secondary: '#34D399', // Bright Forest Emerald
    background: ['#0D2208', '#060E04'],
    componentBackground: ['#1A3A10', '#0D2208'],
    surface: '#0D2208',
    text: {
      primary: '#FFFFFF', // Pure White
      secondary: '#A7F3D0', // Soft luminous mint text
      accent: '#6EE7B7',
    },
    accent: '#3D2E00',
    border: 'rgba(255, 255, 255, 0.1)',
    card: '#1A3A10',
    shadow: 'rgba(0, 0, 0, 0.5)',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444',
    statusBar: 'light-content',
    lightest: '#FFFFFF',
    isDark: true,
  },

  // SAD - Deep Ocean + Neon Cyan
  sad: {
    primary: '#60A5FA', // Neon Electric Blue
    secondary: '#38BDF8', // Luminous Sky Cyan
    background: ['#0A0F1E', '#060912'],
    componentBackground: ['#0F1729', '#0A0F1E'],
    surface: '#0A0F1E',
    text: {
      primary: '#FFFFFF', // Pure White
      secondary: '#BAE6FD', // Soft pale blue
      accent: '#7DD3FC',
    },
    accent: '#1A2440',
    border: 'rgba(255, 255, 255, 0.08)',
    card: '#0F1729',
    shadow: 'rgba(0, 0, 0, 0.5)',
    success: '#10B981',
    warning: '#FCD34D',
    error: '#F87171',
    statusBar: 'light-content',
    lightest: '#FFFFFF',
    isDark: true,
  },

  // ANGRY - Obsidian Gray + Neon Silver (dark theme)
  angry: {
    primary: '#64748B', // Slate Blue-Gray with better contrast
    secondary: '#94A3B8', // Soft Muted Blue-Gray
    background: ['#141310', '#0A0A08'],
    componentBackground: ['#1C1B18', '#141310'],
    surface: '#141310',
    text: {
      primary: '#FFFFFF', // Pure White for absolute contrast
      secondary: '#E8ECF0', // Light Silver
      accent: '#64748B',
    },
    accent: '#2E2D2A',
    border: 'rgba(255, 255, 255, 0.1)',
    card: '#1C1B18',
    shadow: 'rgba(0, 0, 0, 0.5)',
    success: '#10b981',
    warning: '#8496B0',
    error: '#7A8FAA',
    statusBar: 'light-content',
    lightest: '#FFFFFF',
    isDark: true,
  },

  // CRYING - Dusty Rose + Luminous Orchid
  crying: {
    primary: '#E879F9', // Bright Neon Orchid/Pink
    secondary: '#D946EF', // Deep Vivid Magenta
    background: ['#100810', '#080408'],
    componentBackground: ['#1C0F1A', '#100810'],
    surface: '#100810',
    text: {
      primary: '#FFFFFF', // Pure White
      secondary: '#F5D0FE', // Pale frosted pink
      accent: '#F0ABFC',
    },
    accent: '#2A1020',
    border: 'rgba(255, 255, 255, 0.08)',
    card: '#1C0F1A',
    shadow: 'rgba(0, 0, 0, 0.5)',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444',
    statusBar: 'light-content',
    lightest: '#FFFFFF',
    isDark: true,
  },
};

interface ThemeState {
  currentMood: MoodType;
  currentTheme: ThemeColors;
  isInitialized: boolean;
}

const initialState: ThemeState = {
  currentMood: 'happy',
  currentTheme: MOOD_THEMES.happy,
  isInitialized: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMood: (state, action: PayloadAction<MoodType>) => {
      state.currentMood = action.payload;
      state.currentTheme = MOOD_THEMES[action.payload];
    },
    initializeTheme: (state, action: PayloadAction<MoodType>) => {
      state.currentMood = action.payload;
      state.currentTheme = MOOD_THEMES[action.payload];
      state.isInitialized = true;
    },
    resetTheme: (state) => {
      state.currentMood = 'happy';
      state.currentTheme = MOOD_THEMES.happy;
    },
  },
});

export const { setMood, initializeTheme, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const selectCurrentMood = (state: { theme: ThemeState }) => state.theme.currentMood;
export const selectCurrentTheme = (state: { theme: ThemeState }) => state.theme.currentTheme;
export const selectIsThemeInitialized = (state: { theme: ThemeState }) => state.theme.isInitialized;