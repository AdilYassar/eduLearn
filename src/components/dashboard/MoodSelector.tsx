import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { User } from 'lucide-react-native';
import { navigate } from '../../utils/Navigation';
import { useMood, useTheme } from '../../context/ThemeContext';
import { MoodType } from '../../redux/reducers/themeSlice';

const { width } = Dimensions.get('window');

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#2DD4BF' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: '#8496B0' },
  { type: 'sad', emoji: '😔', label: 'Sad', color: '#6B8DD6' },
  { type: 'crying', emoji: '😢', label: 'Crying', color: '#7E8FD4' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: '#7268C8' },
];

interface MoodSelectorProps {
  userName: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ userName }) => {
  const { currentMood, changeMood } = useMood();
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const currentMoodData = MOODS.find(m => m.type === currentMood) || MOODS[0];

  // Animation values
  const auraOpacity = useSharedValue(1);
  const auraScale = useSharedValue(1);
  const auraHeight = useSharedValue(100);

  useEffect(() => {
    if (isExpanded) {
      auraOpacity.value = withTiming(1, { duration: 300 });
      auraScale.value = withSpring(1, { damping: 15 });
      auraHeight.value = withSpring(100, { damping: 15 });
    } else {
      auraOpacity.value = withTiming(0, { duration: 300 });
      auraScale.value = withSpring(0.9, { damping: 15 });
      auraHeight.value = withSpring(0, { damping: 15 });
    }
  }, [isExpanded]);

  const animatedAuraStyle = useAnimatedStyle(() => ({
    opacity: auraOpacity.value,
    transform: [{ scale: auraScale.value }],
    height: auraHeight.value === 0 ? 0 : 'auto',
    marginTop: auraHeight.value === 0 ? -20 : 0
  }));

  return (
    <View style={styles.container}>
      {/* Premium Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
          <Text style={[styles.greeting, { color: theme.text.primary }]}>
            Hello, <Text style={{ fontWeight: 'bold' }}>{userName || 'Learner'}</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            How are you feeling today?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigate('Profile')}
          style={[
            styles.miniAura, 
            { 
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
            }
          ]}
        >
          <User size={20} color={theme.text.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* The Circular Aura Selector */}
      <Animated.View style={[styles.auraWrapper, animatedAuraStyle]}>
        <View style={[
          styles.moodRing, 
          { 
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          }
        ]}>
          {MOODS.map((mood) => {
            const isActive = currentMood === mood.type;
            
            return (
              <TouchableOpacity
                key={mood.type}
                onPress={() => changeMood(mood.type)}
                style={styles.moodItem}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.emojiWrapper,
                  isActive && {
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      transform: [{ scale: 1.15 }],
                      shadowColor: mood.color,
                      shadowOpacity: 0.4,
                      shadowRadius: 12,
                      elevation: 8,
                  }
                ]}>
                  <Text style={[styles.emojiText, isActive && { fontSize: 26 }]}>
                    {mood.emoji}
                  </Text>
                  {isActive && (
                      <View style={[styles.activeDot, { backgroundColor: mood.color }]} />
                  )}
                </View>
                <Text 
                  style={[
                    styles.moodLabel, 
                    { 
                      color: isActive ? mood.color : theme.text.secondary,
                      fontWeight: isActive ? 'bold' : '500',
                      opacity: isActive ? 1 : 0.7
                    }
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Manrope',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
  miniAura: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  currentEmoji: {
    fontSize: 24,
  },
  auraWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  moodRing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    width: '100%',
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  emojiText: {
    fontSize: 22,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  moodLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MoodSelector;
