import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { goBack, navigate } from '../../utils/Navigation';
import { BASE_URL } from '@service/config';
import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, GlassCard, ThemedText } from '../../components/ui/ThemedComponents';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

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
  const { theme } = useTheme();
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

        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        if (data?.quiz) setQuiz(data.quiz);
        else setError('Mission Data Not Found');
      } catch (err) {
        setError('Connection to Observatory Interrupted');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizById();
  }, [quizId]);

  const startQuiz = () => {
    navigate('QuizQuestions', { quizId });
  };

  if (loading) {
    return (
      <ThemedContainer style={styles.center}>
        <ActivityIndicator size="large" color={theme.text.primary || '#FFF'} />
        <Text style={[styles.loadingText, { color: theme.text.primary || '#FFF' }]}>Syncing Briefing...</Text>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()}>
            <Icon name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {quiz ? (
          <Animated.View entering={FadeInUp.duration(800)}>
            <GlassCard style={styles.briefingCard} opacity={0.12} glow={true}>
               <View style={styles.iconBox}>
                  <Icon name="assignment" size={40} color={theme.primary} />
               </View>
               
               <Text style={[styles.title, { color: theme.text.primary }]}>{quiz.title}</Text>
               <Text style={[styles.desc, { color: theme.text.secondary }]}>{quiz.description}</Text>
               
               <View style={styles.divider} />
               
               <View style={styles.paramsGrid}>
                  <View style={styles.paramItem}>
                     <Icon name="psychology" size={20} color={theme.primary} />
                     <Text style={[styles.paramLabel, { color: theme.text.secondary }]}>DIFFICULTY</Text>
                     <Text style={[styles.paramVal, { color: theme.text.primary }]}>{quiz.difficulty.toUpperCase()}</Text>
                  </View>
                  <View style={styles.paramItem}>
                     <Icon name="timer" size={20} color={theme.primary} />
                     <Text style={[styles.paramLabel, { color: theme.text.secondary }]}>DURATION</Text>
                     <Text style={[styles.paramVal, { color: theme.text.primary }]}>{quiz.duration} MINS</Text>
                  </View>
                  <View style={styles.paramItem}>
                     <Icon name="stars" size={20} color={theme.primary} />
                     <Text style={[styles.paramLabel, { color: theme.text.secondary }]}>REWARD</Text>
                     <Text style={[styles.paramVal, { color: theme.text.primary }]}>500 XP</Text>
                  </View>
               </View>
            </GlassCard>

            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={startQuiz}
              style={styles.btnShadow}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.engageBtn}
              >
                <Text style={styles.btnText}>ENGAGE MISSION</Text>
                <Icon name="double-arrow" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Text style={{ color: theme.text.secondary }}>{error}</Text>
        )}
      </View>
    </ThemedContainer>
  );
};

// Local component to avoid conflicts
const Text = ({ children, style }: any) => <ThemedText style={style}>{children}</ThemedText>;

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  briefingCard: {
    padding: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 30,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 30,
  },
  paramsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paramItem: {
    alignItems: 'center',
    flex: 1,
  },
  paramLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  paramVal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  btnShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  engageBtn: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  btnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: 'Manrope',
  },
});

export default QuizStart;
