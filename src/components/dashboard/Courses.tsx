import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FileText, BookOpen } from 'lucide-react-native';
import { push } from '../../utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCourse } from '../../service/hooks/useCourse';

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.75;
const cardSpacing = 16;

const Courses = ({ bgColor, refreshTrigger }: { bgColor?: any; refreshTrigger?: number }) => {
  const { theme } = useTheme();
  const { getEnrollmentStats, loading } = useCourse();
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const fetchCourses = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;

      const stats = await getEnrollmentStats(accessToken);
      if (stats && stats.enrolledCourses) {
        setCourses(stats.enrolledCourses.slice(0, 6));
      }
    } catch (fetchError) {
      console.error('Error fetching enrolled courses:', fetchError);
    }
  }, [getEnrollmentStats]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, refreshTrigger]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Continue learning</Text>
        </View>
        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 32 }} />
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Continue learning</Text>
        </View>
        <View style={[styles.emptyCard, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }]}>
          <BookOpen size={32} color={theme.text.secondary} style={{ marginBottom: 12, opacity: 0.5 }} />
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Courses Yet</Text>
          <Text style={[styles.emptyDesc, { color: theme.text.secondary }]}>
            You haven't enrolled yet. Browse our selection and start your learning journey!
          </Text>
          <TouchableOpacity activeOpacity={0.8} style={[styles.browseBtn, { backgroundColor: theme.primary }]} onPress={() => push('CourseScreen')}>
             <Text style={styles.browseText}>Browse courses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Continue learning</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => push('CourseScreen')}>
          <Text style={[styles.viewAll, { color: theme.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
      >
        {courses.map((course, index) => (
          <TouchableOpacity 
            key={course._id || index.toString()} 
            activeOpacity={0.9} 
            onPress={() => push('TheoryScreen', { courseId: course._id })}
            style={{ width: cardWidth, marginRight: cardSpacing }}
          >
            <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }]}>
              
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: `rgba(${parseInt(theme.primary.substring(1, 3), 16)}, ${parseInt(theme.primary.substring(3, 5), 16)}, ${parseInt(theme.primary.substring(5, 7), 16)}, 0.1)` }]}>
                  <FileText size={18} color={theme.primary} />
                </View>
                
                <View style={styles.textStack}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.courseTitle, { color: theme.text.primary }]} numberOfLines={1}>{course.title}</Text>
                    {index === 0 && ( 
                      <View style={[styles.proBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.proText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.chapterText, { color: theme.text.secondary }]}>Continue module</Text>
                </View>
              </View>

              {/* Progress Bar (Visual aesthetic track) */}
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${60 - (index * 15)}%` }]} />
              </View>

            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  carouselContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textStack: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  chapterText: {
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  browseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  browseText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Courses;
