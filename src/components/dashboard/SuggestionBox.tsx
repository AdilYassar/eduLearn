import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { askAI } from '../dashboard/askAi'; // Adjust the import path
import { Colors } from '@utils/Constants';

const SuggestionComponent = () => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  useEffect(() => {
    fetchSuggestion();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Suggestion</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#007BFF" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.suggestionText}>{suggestion}</Text>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchSuggestion}>
        <Icon name="refresh" size={24} color="#007BFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.primary_light,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6347',
    textAlign: 'center',
    marginBottom: 10,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
});

export default SuggestionComponent;