import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { useQuiz } from '@service/hooks/useQuiz';
import { navigate } from '../../utils/Navigation';
import { useThemedStyles } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText, GlassCard } from '../../components/ui/ThemedComponents';

interface QuestionItem {
  _id: string;
  question?: string;
  text?: string;
  options?: string[];
  correctAnswer: string;
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
  const theme = useThemedStyles();

  const { getQuizQuestions, submitQuiz } = useQuiz();
  const route = useRoute();
  const { quizId, courseId } = route.params as { quizId: string; courseId?: string };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const result = await getQuizQuestions(quizId);
        if (result) {
          setQuestions(result);
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
      // Get authentication token
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        Alert.alert('Authentication Error', 'Please login again');
        navigate('Login');
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const token = userData.accessToken;
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        navigate('Login');
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

      const result = await submitQuiz(submissionData, token);
      
      if (result) {
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
        Alert.alert('Submission Failed', 'Failed to submit quiz. Please try again.');
      }
    } catch (submitError) {
      console.error('Error submitting quiz:', submitError);
      Alert.alert('Error', 'An error occurred while submitting the quiz. Please try again.');
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

  const renderQuestion = ({ item, index }: { item: QuestionItem; index: number }) => {
    const userAnswer = selectedAnswers[item._id];
    const isSubmitted = !!submissionResult;

    return (
      <GlassCard style={styles.questionCard} opacity={0.08}>
        <ThemedText style={styles.questionNumber}>Question {index + 1} of {questions.length}</ThemedText>
        <ThemedText style={styles.questionText}>{item.question || item.text}</ThemedText>
        {item.options && item.options.length > 0 ? (
          item.options.map((option, optionIndex) => {
            const isSelected = userAnswer === option;
            let optionStyle: any[] = [styles.optionButton];
            let textStyle: any[] = [styles.optionText];
            
            if (isSubmitted) {
              const isCorrect = option === item.correctAnswer;
              if (isSelected) {
                if (isCorrect) {
                  optionStyle.push(styles.selectedCorrect);
                  textStyle.push(styles.correctAnswerText);
                } else {
                  optionStyle.push(styles.selectedIncorrect);
                  textStyle.push(styles.incorrectAnswerText);
                }
              } else if (isCorrect) {
                optionStyle.push(styles.correctAnswerHighlight);
                textStyle.push(styles.correctAnswerText);
              }
            } else if (isSelected) {
              optionStyle.push(styles.selectedOption);
              textStyle.push(styles.selectedOptionText);
            }

            return (
              <TouchableOpacity
                key={optionIndex}
                style={optionStyle}
                onPress={() => handleAnswerSelection(item._id, option)}
                disabled={isSubmitted}
              >
                <ThemedText style={textStyle}>
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </ThemedText>
              </TouchableOpacity>
            );
          })
        ) : (
          <TextInput
            style={styles.textInputStyle}
            placeholder="Type your answer here..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={userAnswer || ''}
            onChangeText={(text) => handleAnswerSelection(item._id, text)}
            editable={!isSubmitted}
            multiline
          />
        )}
        
        {isSubmitted && (
          <View style={styles.correctAnswerContainer}>
            <ThemedText style={styles.correctAnswerLabel}>
              Correct Answer: {item.correctAnswer}
            </ThemedText>
          </View>
        )}
      </GlassCard>
    );
  };

  if (loading) {
    return (
      <ThemedContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={styles.loadingText}>Loading quiz questions...</ThemedText>
      </ThemedContainer>
    );
  }

  if (error) {
    return (
      <ThemedContainer style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={() => navigate('QuizScreen')}>
          <ThemedText style={styles.retryButtonText}>Back to Quizzes</ThemedText>
        </TouchableOpacity>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <ThemedText style={styles.headerText}>Quiz Questions</ThemedText>
        <ThemedText style={styles.progressText}>
          {Object.keys(selectedAnswers).length}/{questions.length} answered
        </ThemedText>
      </View>
      
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.submitButtonContainer}>
        {!submissionResult ? (
          <TouchableOpacity 
            onPress={handleSubmitQuiz} 
            style={[
              styles.submitButton,
              Object.keys(selectedAnswers).length === questions.length 
                ? styles.submitButtonActive 
                : styles.submitButtonInactive
            ]}
            disabled={submitting || Object.keys(selectedAnswers).length !== questions.length}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                Submit Quiz ({Object.keys(selectedAnswers).length}/{questions.length})
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <ThemedText style={styles.scoreText}>
              Final Score: {submissionResult.submission.correctAnswers}/{submissionResult.submission.totalQuestions}
            </ThemedText>
            <ThemedText style={styles.percentageText}>
              {submissionResult.submission.percentage}% - Grade: {submissionResult.submission.grade}
            </ThemedText>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigate('QuizScreen')}
            >
              <ThemedText style={styles.backButtonText}>Back to Quizzes</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ThemedContainer>
  );
};

export default QuizQuestions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary_dark,
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  progressText: {
    fontSize: RFValue(14),
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: RFValue(15),
    paddingVertical: RFValue(20),
  },
  questionCard: {
    borderRadius: RFValue(12),
    padding: RFValue(20),
    marginBottom: RFValue(20),
  },
  questionNumber: {
    fontSize: RFValue(12),
    color: Colors.secondary_dark,
    marginBottom: RFValue(8),
    fontWeight: '500',
  },
  questionText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    marginBottom: RFValue(15),
    lineHeight: RFValue(24),
  },
  optionButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RFValue(8),
    padding: RFValue(15),
    marginBottom: RFValue(10),
    backgroundColor: 'transparent',
  },
  textInputStyle: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: RFValue(8),
    padding: RFValue(15),
    minHeight: RFValue(60),
    color: '#fff',
    backgroundColor: 'transparent',
    fontFamily: 'OpenSans-Regular',
    fontSize: RFValue(14),
    marginTop: RFValue(10),
  },
  selectedOption: {
    borderColor: Colors.primary_dark,
    backgroundColor: Colors.teal_100,
  },
  selectedCorrect: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  selectedIncorrect: {
    borderColor: '#dc3545',
    backgroundColor: '#f8d7da',
  },
  correctAnswerHighlight: {
    borderColor: '#28a745',
    backgroundColor: '#d4edda',
  },
  optionText: {
    fontSize: RFValue(16),
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: Colors.primary_dark,
  },
  correctAnswerText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  incorrectAnswerText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  correctAnswerContainer: {
    marginTop: RFValue(15),
    paddingTop: RFValue(15),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  correctAnswerLabel: {
    fontSize: RFValue(14),
    color: '#28a745',
    fontWeight: 'bold',
  },
  submitButtonContainer: {
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(15),
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  submitButton: {
    borderRadius: RFValue(8),
    paddingVertical: RFValue(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonActive: {
    backgroundColor: Colors.primary_dark,
  },
  submitButtonInactive: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: RFValue(10),
  },
  scoreText: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    marginBottom: RFValue(5),
  },
  percentageText: {
    fontSize: RFValue(16),
    color: '#666',
    marginBottom: RFValue(15),
  },
  backButton: {
    backgroundColor: Colors.teal_300,
    paddingHorizontal: RFValue(30),
    paddingVertical: RFValue(12),
    borderRadius: RFValue(8),
  },
  backButtonText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: Colors.primary_dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: Colors.primary_dark,
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
