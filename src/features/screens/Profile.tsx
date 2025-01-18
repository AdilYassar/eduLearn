/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { navigate } from '../../utils/Navigation';
import { Colors } from '@utils/Constants';

interface UserData {
  name: string;
  email: string;
  age: string;
  role: string;
  isActivated: boolean;
  profileImage?: string;
  marksSummary?: { [quizId: string]: { score: number; total: number } };
  enrolledCourses?: { courseId: string; enrolledAt: string }[];
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const opacity = useSharedValue(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      opacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log('Stored user data:', storedUserData);

      if (!storedUserData) {
        console.error('User data not found');
        setLoading(false);
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const updatedUserData = { ...userData, profileImage: response.assets[0].uri };
        setUserData(updatedUserData as UserData);
        try {
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
          console.log('Profile photo updated successfully');
        } catch (error) {
          console.error('Error updating profile photo:', error);
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      navigate('IntroductionScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: withSpring(1.05, { damping: 10, stiffness: 80 }) }],
    };
  });

  const renderEnrolledCourse = ({ item }: { item: { courseId: string; enrolledAt: string } }) => {
    return (
      <View style={styles.courseItem}>
        <Text style={styles.courseId}>Course ID: {item.courseId}</Text>
        <Text style={styles.enrolledAt}>Enrolled At: {new Date(item.enrolledAt).toLocaleString()}</Text>
      </View>
    );
  };

  const renderMarksSummary = ({ item }: { item: [string, { score: number; total: number }] }) => {
    const [quizId, { score, total }] = item;
    return (
      <View style={styles.marksItem}>
        <Text style={styles.quizId}>Quiz ID: {quizId}</Text>
        <Text style={styles.quizScore}>Score: {score}/{total}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require('../../assets/animations/student.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User data not found. Please add your profile information.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity style={styles.imageContainer} onPress={updateProfileImage}>
        {userData?.profileImage ? (
          <Image 
            source={{ uri: userData.profileImage }} 
            style={styles.profileImage} 
            onError={(e) => console.error("Error loading profile image:", e.nativeEvent.error)} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData.name || 'N/A'}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email || 'N/A'}</Text>

        <Text style={styles.label}>Age:</Text>
        <Text style={styles.value}>{userData.age || 'N/A'}</Text>

        <Text style={styles.label}>Account Status:</Text>
        <Text
          style={[
            styles.value,
            userData.isActivated ? styles.activated : styles.notActivated,
          ]}
        >
          {userData.isActivated ? 'Activated' : 'Not Activated'}
        </Text>

        <Text style={styles.sectionTitle}>Enrolled Courses</Text>
        {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
          <FlatList
            data={userData.enrolledCourses}
            renderItem={renderEnrolledCourse}
            keyExtractor={(item) => item.courseId}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noCoursesText}>No courses enrolled yet.</Text>
        )}

        <Text style={styles.sectionTitle}>Marks Summary</Text>
        {userData.marksSummary && Object.entries(userData.marksSummary).length > 0 ? (
          <FlatList
            data={Object.entries(userData.marksSummary)}
            renderItem={renderMarksSummary}
            keyExtractor={(item) => item[0]}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noMarksText}>No quizzes attempted yet.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  activated: {
    color: '#4caf50',
    fontWeight: '700',
  },
  notActivated: {
    color: '#f44336',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: Colors.teal_400,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  loadingAnimation: {
    width: 250,
    height: 250,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#757575',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  courseItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  courseId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  enrolledAt: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  noCoursesText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  marksItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  quizId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quizScore: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  noMarksText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Profile;
