import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { navigate } from '../../utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
  lessons?: number;
  chapters?: any[];
}

const CourseScreen = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const { getAllCourses, enrollInCourse, loading, error } = useCourse();

  // Fetch courses on component mount
  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...');
      const result = await getAllCourses();
      console.log('getAllCourses result:', result);
      if (result) {
        const mappedCourses = result.map(course => ({
          ...course,
          lessons: course.chapters?.length || 0,
        }));
        console.log('Mapped courses:', mappedCourses);
        setCourses(mappedCourses);
      } else {
        console.log('No courses returned from getAllCourses');
      }
    } catch (fetchError) {
      console.error('Error fetching courses:', fetchError);
    }
  }, [getAllCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseSelect = async (courseId: string) => {
    console.log('CourseScreen: Course selected with ID:', courseId);
    
    // Check if user has access token before navigating
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        Alert.alert('Authentication Required', 'Please log in to access course content.');
        return;
      }
      
      console.log('CourseScreen: Access token verified, navigating to TheoryScreen');
      navigate('TheoryScreen', { courseId });
    } catch (authError) {
      console.error('CourseScreen: Error checking access token:', authError);
      Alert.alert('Error', 'Failed to verify authentication. Please try again.');
    }
  };

  const handleEnrollCourse = async (courseId: string, courseTitle: string) => {
    try {
      console.log('Starting enrollment for course:', courseId, courseTitle);
      
      // Get access token and user info
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      console.log('Access token found:', !!accessToken);
      console.log('User info found:', !!userInfo);
      console.log('Refresh token found:', !!refreshToken);
      
      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          console.log('Current user email from AsyncStorage:', parsedUserInfo.email);
          console.log('Current user UUID from AsyncStorage:', parsedUserInfo.uuid);
          console.log('Current user name from AsyncStorage:', parsedUserInfo.name);
        } catch (parseError) {
          console.error('Error parsing user info:', parseError);
        }
      }
      
      if (!accessToken) {
        Alert.alert('Error', 'You must be logged in to enroll in a course.');
        return;
      }

      // Log the first few characters of the token for debugging (never log full token in production)
      console.log('Token starts with:', accessToken.substring(0, 20) + '...');

      console.log('Calling enrollInCourse with courseId:', courseId);
      const result = await enrollInCourse(courseId, accessToken);
      console.log('Enrollment result:', result);
      
      if (result) {
        Alert.alert('Success', `Successfully enrolled in ${courseTitle}!`);
        // Optionally refresh the courses to show updated enrollment status
        // await fetchCourses();
      } else {
        console.log('Enrollment failed, error:', error);
        Alert.alert('Error', error || 'Failed to enroll in the course. Please try again.');
      }
    } catch (enrollError) {
      console.error('Error enrolling in the course:', enrollError);
      Alert.alert('Error', 'Failed to enroll in the course. Please try again.');
    }
  };
  
  
  
  const renderCourseItem = ({ item }: { item: CourseItem }) => {
    return (
      <Animated.View
        style={styles.courseCard}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        layout={Layout.springify()}>
        <TouchableOpacity onPress={() => handleCourseSelect(item._id)} style={styles.cardContent}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.courseLessons}>{item.lessons} Lessons</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => handleEnrollCourse(item._id, item.title || '')}>
          <Text style={styles.enrollButtonText}>Enroll</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Courses" />
      {loading ? (
        <ActivityIndicator size="large" color="#008080" style={styles.loader} />
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.courseList}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fafa',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  courseList: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseCard: {
    flex: 1,
    backgroundColor: '#008080',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    height: 160,
    width: 160,
    transform: [{ scale: 1 }],
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  courseLessons: {
    fontSize: 14,
    color: '#e0f7f7',
    marginTop: 8,
    fontFamily: 'Roboto',
  },
  enrollButton: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#008080',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CourseScreen;
