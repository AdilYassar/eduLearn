import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Briefcase, ChevronRight } from 'lucide-react-native';
import { askAI } from '../dashboard/askAi';
import { useTheme } from '../../context/ThemeContext';

const DailySurprise = () => {
  const { theme } = useTheme();
  
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const contentHeight = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const fetchSuggestion = async () => {
    setLoading(true);
    setError('');
    try {
      const suggestionText = await askAI('What do I learn today? Give me a one-line suggestion.');
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
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Discover</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handleTap}>
        <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }]}>
          
          <View style={[styles.iconBox, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
            <Briefcase size={20} color="#D97706" />
          </View>
          
          <View style={styles.textStack}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Daily surprise</Text>
            <Text style={[styles.subtext, { color: theme.text.secondary }]}>Tap for an AI learner insight</Text>
          </View>
          
          <ChevronRight size={16} color={theme.text.secondary} />
          
        </View>
      </TouchableOpacity>

      <Animated.View style={[styles.expandedContent, animatedStyle]}>
        <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
        {loading ? (
             <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
        ) : error ? (
             <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        ) : (
             <Text style={[styles.suggestionText, { color: theme.text.primary }]}>{suggestion}</Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textStack: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
  },
  expandedContent: {
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -4, 
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
    opacity: 0.9,
    fontStyle: 'italic',
    paddingBottom: 16,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 16,
  },
});

export default DailySurprise;
