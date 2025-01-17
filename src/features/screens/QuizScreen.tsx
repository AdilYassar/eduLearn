import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { navigate } from '../../utils/Navigation';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { BASE_URL } from '@service/config';

const QuizScreen = () => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all quizzes when the component mounts
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/allquiz`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', data); // Log the response data

        if (data?.quizzes && Array.isArray(data.quizzes)) {
          setQuizzes(data.quizzes);
        } else {
          console.log('No quizzes found');
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, []);

  interface QuizItem {
    _id: string;
    title: string;
    description: string;
  }

  const handleQuizClick = (quizId: string) => {
    // Navigate to the QuizStartScreen with the quizId
    navigate('QuizStart', { quizId });
  };

  const renderQuiz = ({ item }: { item: QuizItem }) => (
    <Animated.View entering={FadeIn.duration(500).easing(Easing.ease)}>
      <TouchableOpacity
        onPress={() => handleQuizClick(item._id)}
        style={styles.quizCard}
      >
        <Text style={styles.quizTitle}>{item.title}</Text>
        <Text style={styles.quizDescription}>{item.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>All Quizzes</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary_dark} />
      ) : quizzes.length > 0 ? (
        <FlatList
          data={quizzes}
          renderItem={renderQuiz}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noQuizzesText}>No quizzes available.</Text>
      )}
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: RFValue(10),
    paddingTop: RFValue(20),
  },
  headerText: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    textAlign: 'center',
    marginBottom: RFValue(20),
    fontFamily: 'Roboto',
  },
  listContent: {
    paddingBottom: RFValue(20),
  },
  quizCard: {
    backgroundColor: Colors.teal_300,
    borderRadius: RFValue(15),
    padding: RFValue(20),
    marginBottom: RFValue(15),
    elevation: 5,
    shadowColor: Colors.primary_dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  quizCardHovered: {
    transform: [{ scale: 1.05 }],
  },
  quizTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    marginBottom: RFValue(10),
    fontFamily: 'Roboto',
  },
  quizDescription: {
    fontSize: RFValue(14),
    color: Colors.secondary_dark,
    fontFamily: 'Roboto',
  },
  noQuizzesText: {
    fontSize: RFValue(16),
    color: Colors.secondary_dark,
    textAlign: 'center',
    marginTop: RFValue(20),
  },
});
