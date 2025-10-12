import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { askAI } from '../dashboard/askAi';

interface SuggestionBoxProps {
  bgColor?: string;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({ bgColor = '#FFFFFF' }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const prompt = 'What do I learn today? Give me a one-line suggestion.';

  const fetchSuggestion = async () => {
    setLoading(true);
    setError('');

    try {
      const suggestionText = await askAI(prompt);
      setSuggestion(suggestionText);
    } catch (err) {
      console.error('Error fetching suggestion:', err);
      setError('Failed to fetch suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTap = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      fetchSuggestion();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: bgColor }]} 
      onPress={handleTap} 
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/getStarted/gift.png')}
          style={styles.giftIcon}
          resizeMode="contain"
        />
        <Text style={styles.tapText}>Tap for a Surprise Fact!</Text>
      </View>
      
      {isExpanded && (
        <View style={styles.suggestionContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.suggestionText}>{suggestion}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  giftIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  tapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  suggestionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6347',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default SuggestionBox;