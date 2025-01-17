import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '@components/ui/CustomHeader';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { navigate } from '../../utils/Navigation';
import { BASE_URL } from '@service/config';

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
   navigate('TheoryScreen', { courseId }); // Navigate to TheoryScreen with courseId
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
});

export default CourseScreen;
