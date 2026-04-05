import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, FlatList, Dimensions, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { useQuiz } from '@service/hooks/useQuiz';
import { navigate, goBack } from '../../utils/Navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeIn, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedContainer, ThemedText } from '../../components/ui/ThemedComponents';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionItem {
  _id: string;
  question: string;
  type: string;
  options: string[];
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
  };
}

const QuizQuestions = () => {
  const { theme } = useTheme();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);
  const { getQuizQuestions, submitQuiz } = useQuiz();
  const route = useRoute();
  const { quizId, courseId } = route.params as { quizId: string; courseId?: string };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const result = await getQuizQuestions(quizId);
        if (result) setQuestions(result as any);
        else setError('No questions available.');
      } catch (err) {
        setError('Connection failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handleAnswerSelection = (questionId: string, selectedOption: string) => {
    if (!submissionResult) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
      // Optional: auto-advance to next question
      if (currentIndex < questions.length - 1) {
         setTimeout(() => {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
         }, 400);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const formattedAnswers = questions.map(q => ({
        question: q._id,
        answer: selectedAnswers[q._id] || '',
      }));

      const result = await submitQuiz({
        quizId,
        answers: formattedAnswers,
        timeSpent: 60, // Mock time spent
        ...(courseId && { courseId }),
      }, token);
      
      if (result) setSubmissionResult(result);
    } catch (err) {
      Alert.alert('Error', 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = ({ item, index }: { item: QuestionItem; index: number }) => {
    const userAnswer = selectedAnswers[item._id];
    
    return (
      <View style={styles.questionPage}>
         <GlassCard style={styles.questionCard} opacity={0.12}>
            <Text style={[styles.qNum, { color: theme.primary }]}>QUESTION {index + 1}</Text>
            <Text style={[styles.qText, { color: theme.text.primary }]}>{item.question}</Text>
            
            <View style={styles.optionsWrap}>
               {item.options && item.options.length > 0 ? (
                  item.options.map((opt, oIdx) => {
                     const isSelected = userAnswer === opt;
                     return (
                       <TouchableOpacity 
                         key={oIdx}
                         activeOpacity={0.8}
                         onPress={() => handleAnswerSelection(item._id, opt)}
                         style={[
                             styles.optionBtn, 
                             { 
                                 backgroundColor: isSelected ? theme.primary : 'rgba(255,255,255,0.03)',
                                 shadowColor: isSelected ? theme.primary : 'transparent',
                             }
                         ]}
                       >
                         <Text style={[styles.optText, { color: isSelected ? '#FFF' : theme.text.secondary }]}>
                            {opt}
                         </Text>
                         {isSelected && <Icon name="check-circle" size={20} color="#FFF" />}
                       </TouchableOpacity>
                     );
                  })
               ) : (
                  <TextInput
                     style={[styles.textInputStyle, { color: theme.text.primary, borderColor: 'rgba(255,255,255,0.2)' }]}
                     placeholder="Type your answer here..."
                     placeholderTextColor={theme.text.secondary}
                     value={userAnswer || ''}
                     onChangeText={(text) => handleAnswerSelection(item._id, text)}
                     multiline
                  />
               )}
            </View>
         </GlassCard>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedContainer style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedContainer>
    );
  }

  const progress = (currentIndex + 1) / questions.length;

  return (
    <ThemedContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()}>
            <Icon name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
            <View style={[styles.progressBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Animated.View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.progressLabel, { color: theme.text.secondary }]}>{currentIndex + 1} / {questions.length}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {!submissionResult ? (
        <>
          <FlatList
            ref={flatListRef}
            data={questions}
            renderItem={renderQuestion}
            keyExtractor={item => item._id}
            horizontal
            pagingEnabled
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
               const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
               if (newIndex !== currentIndex) {
                  setCurrentIndex(newIndex);
               }
            }}
          />

          <View style={styles.footer}>
             {currentIndex === questions.length - 1 ? (
                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: theme.primary }]} 
                  onPress={handleSubmitQuiz}
                  disabled={submitting}
                >
                   {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>FINISH MISSION</Text>}
                </TouchableOpacity>
             ) : (
                <TouchableOpacity 
                    style={[styles.nextBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]} 
                    onPress={() => {
                        const next = currentIndex + 1;
                        setCurrentIndex(next);
                        flatListRef.current?.scrollToIndex({ index: next, animated: true });
                    }}
                >
                    <Text style={[styles.nextText, { color: theme.text.primary }]}>SKIP QUESTION</Text>
                    <Icon name="arrow-forward" size={20} color={theme.text.primary} />
                </TouchableOpacity>
             )}
          </View>
        </>
      ) : (
        <View style={styles.resultView}>
           <Animated.View entering={FadeInUp.duration(1000)}>
              <GlassCard style={styles.resultCard} opacity={0.12} glow={true}>
                 <Text style={[styles.resTitle, { color: theme.text.primary }]}>MISSION COMPLETE</Text>
                 <View style={[styles.gradeCircle, { borderColor: theme.primary }]}>
                    <Text style={[styles.gradeText, { color: theme.primary }]}>{submissionResult.submission.grade}</Text>
                 </View>
                 <Text style={[styles.scoreSummary, { color: theme.text.secondary }]}>
                    You achieved a score of {submissionResult.submission.percentage}% with accuracy.
                 </Text>
                 
                 <TouchableOpacity style={[styles.doneBtn, { backgroundColor: theme.primary }]} onPress={() => navigate('QuizScreen')}>
                    <Text style={styles.btnText}>RETURN TO BASE</Text>
                 </TouchableOpacity>
              </GlassCard>
           </Animated.View>
        </View>
      )}
    </ThemedContainer>
  );
};

const Text = ({ children, style }: any) => <ThemedText style={style}>{children}</ThemedText>;

const styles = StyleSheet.create({
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressTrack: {
    flex: 1,
    marginHorizontal: 30,
    alignItems: 'center',
  },
  progressBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  questionPage: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  questionCard: {
    padding: 30,
    minHeight: 400,
  },
  qNum: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  qText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    lineHeight: 32,
    marginBottom: 40,
  },
  optionsWrap: {
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  optText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInputStyle: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    minHeight: 120,
    fontSize: 16,
    fontFamily: 'Manrope',
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  submitBtn: {
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  nextText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  resultCard: {
    padding: 40,
    alignItems: 'center',
  },
  resTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: 30,
  },
  gradeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeText: {
    fontSize: 50,
    fontWeight: '900',
  },
  scoreSummary: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 40,
  },
  doneBtn: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default QuizQuestions;
