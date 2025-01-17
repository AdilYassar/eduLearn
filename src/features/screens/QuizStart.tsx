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
    return <ActivityIndicator size="large" color={Colors.primary_dark} />;
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
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: RFValue(26),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    marginBottom: RFValue(15),
    textAlign: 'center',
  },
  quizDescription: {
    fontSize: RFValue(16),
    color: Colors.secondary_dark,
    marginBottom: RFValue(20),
    textAlign: 'center',
    lineHeight: RFValue(22),
  },
  quizDetailsContainer: {
    backgroundColor: '#fff',
    borderRadius: RFValue(10),
    padding: RFValue(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: RFValue(30),
  },
  quizDetails: {
    fontSize: RFValue(14),
    color: Colors.secondary_dark,
    marginBottom: RFValue(8),
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: Colors.primary_dark,
    paddingVertical: RFValue(12),
    borderRadius: RFValue(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: RFValue(40),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    fontSize: RFValue(18),
    color: 'red',
    textAlign: 'center',
    marginTop: RFValue(20),
  },
});
