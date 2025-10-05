import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { navigate } from '@utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

const Courses: React.FC<CoursesProps> = ({ bgColor = ['#FFFFFF', '#F5F5F5'] }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const { getAllCourses, enrollInCourse, loading, error } = useCourse();

  // Fetch courses on component mount
  const fetchCourses = useCallback(async () => {
    try {
      const result = await getAllCourses();
      if (result) {
        // Limit to 4 courses for dashboard display
        setCourses(result.slice(0, 4));
      }
    } catch (fetchError) {
      console.error('Error fetching courses:', fetchError);
    }
  }, [getAllCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnrollCourse = async (courseId: string, courseTitle: string) => {
    try {
      console.log('Starting enrollment for course:', courseId, courseTitle);
      
      // Get access token and user info
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      console.log('Access token found:', !!accessToken);
      console.log('User info found:', !!userInfo);
      
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

      console.log('Calling enrollInCourse with courseId:', courseId);
      const result = await enrollInCourse(courseId, accessToken);
      console.log('Enrollment result:', result);
      
      if (result) {
        Alert.alert('Success', `Successfully enrolled in ${courseTitle}!`);
        // Optionally refresh the courses to show updated enrollment status
        await fetchCourses();
      } else {
        console.log('Enrollment failed, error:', error);
        Alert.alert('Error', error || 'Failed to enroll in the course. Please try again.');
      }
    } catch (enrollError) {
      console.error('Error enrolling in the course:', enrollError);
      Alert.alert('Error', 'Failed to enroll in the course. Please try again.');
    }
  };

  const renderCourseCard = ({ item }: { item: CourseItem }) => {
    const chaptersCount = item.chapters?.length || 10;
    const instructorName = item.instructor || 'Adil Yassar';

    return (
      <View style={styles.courseCard}>
        <View style={styles.cardTop}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Text style={styles.instructorText}>Instructor : {instructorName}</Text>
          <Text style={styles.chaptersText}>Chapters : {chaptersCount}</Text>
        </View>
        
        <View style={styles.cardBottom}>
          <Image
            source={require('../../assets/images.png')}
            style={styles.courseImage}
            resizeMode="contain"
          />
          
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={() => handleEnrollCourse(item._id, item.title)}
          >
            <Icon name="add" size={24} color={Colors.primary_dark} />
            <Text style={styles.enrollButtonText}>Enroll</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.title}>Courses</Text>
        <ActivityIndicator size="large" color={Colors.primary_dark} style={styles.loader} />
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
      <Text style={styles.title}>Courses</Text>
      
      <FlatList
        data={courses}
        renderItem={renderCourseCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
        contentContainerStyle={styles.coursesGrid}
      />

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
  coursesGrid: {
    paddingBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    height: 180,
    justifyContent: 'space-between',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardTop: {
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  instructorText: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  chaptersText: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  courseImage: {
    width: 60,
    height: 60,
  },
  enrollButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  enrollButtonText: {
    fontSize: 9,
    color: Colors.primary_dark,
    fontWeight: '600',
    marginTop: -2,
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
});

export default Courses;
