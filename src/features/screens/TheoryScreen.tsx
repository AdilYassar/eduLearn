import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Loading from '@components/ui/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useLearningMaterials } from '@service/hooks/useLearningMaterials';
import { askAI } from '@components/dashboard/askAi';
import { navigate, goBack } from '@utils/Navigation';
import ChapterCard from '@components/ui/ChapterCard';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedContainer } from '../../components/ui/ThemedComponents';

const { width } = Dimensions.get('window');

interface Chapter {
  _id: string;
  title: string;
  content: string;
  course: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
}

interface Theory {
  courseTitle: string;
  description: string;
  imageUrl: string;
  chapters: Chapter[];
}

const TheoryScreen = () => {
  const { theme } = useTheme();
  type TheoryScreenRouteProp = RouteProp<{ params: { courseId: string } }, 'params'>;
  const route = useRoute<TheoryScreenRouteProp>();
  const { courseId } = route.params;

  const [theory, setTheory] = useState<Theory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingChapter, setUpdatingChapter] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const { getTheoryByCourse, updateTheoryChapterStatus } = useLearningMaterials();

  useEffect(() => {
    fetchTheory();
  }, []);

  const fetchTheory = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication required.');
        setLoading(false);
        return;
      }
      const result = await getTheoryByCourse(courseId, accessToken);
      if (result) {
        setTheory({
          courseTitle: result.courseTitle || 'Course Theory',
          description: result.description || 'Theory content for this course.',
          imageUrl: '', 
          chapters: result.chapters || [],
        });
      } else {
        setError('No theory content found.');
      }
    } catch (err) {
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) newSet.delete(chapterId);
      else newSet.add(chapterId);
      return newSet;
    });
  };

  const handleStatusUpdate = async (chapter: Chapter) => {
    try {
      setUpdatingChapter(chapter._id);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;

      const success = await updateTheoryChapterStatus(
        courseId,
        chapter._id,
        chapter.status,
        accessToken
      );

      if (success) {
        await fetchTheory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingChapter(null);
    }
  };

  const handleChapterClick = async (chapterTitle: string) => {
    setLoading(true);
    try {
      const prompt = `You are an expert teacher... detailed guide on: '${chapterTitle}'...`;
      const generatedContent = await askAI(prompt);
      navigate('DescriptionScreen', { generatedContent});
    } catch (err) {
      setError('Failed to generate content.');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = theory?.chapters.filter(c => c.status === 'completed').length || 0;
  const totalCount = theory?.chapters.length || 1;
  const totalProgress = completedCount / totalCount;

  return (
    <ThemedContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => goBack()}>
            <ArrowLeft size={20} color={theme.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Theory Content</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <Loading message="Engaging Knowledge..." fullScreen={false} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {theory ? (
            <Animated.View entering={FadeIn.duration(800)}>
              <GlassCard style={styles.heroCard} opacity={0.1}>
                 <Text style={[styles.courseTitle, { color: theme.text.primary }]}>{theory.courseTitle}</Text>
                 <Text style={[styles.courseDesc, { color: theme.text.secondary }]}>{theory.description}</Text>
                 
                 <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                       <Text style={[styles.progressText, { color: theme.text.primary }]}>Overall Progress</Text>
                       <Text style={[styles.progressVal, { color: theme.primary }]}>{Math.round(totalProgress * 100)}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                       <Animated.View 
                        entering={FadeIn.delay(500)}
                        style={[
                            styles.progressBarFill, 
                            { 
                                width: `${totalProgress * 100}%`, 
                                backgroundColor: theme.primary,
                                // Removed shadowColor
                            }
                        ]} 
                       />
                    </View>
                 </View>
              </GlassCard>

              <View style={styles.chapterSection}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Modules</Text>
                {theory.chapters.map((chapter, index) => (
                  <Animated.View key={chapter._id} entering={FadeInDown.delay(index * 100)}>
                    <ChapterCard
                        _id={chapter._id}
                        title={chapter.title}
                        content={chapter.content}
                        _course={chapter.course}
                        status={chapter.status}
                        progress={chapter.progress}
                        timeSpent={chapter.timeSpent}
                        startedAt={chapter.startedAt}
                        completedAt={chapter.completedAt}
                        lastAccessedAt={chapter.lastAccessedAt}
                        chapterNumber={index + 1}
                        expanded={expandedChapters.has(chapter._id)}
                        showStatusModal={false}
                        onChapterPress={() => handleChapterClick(chapter.title)}
                        onStatusUpdate={(newStatus) => handleStatusUpdate({...chapter, status: newStatus})}
                        onExpandToggle={() => toggleChapterExpansion(chapter._id)}
                        isUpdating={updatingChapter === chapter._id}
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          ) : (
            <View style={styles.empty}>
               <Text style={{ color: theme.text.secondary }}>No content available.</Text>
            </View>
          )}
        </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    padding: 24,
    marginBottom: 24,
  },
  courseTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 8,
  },
  courseDesc: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 24,
  },
  progressSection: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    // Removed glow effect
  },
  chapterSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 16,
    paddingLeft: 4,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  }
});

export default TheoryScreen;
