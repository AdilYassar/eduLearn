import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { navigate, goBack } from '../../utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const { getAllCourses, enrollInCourse, loading, error } = useCourse();

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
    const stepsCount = item.chapters?.length || 0;
    const estimatedTime = item.description || 'No description';

    return (
      <Animated.View
        style={styles.courseCard}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(300)}
        layout={Layout.springify()}>
        <TouchableOpacity onPress={() => handleCourseSelect(item._id)} style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.instructorText}>Instructor : Adil Yassar</Text>
            <Text style={styles.chaptersText}>Chapters : {stepsCount > 0 ? stepsCount : '10'}</Text>
          </View>
          
          <View style={styles.cardBottom}>
            <Image
              source={require('@assets/Earth and Moon-rafiki.png')}
              style={styles.courseImage}
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => handleEnrollCourse(item._id, item.title || '')}>
          <Icon name="add" size={24} color="#5B4FC6" />
          <Text style={styles.enrollButtonText}>Enroll</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Courses</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5B4FC6" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={courses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.courseList}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
          />
          
          {/* Total Enrollments Card */}
          <View style={styles.enrollmentCard}>
            <Text style={styles.enrollmentText}>Total Enrollments : 0</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
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
  placeholder: {
    width: 40,
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
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: '#5B4FC6',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    height: 180,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  cardContent: {
    flex: 1,
  },
  cardTop: {
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  instructorText: {
    fontSize: 11,
    color: '#E8E0FF',
    marginBottom: 2,
    fontFamily: 'Inter-Regular',
  },
  chaptersText: {
    fontSize: 11,
    color: '#E8E0FF',
    fontFamily: 'Inter-Regular',
  },
  courseImage: {
    width: 80,
    height: 80,
  },
  enrollButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  enrollButtonText: {
    fontSize: 9,
    color: '#5B4FC6',
    fontWeight: '600',
    marginTop: -2,
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
