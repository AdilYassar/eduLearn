import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '@components/ui/CustomHeader';

const BASE_URL = 'https://0243-101-53-234-27.ngrok-free.app';  // Use your base URL here
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
      const data = await response.json();
      setCourses(data);  // Assuming the response is an array of courses
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  interface Course {
    id: number;
    name: string;
    description: string;
  }

  const renderCourseItem = ({ item }: { item: Course }) => {
    return (
      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>{item.name}</Text>
        <Text style={styles.courseDescription}>{item.description}</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Courses" />
      
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}  // Assuming each course has a unique 'id'
          contentContainerStyle={styles.courseList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  courseList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,  // Shadow for Android
    shadowColor: '#000',  // iOS shadow color
    shadowOpacity: 0.1,  // iOS shadow opacity
    shadowRadius: 4,  // iOS shadow radius
    shadowOffset: { width: 0, height: 4 },  // iOS shadow offset
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  detailsButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CourseScreen;
