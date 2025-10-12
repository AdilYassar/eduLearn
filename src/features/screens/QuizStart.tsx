import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { navigate } from '../../utils/Navigation';
import { BASE_URL } from '@service/config';

interface QuizItem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  isPublished: boolean;
  expiresAt: string;
}

const QuizStart = () => {
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const route = useRoute();
  const { quizId } = route.params as { quizId: string };

  useEffect(() => {
    const fetchQuizById = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/quiz/${quizId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Quiz fetched:', data);

        if (data?.quiz) {
          setQuiz(data.quiz);
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Error fetching quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizById();
  }, [quizId]);

  const startQuiz = () => {
    // Navigate to the quiz questions screen (handle navigation as per your app's flow)
    navigate('QuizQuestions', { quizId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {quiz && (
        <>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          <View style={styles.quizDetailsContainer}>
            <Text style={styles.quizDetails}>Difficulty: {quiz.difficulty}</Text>
            <Text style={styles.quizDetails}>Duration: {quiz.duration} mins</Text>
            <Text style={styles.quizDetails}>Expires At: {new Date(quiz.expiresAt).toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default QuizStart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: RFValue(20),
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: RFValue(16),
    color: '#8B5CF6',
    marginTop: RFValue(12),
    fontWeight: '600',
  },
  quizTitle: {
    fontSize: RFValue(26),
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: RFValue(15),
    textAlign: 'center',
  },
  quizDescription: {
    fontSize: RFValue(16),
    color: '#6B7280',
    marginBottom: RFValue(20),
    textAlign: 'center',
    lineHeight: RFValue(22),
  },
  quizDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RFValue(16),
    padding: RFValue(20),
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: RFValue(30),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quizDetails: {
    fontSize: RFValue(14),
    color: '#4B5563',
    marginBottom: RFValue(8),
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: RFValue(16),
    borderRadius: RFValue(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: RFValue(40),
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  startButtonText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    fontSize: RFValue(18),
    color: '#EF4444',
    textAlign: 'center',
    marginTop: RFValue(20),
  },
});
