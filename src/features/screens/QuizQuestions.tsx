import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';

interface QuestionItem {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const QuizQuestions = () => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state
  const [score, setScore] = useState(0); // Track score

  const route = useRoute();
  const { quizId } = route.params as { quizId: string };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`https://3506-101-53-234-27.ngrok-free.app/api/quiz/${quizId}/questions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch questions for quiz ${quizId} with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Quiz Questions fetched:', data);

        if (data?.questions) {
          setQuestions(data.questions);
        } else {
          setError('No questions available for this quiz');
        }
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setError('Error fetching quiz questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizId]);

  const handleAnswerSelection = (questionId: string, selectedOption: string) => {
    if (!selectedAnswers[questionId]) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    }
  };

  const handleSubmitQuiz = () => {
    let calculatedScore = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question._id] === question.correctAnswer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true); // Mark quiz as submitted
  };

  const renderQuestion = ({ item }: { item: QuestionItem }) => {
    const userAnswer = selectedAnswers[item._id];

    return (
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{item.text}</Text>
        {item.options.map((option, index) => {
          const isSelected = userAnswer === option;
          const isCorrect = option === item.correctAnswer;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionText, isSelected && (isCorrect ? styles.selectedCorrect : styles.selectedIncorrect)]}
              onPress={() => handleAnswerSelection(item._id, option)}
              disabled={isSubmitted || !!userAnswer} // Disable after selection or after submission
            >
              <Text style={styles.optionTextStyle}>{index + 1}. {option}</Text>
            </TouchableOpacity>
          );
        })}
        {isSubmitted && (
          <Text style={styles.correctAnswerText}>
            Correct Answer: {item.correctAnswer}
          </Text>
        )}
      </View>
    );
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
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.submitButtonContainer}>
        {!isSubmitted ? (
          <TouchableOpacity onPress={handleSubmitQuiz} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.scoreText}>Your Score: {score}/{questions.length}</Text>
        )}
      </View>
    </View>
  );
};

export default QuizQuestions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: RFValue(15),
    backgroundColor: '#fff', // White background for better contrast
  },
  questionCard: {
    marginBottom: RFValue(20),
    backgroundColor: Colors.teal_100,
    borderRadius: RFValue(10),
    padding: RFValue(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  questionText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#333', // Dark color for text
    marginBottom: RFValue(15),
    lineHeight: RFValue(24),
  },
  optionText: {
    fontSize: RFValue(16),
    color: '#333', // Darker text color
    marginBottom: RFValue(12),
    padding: RFValue(15),
    borderRadius: RFValue(8),
    borderWidth: 1,
    borderColor: '#bbb', // Darker borders
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  selectedCorrect: {
    backgroundColor: '#28a745', // Green for correct answers
    borderColor: '#28a745',
    color: 'white',
  },
  selectedIncorrect: {
    backgroundColor: '#dc3545', // Red for incorrect answers
    borderColor: '#dc3545',
    color: 'white',
  },
  optionTextStyle: {
    color: 'black',
    fontWeight: '500',
  },
  correctAnswerText: {
    fontSize: RFValue(14),
    color: '#28a745', // Green color for correct answers
    marginTop: RFValue(10),
  },
  listContent: {
    paddingBottom: RFValue(20),
  },
  errorText: {
    fontSize: RFValue(18),
    color: '#dc3545', // Red color for error messages
    textAlign: 'center',
    marginTop: RFValue(20),
  },
  submitButtonContainer: {
    marginTop: RFValue(4),
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.primary_dark,
    padding: RFValue(12),
    borderRadius: RFValue(25),
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: RFValue(18),
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    marginTop: RFValue(10),
    color: Colors.primary_dark,
  },
});
