import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { navigate } from '@utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  chapters?: any[];
}

interface CoursesProps {
  bgColor?: string[];
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.75; // 75% of screen width
const cardSpacing = 16;

const Courses: React.FC<CoursesProps> = ({ bgColor = ['#FFFFFF', '#F5F5F5'] }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const { getEnrollmentStats, loading } = useCourse();

  // Course images array
  const courseImages = [
    require('../../assets/getStarted/100.png'),
    require('../../assets/getStarted/101.png'),
    require('../../assets/getStarted/102.png'),
    require('../../assets/getStarted/103.png'),
  ];

  // Background colors for course cards
  const cardBackgrounds = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0'];

  // Fetch enrolled courses on component mount
  const fetchCourses = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.log('No access token, cannot fetch enrolled courses');
        return;
      }

      // Get enrollment stats to get enrolled courses
      const stats = await getEnrollmentStats(accessToken);
      if (stats && stats.enrolledCourses) {
        // Show only enrolled courses, limit to 6 for dashboard carousel
        setCourses(stats.enrolledCourses.slice(0, 6));
      }
    } catch (fetchError) {
      console.error('Error fetching enrolled courses:', fetchError);
    }
  }, [getEnrollmentStats]);


  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseClick = (course: CourseItem) => {
    // Navigate to course content when clicked
    navigate('TheoryScreen', { courseId: course._id });
  };

  const renderCourseCard = ({ item, index }: { item: CourseItem; index: number }) => {
    const backgroundColor = cardBackgrounds[index % cardBackgrounds.length];
    
    // Use course ID to get consistent random image for each course
    let imageIndex = 0;
    if (item._id) {
      const idHash = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      imageIndex = idHash % courseImages.length;
    }
    const courseImage = courseImages[imageIndex];

    return (
      <Animated.View
        entering={FadeIn.duration(500)}
      >
        {/* Main Course Card - Clickable */}
        <TouchableOpacity
          style={styles.courseCard}
          onPress={() => handleCourseClick(item)}
          activeOpacity={0.8}
        >
          {/* TOP SECTION - Colored background with illustration */}
          <View style={[styles.courseInfoSection, { backgroundColor }]}>
            <Image
              source={courseImage}
              style={styles.courseImage}
            />
          </View>

          {/* BOTTOM SECTION - White title section */}
          <View style={styles.titleSection}>
            <Text style={styles.courseTitle}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleViewAllCourses = () => {
    navigate('CourseScreen');
  };

  if (loading) {
    return (
      <LinearGradient
        colors={bgColor}
        start={{ x: -1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.container}
      >
        <Text style={styles.title}>My Courses</Text>
        <ActivityIndicator size="large" color={Colors.primary_dark} style={styles.loader} />
      </LinearGradient>
    );
  }

  // Show empty state if no courses
  if (courses.length === 0) {
    return (
      <LinearGradient
        colors={bgColor}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.container}
      >
        <Text style={styles.title}>My Courses</Text>
        
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Icon name="school" size={48} color="#ccc" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Enrolled Courses</Text>
            <Text style={styles.emptyDescription}>
              You haven't enrolled in any courses yet. Browse available courses and start your learning journey!
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={handleViewAllCourses}>
              <Text style={styles.browseButtonText}>Browse Courses</Text>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={bgColor}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.title}>My Courses</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
      >
        {courses.map((course, index) => (
          <View key={course._id} style={styles.cardWrapper}>
            {renderCourseCard({ item: course, index })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllCourses}>
        <Text style={styles.viewAllText}>View All Courses</Text>
        <Icon name="arrow-forward" size={20} color={Colors.primary_dark} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginHorizontal: 16,
    fontFamily: 'Inter-Bold',
  },
  loader: {
    marginVertical: 40,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardWrapper: {
    width: cardWidth,
    marginRight: cardSpacing,
  },
  courseCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: '#fff',
    height: 180,
  },
  courseInfoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  courseImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  courseTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  courseDescription: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  titleSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewAllText: {
    fontSize: 16,
    color: Colors.primary_dark,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
  },
  emptyStateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  browseButton: {
    backgroundColor: Colors.primary_dark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.primary_dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
  },
});

export default Courses;
