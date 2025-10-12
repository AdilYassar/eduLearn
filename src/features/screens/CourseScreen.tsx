import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { navigate } from '../../utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EnrollPopup from '../../components/ui/EnrollPopup';
import EnrolledPopup from '../../components/ui/EnrolledPopup';

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  chapters?: any[];
}

const CourseScreen = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [showEnrollPopup, setShowEnrollPopup] = useState<boolean>(false);
  const [showEnrolledPopup, setShowEnrolledPopup] = useState<boolean>(false);
  const [justEnrolled, setJustEnrolled] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const { getAllCourses, enrollInCourse, getEnrollmentStats, error } = useCourse();

  // Fetch courses on component mount
  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...');
      const result = await getAllCourses();
      console.log('getAllCourses result:', result);
      if (result) {
        setCourses(result);
        console.log('Courses set:', result);
      } else {
        console.log('No courses returned from getAllCourses');
      }
    } catch (fetchError) {
      console.error('Error fetching courses:', fetchError);
    }
  }, [getAllCourses]);

  // Fetch enrollment stats
  const fetchEnrollmentStats = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.log('No access token, skipping enrollment stats fetch');
        return;
      }

      const stats = await getEnrollmentStats(accessToken);
      if (stats) {
        setTotalEnrollments(stats.totalEnrollments);
        const enrolledIds = new Set(stats.enrolledCourses.map(course => course._id));
        setEnrolledCourseIds(enrolledIds);
        console.log('Enrollment stats fetched:', stats);
      }
    } catch (fetchError) {
      console.error('Error fetching enrollment stats:', fetchError);
    }
  }, [getEnrollmentStats]);

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      await Promise.all([fetchCourses(), fetchEnrollmentStats()]);
      setInitialLoading(false);
    };
    
    loadInitialData();
  }, [fetchCourses, fetchEnrollmentStats]);

  // Handle course card click - shows popup or navigates
  const handleCourseCardClick = (course: CourseItem) => {
    console.log('Course card clicked:', course.title);
    setSelectedCourse(course);
    const isEnrolled = enrolledCourseIds.has(course._id);
    console.log('Is enrolled:', isEnrolled);

    if (isEnrolled) {
      // If enrolled, navigate to TheoryScreen
      navigateToTheoryScreen(course._id);
    } else {
      // If not enrolled, show enroll popup
      setShowEnrollPopup(true);
    }
  };

  // Handle direct enroll button click - enrolls directly
  const handleDirectEnroll = async (course: CourseItem) => {
    console.log('Direct enroll clicked for:', course.title);
    const isEnrolled = enrolledCourseIds.has(course._id);

    if (isEnrolled) {
      Alert.alert('Already Enrolled', `You are already enrolled in ${course.title}.`);
      return;
    }

    await handleEnrollCourse(course._id, course.title || '');
  };

  const handleEnrollFromPopup = async () => {
    console.log('Enroll from popup clicked');
    if (!selectedCourse) {
      console.log('No selected course');
      return;
    }

    setShowEnrollPopup(false);
    const success = await handleEnrollCourse(selectedCourse._id, selectedCourse.title || '');
    
    if (success) {
      // Show enrolled popup after successful enrollment
      setJustEnrolled(true);
      setShowEnrolledPopup(true);
    }
  };

  const handleClosePopups = () => {
    setShowEnrollPopup(false);
    setShowEnrolledPopup(false);
    setSelectedCourse(null);
    setJustEnrolled(false);
  };

  // Navigate to TheoryScreen
  const navigateToTheoryScreen = async (courseId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Authentication Required', 'Please log in to access course content.');
        return;
      }
      navigate('TheoryScreen', { courseId });
    } catch (authError) {
      console.error('Error checking access token:', authError);
      Alert.alert('Error', 'Failed to verify authentication. Please try again.');
    }
  };

  const handleEnrollCourse = async (courseId: string, courseTitle: string) => {
    console.log('handleEnrollCourse called with:', courseId, courseTitle);

    // Check if already enrolled
    if (enrolledCourseIds.has(courseId)) {
      Alert.alert('Already Enrolled', `You are already enrolled in ${courseTitle}.`);
      return;
    }

    // Check if already enrolling
    if (enrollingCourses.has(courseId)) {
      return;
    }

    try {
      // Add to enrolling courses
      setEnrollingCourses(prev => new Set(prev).add(courseId));
      
      console.log('Starting enrollment for course:', courseId, courseTitle);

      // Get access token
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        Alert.alert('Error', 'You must be logged in to enroll in a course.');
        return;
      }

      console.log('Calling enrollInCourse with courseId:', courseId);
      const result = await enrollInCourse(courseId, accessToken);
      console.log('Enrollment result:', result);

      if (result) {
        // Update enrollment state immediately without refetching all courses
        setEnrolledCourseIds(prev => new Set(prev).add(courseId));
        setTotalEnrollments(prev => prev + 1);
        return true; // Return success
      } else {
        console.log('Enrollment failed, error:', error);
        Alert.alert('Error', error || 'Failed to enroll in the course. Please try again.');
        return false; // Return failure
      }
    } catch (enrollError) {
      console.error('Error enrolling in the course:', enrollError);
      Alert.alert('Error', 'Failed to enroll in the course. Please try again.');
      return false; // Return failure
    } finally {
      // Remove from enrolling courses
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // Get filtered courses based on search
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Background colors for course cards
  const cardBackgrounds = ['#FFFBF0', '#E8F5E9', '#E3F2FD', '#FFF3E0'];
  
  // Course images - 4 images to be used randomly
  const courseImages = [
    require('../../assets/getStarted/100.png'),
    require('../../assets/getStarted/101.png'),
    require('../../assets/getStarted/102.png'),
    require('../../assets/getStarted/103.png'),
  ];

  const renderCourseItem = ({ item, index }: { item: CourseItem; index: number }) => {
    const isEnrolled = enrolledCourseIds.has(item._id);
    const isEnrolling = enrollingCourses.has(item._id);
    const backgroundColor = cardBackgrounds[index % cardBackgrounds.length];
    // Use course ID to get consistent random image for each course
    let imageIndex = 0;
    if (item._id) {
      // Convert course ID to a number and use modulo to get index
      const idHash = item._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      imageIndex = idHash % courseImages.length;
    }
    const courseImage = courseImages[imageIndex];

    return (
      <Animated.View
        style={styles.courseItemContainer}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        layout={Layout.springify()}>

        {/* Course Card - TWO SECTIONS */}
        <View style={styles.courseCard}>
          {/* TOP SECTION - Colored background with rounded top corners */}
          <TouchableOpacity
            style={[styles.courseInfoSection, { backgroundColor }]}
            activeOpacity={0.9}
            onPress={() => handleCourseCardClick(item)}>
            <Image
              source={courseImage}
              style={styles.courseImage}
            />
            <View style={styles.courseTextContainer}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              <Text style={styles.courseDescription} numberOfLines={2}>
                {item.description || 'Study of intelligent systems and machine learning.'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* BOTTOM SECTION - Entire white section is the button with rounded bottom corners */}
          <TouchableOpacity
            style={[
              styles.enrollSection,
              isEnrolled && styles.enrolledSection,
            ]}
            onPress={() => handleDirectEnroll(item)}
            disabled={isEnrolled || isEnrolling}
            activeOpacity={0.8}>
            {isEnrolling ? (
              <ActivityIndicator size="small" color="#5B4FC6" />
            ) : (
              <Text style={[
                styles.enrollButtonText,
                isEnrolled && styles.enrolledButtonText,
              ]}>
                {isEnrolled ? 'Enrolled' : 'Enroll'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('DashboardScreen')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Course Screen</Text>
        <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)} style={styles.searchIconButton}>
          <Icon name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar - Conditional */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="search course"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
            autoFocus={true}
          />
          <TouchableOpacity 
            onPress={() => {
              setShowSearchBar(false);
              setSearchQuery('');
            }} 
            style={styles.closeSearchButton}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {initialLoading ? (
        <ActivityIndicator size="large" color="#5B4FC6" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.courseList}
            showsVerticalScrollIndicator={false}
          />

          {/* Total Enrollments Card */}
          <View style={styles.enrollmentCard}>
            <Text style={styles.enrollmentText}>Total Enrollments : {totalEnrollments}</Text>
          </View>
        </>
      )}

      {/* Popups */}
      <EnrollPopup
        visible={showEnrollPopup}
        onClose={handleClosePopups}
        onEnroll={handleEnrollFromPopup}
        courseTitle={selectedCourse?.title || ''}
      />

      <EnrolledPopup
        visible={showEnrolledPopup}
        onClose={handleClosePopups}
        onViewCourse={justEnrolled ? undefined : () => selectedCourse && navigateToTheoryScreen(selectedCourse._id)}
        courseTitle={selectedCourse?.title || ''}
        justEnrolled={justEnrolled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
  searchIconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  closeSearchButton: {
    padding: 8,
    marginLeft: 8,
  },
  courseList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseItemContainer: {
    marginBottom: 16,
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
  },
  // TOP SECTION - Course info with colored background and rounded TOP corners
  courseInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  courseImage: {
    width: 70,
    height: 70,
    marginRight: 12,
    resizeMode: 'contain',
  },
  courseTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  courseDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
  },
  // BOTTOM SECTION - Entire white section is the button with rounded BOTTOM corners
  enrollSection: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,

  },
  enrollButtonText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  enrolledSection: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  enrolledButtonText: {
    color: '#4CAF50',
  },
  enrollmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  enrollmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter-SemiBold',
  },
});

export default CourseScreen;