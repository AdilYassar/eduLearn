import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme, useMood } from '../../context/ThemeContext';
import { push } from '../../utils/Navigation';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { MoodType } from '../../redux/reducers/themeSlice';

interface DashboardHeaderProps {
  userName: string;
  streak?: number;
  xp?: number;
  tasksDone?: number;
}

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: '#2DD4BF' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: '#8496B0' },
  { type: 'sad', emoji: '😔', label: 'Sad', color: '#6B8DD6' },
  { type: 'crying', emoji: '😢', label: 'Crying', color: '#7E8FD4' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: '#7268C8' },
];

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  streak = 14, 
  xp = 320, 
  tasksDone = 3 
}) => {
  const { theme } = useTheme();
  const { currentMood, changeMood } = useMood();
  const [isMoodExpanded, setIsMoodExpanded] = useState(false);

  const auraOpacity = useSharedValue(0);
  const auraTranslateY = useSharedValue(-10);

  useEffect(() => {
    if (isMoodExpanded) {
      auraOpacity.value = withTiming(1, { duration: 250 });
      auraTranslateY.value = withSpring(0, { damping: 15 });
    } else {
      auraOpacity.value = withTiming(0, { duration: 200 });
      auraTranslateY.value = withSpring(-10, { damping: 15 });
    }
  }, [isMoodExpanded]);

  const animatedMoodStyle = useAnimatedStyle(() => ({
    opacity: auraOpacity.value,
    transform: [{ translateY: auraTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Top Welcome Row */}
      <View style={styles.topRow}>
        <TouchableOpacity activeOpacity={0.7} style={styles.textStack} onPress={() => setIsMoodExpanded(!isMoodExpanded)}>
          <Text style={[styles.greeting, { color: theme.text.secondary }]}>Good morning</Text>
          <Text style={[styles.name, { color: theme.text.primary }]}>{userName || 'Learner'}</Text>
          <Text style={[styles.subtext, { color: theme.text.secondary }]}>How are you feeling today?</Text>
        </TouchableOpacity>

        {/* Profile Avatar Button */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => push('Profile')}
          style={[styles.profileRing, { borderColor: 'rgba(255,255,255,0.1)' }]}
        >
          <User size={20} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Embedded Mood Selector Dropdown - Conditionally Rendered */}
      {isMoodExpanded && (
        <Animated.View style={[{ marginTop: 16 }, animatedMoodStyle]}>
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
      )}

      {/* Metrics Grid */}
      <View style={[styles.metricsRow, { marginTop: 24 }]}>
        <View style={[styles.metricCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.componentBackground[0], borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>STREAK</Text>
          <View style={styles.valRow}>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>{streak}</Text>
            <Text style={[styles.metricUnit, { color: theme.text.secondary }]}>days</Text>
          </View>
        </View>
        
        <View style={[styles.metricCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.componentBackground[0], borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>XP TODAY</Text>
          <View style={styles.valRow}>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>{xp}</Text>
            <Text style={[styles.metricUnit, { color: theme.text.secondary }]}>xp</Text>
          </View>
        </View>
        
        <View style={[styles.metricCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : theme.componentBackground[0], borderColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
          <Text style={[styles.metricLabel, { color: theme.text.secondary }]}>DONE</Text>
          <View style={styles.valRow}>
            <Text style={[styles.metricValue, { color: theme.text.primary }]}>{tasksDone}</Text>
            <Text style={[styles.metricUnit, { color: theme.text.secondary }]}>tasks</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textStack: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 12,
  },
  profileRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  valRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 10,
    bottom: 2,
  },
});

export default DashboardHeader;
