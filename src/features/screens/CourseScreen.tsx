import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { navigate } from '../../utils/Navigation';
import { BASE_URL } from '../../service/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COURSES_API = '/api/courses';

const CourseScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${BASE_URL}${COURSES_API}`);
      if (!response.ok) {
        console.error('Failed to fetch courses. Status code:', response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCourses(data.courses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  interface Course {
    _id: string;
    title: string;
    description: string;
    lessons: number;
  }

  const handleCourseSelect = (courseId: string) => {
    navigate('TheoryScreen', { courseId });
  };

  const handleEnrollCourse = async (courseId: string, courseTitle: string) => {
    try {
      // Retrieve the user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      console.log('User Data:', userDataString);
  
      if (!userDataString) {
        Alert.alert('Error', 'You must be logged in to enroll in a course.');
        return;
      }
  
      // Parse the user data
      const userData = JSON.parse(userDataString);
  
      // Check if the user has an enrolledCourses array
      if (!userData.enrolledCourses) {
        userData.enrolledCourses = [];
      }
  
      // Check if the course is already enrolled
      if (userData.enrolledCourses.some(course => course.courseId === courseId)) {
        Alert.alert('Notice', 'You are already enrolled in this course.');
        return;
      }
  
      // Add the course ID, course name, and enrolledAt timestamp to the enrolledCourses array
      const enrolledAt = new Date().toISOString();  // ISO string for date and time
      userData.enrolledCourses.push({ courseId, courseTitle, enrolledAt });
  
      // Save the updated user data back to AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
  
      console.log('Course enrolled successfully:', courseId);
      Alert.alert('Success', 'Course enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling in the course:', error);
      Alert.alert('Error', 'Failed to enroll in the course. Please try again.');
    }
  };
  
  
  
  const renderCourseItem = ({ item }: { item: Course }) => {
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
          onPress={() => handleEnrollCourse(item._id)}>
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