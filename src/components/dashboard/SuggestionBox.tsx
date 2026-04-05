import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { askAI } from '../dashboard/askAi';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/ThemedComponents';

interface SuggestionBoxProps {
}

const SuggestionBox: React.FC<SuggestionBoxProps> = () => {
  const { theme } = useTheme();
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Animation values
  const contentHeight = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const prompt = 'What do I learn today? Give me a one-line suggestion.';

  const fetchSuggestion = async () => {
    setLoading(true);
    setError('');
    try {
      const suggestionText = await askAI(prompt);
      setSuggestion(suggestionText);
    } catch (err: any) {
      setError('Unable to fetch AI suggestion. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
        contentHeight.value = withTiming(100, { duration: 300 });
        contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
        contentHeight.value = withTiming(0, { duration: 300 });
        contentOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: contentHeight.value === 0 ? 0 : 'auto',
    opacity: contentOpacity.value,
    overflow: 'hidden',
  }));

  const handleTap = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      fetchSuggestion();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.9}
      >
        <GlassCard style={styles.surpriseCard} opacity={0.08}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
                <Image
                source={require('../../assets/getStarted/gift.png')}
                style={styles.giftIcon}
                resizeMode="contain"
                />
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.heading, { color: theme.text.primary }]}>Daily Surprise</Text>
                <Text style={[styles.tapText, { color: theme.text.secondary }]}>Tap for an AI Learner Insight</Text>
            </View>
          </View>
          
          <Animated.View style={animatedStyle}>
              <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
              {loading ? (
                  <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
              ) : error ? (
                  <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              ) : (
                  <Text style={[styles.suggestionText, { color: theme.text.primary }]}>{suggestion}</Text>
              )}
          </Animated.View>
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  surpriseCard: {
    marginHorizontal: 20,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  giftIcon: {
    width: 30,
    height: 30,
  },
  textWrapper: {
      flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
  },
  tapText: {
    fontSize: 13,
    opacity: 0.7,
  },
  divider: {
      height: 1,
      marginVertical: 12,
  },
  loader: {
      paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default SuggestionBox;