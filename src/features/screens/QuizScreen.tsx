import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { navigate } from '../../utils/Navigation';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { useQuiz } from '@service/hooks/useQuiz';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QuizItem {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  hasQuiz?: boolean;
}

const QuizScreen = () => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const { getAllQuizzes, loading } = useQuiz();

  // Background colors for quiz cards
  const cardBackgrounds = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FFE0B2'];

  // Fetch all quizzes when the component mounts
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        const result = await getAllQuizzes();
        if (result) {
          // Add mock data for demonstration - in real app this would come from API
          const quizzesWithMockData = result.map((quiz, index) => ({
            ...quiz,
            hasQuiz: index < 3, // First 3 quizzes have quiz due
            dueDate: index < 3 ? 'Due Today' : undefined,
          }));
          setQuizzes(quizzesWithMockData);
        }
      } catch (fetchError) {
        console.error('Error fetching quizzes:', fetchError);
      }
    };

    fetchAllQuizzes();
  }, [getAllQuizzes]);

  const handleQuizClick = (quizId: string) => {
    // Navigate to the QuizStartScreen with the quizId
    navigate('QuizStart', { quizId });
  };

  const renderQuiz = ({ item, index }: { item: QuizItem; index: number }) => {
    const backgroundColor = cardBackgrounds[index % cardBackgrounds.length];
    const hasQuiz = item.hasQuiz;
    const dueTime = item.dueDate;

    return (
      <Animated.View entering={FadeIn.duration(500).easing(Easing.ease)}>
        <TouchableOpacity
          onPress={() => handleQuizClick(item._id)}
          style={[styles.quizCard, { backgroundColor }]}
        >
          <View style={styles.quizContent}>
            <View style={styles.darkRoundedFigure} />
            <View style={styles.quizTextContainer}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={[
                styles.quizStatus,
                hasQuiz ? styles.quizDue : styles.noQuizDue
              ]}>
                {hasQuiz ? dueTime : 'No Quiz due'}
              </Text>
            </View>
            <Image source={require('../../assets/getStarted/Uwarp.png')} style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('DashboardScreen')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Screen</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5B4FC6" style={styles.loader} />
      ) : quizzes.length > 0 ? (
        <FlatList
          data={quizzes}
          renderItem={renderQuiz}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: '#FDF8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
  placeholder: {
    width: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  quizCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  quizContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkRoundedFigure: {
    width: 8,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 4,
    marginRight: 16,
  },
  quizTextContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
    fontFamily: 'Inter-Bold',
  },
  quizStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
  quizDue: {
    color: '#FF4444',
  },
  noQuizDue: {
    color: '#000',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  noQuizzesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Inter-Regular',
  },
});
