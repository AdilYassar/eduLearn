import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, MoodType, selectCurrentTheme, selectCurrentMood, setMood, initializeTheme } from '../redux/reducers/themeSlice';
import { RootState } from '../redux/types';

interface ThemeContextType {
  theme: ThemeColors;
  currentMood: MoodType;
  changeMood: (mood: MoodType) => void;
  isThemeReady: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => selectCurrentTheme(state));
  const currentMood = useSelector((state: RootState) => selectCurrentMood(state));
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  // Load saved mood from AsyncStorage on app start
  useEffect(() => {
    const loadSavedMood = async () => {
      try {
        const savedMood = await AsyncStorage.getItem('@edulearn_mood');
        if (savedMood && ['sad', 'neutral', 'happy', 'angry', 'crying'].includes(savedMood)) {
          dispatch(initializeTheme(savedMood as MoodType));
        } else {
          dispatch(initializeTheme('neutral')); // Default mood - NEUTRAL
        }
        setIsThemeReady(true);
      } catch (error) {
        console.error('Error loading saved mood:', error);
        dispatch(initializeTheme('neutral')); // Fallback to default - NEUTRAL
        setIsThemeReady(true);
      }
    };

    loadSavedMood();
  }, [dispatch]);

  // Update StatusBar when theme changes
  useEffect(() => {
    if (isThemeReady) {
      // Set the bar style (icons color)
      StatusBar.setBarStyle(theme.statusBar, true);
      
      // For Android: Ensure the bar is transparent and translucent so background flows behind it
      if (StatusBar.setTranslucent) {
        StatusBar.setTranslucent(true);
      }
      if (StatusBar.setBackgroundColor) {
        StatusBar.setBackgroundColor('transparent');
      }
    }
  }, [theme.statusBar, isThemeReady]);

  const changeMood = async (mood: MoodType) => {
    console.log('🎨 ThemeContext: Changing mood to:', mood);
    try {
      // Save mood to AsyncStorage
      await AsyncStorage.setItem('@edulearn_mood', mood);
      console.log('🎨 ThemeContext: Mood saved to AsyncStorage:', mood);
      // Update Redux state
      dispatch(setMood(mood));
      console.log('🎨 ThemeContext: Mood dispatched to Redux:', mood);
    } catch (error) {
      console.error('🎨 ThemeContext: Error saving mood:', error);
      // Still update Redux state even if saving fails
      dispatch(setMood(mood));
      console.log('🎨 ThemeContext: Mood updated in Redux despite storage error:', mood);
    }
  };

  const value: ThemeContextType = {
    theme,
    currentMood,
    changeMood,
    isThemeReady,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for getting themed styles
export const useThemedStyles = () => {
  const { theme } = useTheme();
  return theme;
};

// Hook for mood management
export const useMood = () => {
  const { currentMood, changeMood } = useTheme();
  return { currentMood, changeMood };
};
