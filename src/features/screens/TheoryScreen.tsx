import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLearningMaterials } from '@service/hooks/useLearningMaterials';
import { askAI } from '@components/dashboard/askAi';
import { navigate } from '@utils/Navigation';
import ChapterCard from '@components/ui/ChapterCard';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTheory = async () => {
    try {
      console.log('TheoryScreen: Fetching theory for courseId:', courseId);
      
      // Get access token from AsyncStorage
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('TheoryScreen: Access token found:', !!accessToken);
      
      if (!accessToken) {
        console.log('TheoryScreen: No access token found');
        setError('Authentication required. Please log in to view course content.');
        setLoading(false);
        return;
      }
      
      const result = await getTheoryByCourse(courseId, accessToken);
      console.log('TheoryScreen: Theory API result:', result);
      
      if (result) {
        console.log('TheoryScreen: Processing theory data:', {
          courseTitle: result.courseTitle,
          description: result.description,
          chapters: result.chapters,
        });
        
        // Use the theory data directly as it matches the expected format
        setTheory({
          courseTitle: result.courseTitle || 'Course Theory',
          description: result.description || 'Course theory content',
          imageUrl: '', // API doesn't provide image URL
          chapters: result.chapters || [],
        });
        console.log('TheoryScreen: Theory state set successfully');
      } else {
        console.log('TheoryScreen: No theory result returned');
        setError('No theory content found for this course');
      }
      setLoading(false);
    } catch (fetchError: any) {
      console.error('TheoryScreen: Error fetching theory:', fetchError);
      setError('Failed to load theory content');
      setLoading(false);
    }
  };

  const toggleChapterExpansion = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleStatusUpdate = async (chapter: Chapter) => {
    try {
      setUpdatingChapter(chapter._id);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        setError('Authentication required to update chapter status');
        return;
      }

      const success = await updateTheoryChapterStatus(
        courseId,
        chapter._id,
        chapter.status,
        accessToken
      );

      if (success) {
        // Refresh theory data to get updated status
        await fetchTheory();
        Alert.alert('Success', `Chapter status updated to ${chapter.status.replace('_', ' ')}`);
      } else {
        Alert.alert('Error', 'Failed to update chapter status');
      }
    } catch (updateError) {
      console.error('Error updating chapter status:', updateError);
      setError('Failed to update chapter status');
    } finally {
      setUpdatingChapter(null);
    }
  };

  const handleChapterClick = async (chapterTitle: string) => {
    setLoading(true);
    try {
      const prompt = `You are an expert teacher known for crafting comprehensive, engaging, and progressively structured explanations. Your task is to create a detailed guide on the topic: '${chapterTitle}'. Begin with a simple, beginner-friendly explanation to establish foundational understanding. Then transition to a more intermediate-level discussion to deepen the learner's knowledge. Finally, provide an advanced-level explanation to explore the complexities and nuances of the topic in depth. Ensure each level builds upon the previous one, using clear examples and concise language throughout.`;
      const generatedContent = await askAI(prompt);
      navigate('DescriptionScreen', { generatedContent});
    } catch (chapterError) {
      console.error('Error generating chapter content:', chapterError);
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../../assets/animations/student.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>
            {error || 'Fetching Course Details...'}
          </Text>
        </View>
      ) : (
        <>
          {theory ? (
            <>
              <View style={styles.courseHeader}>
                {theory.imageUrl && (
                  <Image
                    source={{ uri: theory.imageUrl }}
                    style={styles.courseImage}
                  />
                )}
                <Text style={styles.courseTitle}>{theory.courseTitle}</Text>
                <Text style={styles.description}>{theory.description}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.theoryContainer}>
                <Text style={styles.chapterTitle}>Chapters</Text>
                {theory.chapters.map((chapter, index) => (
                  <ChapterCard
                    key={chapter._id}
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
                ))}
              </ScrollView>
            </>
          ) : (
            <ScrollView contentContainerStyle={styles.theoryContainer}>
              <Text style={styles.noTheoryText}>No theory available for this course.</Text>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB', // Soft light blue background
    paddingTop: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  loadingAnimation: {
    width: 250,
    height: 250,
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6347',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  theoryContainer: {
    paddingTop: 0,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  courseHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    width: '100%',
    marginTop:-10,
    borderBottomLeftRadius:20,
    borderBottomRightRadius:20
  },
  courseImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 16,
    paddingLeft: 8,
  },
  noTheoryText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#BDC3C7',
    marginTop: 20,
  },
});

export default TheoryScreen;
