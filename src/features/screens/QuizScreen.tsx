import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { navigate, goBack } from '../../utils/Navigation';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useQuiz } from '@service/hooks/useQuiz';
import { Zap, Clock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedContainer } from '../../components/ui/ThemedComponents';

const { width } = Dimensions.get('window');

interface QuizItem {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  hasQuiz?: boolean;
}

const QuizScreen = () => {
  const { theme } = useTheme();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const { getAllQuizzes, loading } = useQuiz();

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        const result = await getAllQuizzes();
        if (result) {
          const quizzesWithMockData = result.map((quiz, index) => ({
            ...quiz,
            hasQuiz: index < 3,
            dueDate: index < 3 ? 'Due Tonight' : undefined,
          }));
          setQuizzes(quizzesWithMockData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllQuizzes();
  }, [getAllQuizzes]);

  const handleQuizClick = (quizId: string) => {
    navigate('QuizStart', { quizId });
  };

  const renderQuiz = ({ item, index }: { item: QuizItem; index: number }) => {
    const isDue = item.hasQuiz;

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(600)}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleQuizClick(item._id)}>
          <GlassCard style={styles.quizCard} opacity={0.1} glow={isDue}>
             <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: isDue ? '#FF4F4F' : 'rgba(255,255,255,0.05)' }]}>
                    <Text style={[styles.statusText, { color: isDue ? '#FFF' : theme.text.secondary }]}>
                        {isDue ? 'CRITICAL' : 'OPTIONAL'}
                    </Text>
                </View>
                <Zap size={20} color={isDue ? '#FFD700' : theme.text.secondary} strokeWidth={2} />
             </View>
             
             <View style={styles.cardMain}>
                <Text style={[styles.quizTitle, { color: theme.text.primary }]}>{item.title}</Text>
                <Text style={[styles.quizDesc, { color: theme.text.secondary }]} numberOfLines={2}>
                    {item.description || 'Test your proficiency and earn bonus experience points.'}
                </Text>
             </View>

             <View style={styles.cardFooter}>
                <View style={styles.metaRow}>
                    <Clock size={14} color={theme.text.secondary} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: theme.text.secondary }]}>15 Mins</Text>
                    <Text style={[styles.metaDivider, { color: theme.text.secondary }]}>•</Text>
                    <Text style={[styles.metaText, { color: isDue ? '#FF4F4F' : theme.text.secondary }]}>
                        {isDue ? item.dueDate : 'No deadline'}
                    </Text>
                </View>
                <ChevronRight size={24} color={theme.text.primary} strokeWidth={2} />
             </View>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()}>
            <ArrowLeft size={20} color={theme.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Live Challenges</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : quizzes.length > 0 ? (
        <FlatList
          data={quizzes}
          renderItem={renderQuiz}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.center}>
            <Text style={{ color: theme.text.secondary }}>No current challenges.</Text>
        </View>
      )}
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  quizCard: {
    padding: 20,
    marginBottom: 20,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardMain: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 6,
  },
  quizDesc: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDivider: {
    opacity: 0.3,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default QuizScreen;
