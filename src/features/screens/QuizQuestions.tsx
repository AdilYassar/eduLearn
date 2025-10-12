import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { useQuiz } from '@service/hooks/useQuiz';
import { navigate } from '../../utils/Navigation';
import QuestionCard from '../../components/ui/QuestionCard';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionItem {
  _id: string;
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  difficulty?: string;
  points?: number;
  quiz?: string;
}

interface QuizSubmissionResponse {
  submission: {
    _id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    grade: string;
    attemptNumber: number;
    timeSpent: number;
    completedAt: string;
  };
  marksSummary: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
  };
}

const QuizQuestions = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResponse | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);
  const { getQuizQuestions, submitQuiz } = useQuiz();
  const route = useRoute();
  const { quizId, courseId } = route.params as { quizId: string; courseId?: string };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const result = await getQuizQuestions(quizId);
        console.log('Quiz questions result:', JSON.stringify(result, null, 2));
        if (result) {
          // Log first question to see structure
          if (result.length > 0) {
            console.log('First question structure:', result[0]);
            console.log('Question field:', result[0].question);
            console.log('Options:', result[0].options);
          }
          setQuestions(result as any);
        } else {
          setError('No questions available for this quiz');
        }
      } catch (fetchError) {
        console.error('Error fetching quiz questions:', fetchError);
        setError('Error fetching quiz questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId, getQuizQuestions]);

  const handleAnswerSelection = (questionId: string, selectedOption: string) => {
    if (!submissionResult) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    }
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const goToPreviousQuestion = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !selectedAnswers[q._id]);
    if (unansweredQuestions.length > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmitting(true);
    
    try {
      // Get access token directly from 'accessToken' key
      const token = await AsyncStorage.getItem('accessToken');
      
      console.log('Token retrieved:', token ? `Found token of length ${token.length}` : 'No token found');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        Alert.alert('Error', 'Authentication required. Please log in again.');
        setSubmitting(false);
        return;
      }

      // Check if token looks valid (should be a JWT)
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.log('Invalid token format detected:', token.substring(0, 50));
        setError('Invalid authentication token. Please log in again.');
        Alert.alert('Error', 'Invalid authentication token. Please log in again.');
        setSubmitting(false);
        return;
      }

      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Format answers according to API specification
      const formattedAnswers = questions.map(question => ({
        question: question._id, // Using 'question' field as per API spec
        answer: selectedAnswers[question._id] || '',
      }));

      // Submit quiz to server
      const submissionData = {
        quizId,
        answers: formattedAnswers,
        timeSpent,
        ...(courseId && { courseId }), // Include courseId if provided
      };

      console.log('Submitting quiz with data:', JSON.stringify(submissionData, null, 2));
      console.log('Using token length:', token.length);
      console.log('Token start:', token.substring(0, 50) + '...');

      const result = await submitQuiz(submissionData, token);
      
      console.log('Quiz submission result:', result);
      
      if (result) {
        console.log('Quiz submitted successfully!');
        console.log('Score:', result.submission.correctAnswers, '/', result.submission.totalQuestions);
        console.log('Percentage:', result.submission.percentage + '%');
        console.log('Grade:', result.submission.grade);
        setSubmissionResult(result);
        
        // Update local marks summary for offline access
        await updateLocalMarksSummary({
          quizId,
          score: result.submission.correctAnswers,
          total: result.submission.totalQuestions,
          percentage: result.submission.percentage,
          grade: result.submission.grade,
          submittedAt: result.submission.completedAt,
        });
        
        Alert.alert(
          'Quiz Submitted Successfully!',
          `Your Score: ${result.submission.correctAnswers}/${result.submission.totalQuestions} (${result.submission.percentage}%)\nGrade: ${result.submission.grade}`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('Quiz submission failed - no result returned');
        Alert.alert('Submission Failed', 'Failed to submit quiz. Please try again.');
      }
    } catch (submitError: any) {
      console.error('Error submitting quiz:', submitError);
      console.error('Error details:', JSON.stringify(submitError, null, 2));
      Alert.alert('Error', `An error occurred while submitting the quiz: ${submitError.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const updateLocalMarksSummary = async (newQuizData: {
    quizId: string;
    score: number;
    total: number;
    percentage: number;
    grade: string;
    submittedAt: string;
  }) => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const marksSummary = userData.marksSummary || [];
        const updatedMarksSummary = [...marksSummary, newQuizData];

        const updatedUserData = {
          ...userData,
          marksSummary: updatedMarksSummary,
        };

        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        console.log('Local marks summary updated successfully');
      }
    } catch (updateError) {
      console.error('Error updating local marks summary:', updateError);
    }
  };

  const renderQuestionCard = ({ item, index }: { item: QuestionItem; index: number }) => {
    const isTrueFalse = item.type === 'true-false' ||
                        (item.options && item.options.length === 2 &&
                         item.options.some(opt => opt.toLowerCase() === 'true') &&
                         item.options.some(opt => opt.toLowerCase() === 'false'));

    return (
      <QuestionCard
        question={item.question}
        questionNumber={index + 1}
        totalQuestions={questions.length}
        questionType={item.type}
        options={item.options}
        selectedAnswer={selectedAnswers[item._id]}
        correctAnswer={submissionResult ? item.correctAnswer : undefined}
        isSubmitted={!!submissionResult}
        isTrueFalse={isTrueFalse}
        onSelectAnswer={(answer) => handleAnswerSelection(item._id, answer)}
      />
    );
  };

  const renderOldQuestion = ({ item, index }: { item: QuestionItem; index: number }) => {
    const userAnswer = selectedAnswers[item._id];
    const isSubmitted = !!submissionResult;
    
    // Determine if it's a true/false question
    const isTrueFalse = item.type === 'true-false' || 
                        (item.options && item.options.length === 2 && 
                         item.options.some(opt => opt.toLowerCase() === 'true') && 
                         item.options.some(opt => opt.toLowerCase() === 'false'));

    return (
      <View style={styles.questionCard}>
        <Text style={styles.questionNumber}>Question {index + 1} of {questions.length}</Text>
        <Text style={styles.questionText}>{item.question}</Text>
        
        {isTrueFalse && (
          <Text style={styles.questionType}>True / False</Text>
        )}
        
        {item.options?.map((originalOption, optionIndex) => {
          // For display purposes, normalize true/false
          const displayOption = isTrueFalse ? 
            (originalOption.toLowerCase() === 'true' ? 'True' : 
             originalOption.toLowerCase() === 'false' ? 'False' : originalOption) : 
            originalOption;
          
          // Use original option for comparison to handle case sensitivity
          const normalizedAnswer = userAnswer?.toLowerCase();
          const normalizedOption = originalOption.toLowerCase();
          const normalizedCorrect = item.correctAnswer.toLowerCase();
          
          const isSelected = normalizedAnswer === normalizedOption;
          const isCorrect = normalizedOption === normalizedCorrect;
          
          // Determine styles based on selection and submission state
          const getOptionStyle = () => {
            if (isSubmitted) {
              if (isSelected) {
                return isCorrect
                  ? [styles.optionButton, styles.selectedCorrect]
                  : [styles.optionButton, styles.selectedIncorrect];
              } else if (isCorrect) {
                return [styles.optionButton, styles.correctAnswerHighlight];
              }
              return styles.optionButton;
            } else if (isSelected) {
              return [styles.optionButton, styles.selectedOption];
            }
            return styles.optionButton;
          };

          return (
            <TouchableOpacity
              key={optionIndex}
              style={getOptionStyle()}
              onPress={() => handleAnswerSelection(item._id, originalOption)}
              disabled={isSubmitted}
            >
              <Text style={[
                styles.optionText,
                isSelected && !isSubmitted && styles.selectedOptionText,
                isSubmitted && isCorrect && styles.correctAnswerText,
                isSubmitted && isSelected && !isCorrect && styles.incorrectAnswerText,
              ]}>
                {isTrueFalse ? displayOption : `${String.fromCharCode(65 + optionIndex)}. ${displayOption}`}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {isSubmitted && (
          <View style={styles.correctAnswerContainer}>
            <Text style={styles.correctAnswerLabel}>
              Correct Answer: {item.correctAnswer}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary_dark} />
        <Text style={styles.loadingText}>Loading quiz questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigate('QuizScreen')}>
          <Text style={styles.retryButtonText}>Back to Quizzes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('QuizScreen')} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Quiz Challenge</Text>
          <Text style={styles.headerSubtext}>
            {Object.keys(selectedAnswers).length}/{questions.length} answered
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Carousel - Only show when not submitted */}
      {!submissionResult && (
        <>
          <FlatList
            ref={flatListRef}
            data={questions}
            renderItem={renderQuestionCard}
            keyExtractor={(item) => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            scrollEnabled={!submissionResult}
          />

          {/* Floating Submit Button */}
          {currentIndex === questions.length - 1 && (
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  Object.keys(selectedAnswers).length === questions.length
                    ? styles.submitButtonActive
                    : styles.submitButtonInactive,
                ]}
                onPress={handleSubmitQuiz}
                disabled={submitting || Object.keys(selectedAnswers).length !== questions.length}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Quiz</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Results Screen - Only show after submission */}
      {submissionResult && (
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎉 Quiz Completed!</Text>
            <Text style={styles.scoreText}>
              {submissionResult.submission.correctAnswers}/{submissionResult.submission.totalQuestions}
            </Text>
            <Text style={styles.percentageText}>
              {submissionResult.submission.percentage}% - Grade: {submissionResult.submission.grade}
            </Text>
            <TouchableOpacity
              style={styles.backToQuizzesButton}
              onPress={() => navigate('QuizScreen')}
            >
              <Text style={styles.backToQuizzesButtonText}>Back to Quizzes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuizQuestions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: RFValue(11),
    color: '#E0E0E0',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: RFValue(20),
    left: RFValue(20),
    right: RFValue(20),
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(12),
    borderRadius: RFValue(12),
    borderWidth: 2,
    borderColor: Colors.primary_dark,
    backgroundColor: '#fff',
    gap: 6,
  },
  navButtonDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  navButtonText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: Colors.primary_dark,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: RFValue(24),
    paddingVertical: RFValue(14),
    borderRadius: RFValue(12),
    backgroundColor: Colors.primary_dark,
    gap: 6,
    elevation: 2,
    shadowColor: Colors.primary_dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    color: '#fff',
  },
  submitButton: {
    width: '100%',
    paddingVertical: RFValue(18),
    borderRadius: RFValue(16),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonActive: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  submitButtonInactive: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: RFValue(20),
    paddingBottom: RFValue(100), // Extra space to prevent truncation
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: RFValue(20),
    padding: RFValue(32),
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  resultTitle: {
    fontSize: RFValue(24),
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: RFValue(20),
    textAlign: 'center',
  },
  scoreText: {
    fontSize: RFValue(48),
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: RFValue(8),
  },
  percentageText: {
    fontSize: RFValue(18),
    color: '#666',
    marginBottom: RFValue(24),
    fontWeight: '600',
  },
  backToQuizzesButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: RFValue(40),
    paddingVertical: RFValue(14),
    borderRadius: RFValue(12),
    elevation: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backToQuizzesButtonText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: RFValue(16),
    color: Colors.secondary_dark,
    marginTop: RFValue(10),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: RFValue(20),
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: RFValue(18),
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: RFValue(20),
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: RFValue(30),
    paddingVertical: RFValue(12),
    borderRadius: RFValue(8),
  },
  retryButtonText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff',
  },
});
