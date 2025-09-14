/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import { navigate } from '../../utils/Navigation';
import { Colors } from '@utils/Constants';
import { performCompleteLogout } from '@service/authUtils';
import { useUser } from '@service/hooks/useUser';

interface UserData {
  _id?: string;
  uuid?: string;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  role: string;
  isActivated?: boolean;
  profileImage?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: Date;
  totalLearningDays?: number;
  // Student specific fields
  enrolledCourses?: any[];
  enrollmentCount?: number;
  quizPerformance?: any[];
  totalQuizzesTaken?: number;
  averageScore?: number;
  totalChaptersCompleted?: number;
  totalTimeSpent?: number;
  averageCourseCompletion?: number;
  learningStreak?: number;
  longestLearningStreak?: number;
  lastLearningActivity?: Date;
  marksSummary?: { [quizId: string]: { score: number; total: number } };
}

interface EnrollmentStats {
  totalEnrollments?: number;
  enrolledCourses?: any[];
  lastEnrollment?: any;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const opacity = useSharedValue(0);
  
  // Use the user hook for API calls
  const { 
    getUserProfile, 
    getEnrollmentStats, 
    updateUserProfile, 
    loading: apiLoading, 
    error: apiError 
  } = useUser();

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
      setLoading(true);
      
      // Get access token
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('No access token found');
        Alert.alert('Error', 'You must be logged in to view your profile.');
        setLoading(false);
        return;
      }

      console.log('🔑 Making API call to fetch user profile with token:', accessToken.substring(0, 20) + '...');

      // Fetch user profile data from API
      const profileData = await getUserProfile(accessToken);
      console.log('📡 User Profile API Response:', profileData);
      
      if (profileData) {
        // Handle the response based on API structure from README
        let userProfileData;
        if (profileData.student) {
          // If response has student field (from /api/user endpoint)
          userProfileData = profileData.student;
          console.log('👤 Student Profile Data:', userProfileData);
        } else if (profileData.user) {
          // If response has user field (from /api/user/profile endpoint)  
          userProfileData = profileData.user;
          console.log('👤 Generic User Profile Data:', userProfileData);
        } else {
          // If response is direct user data
          userProfileData = profileData;
          console.log('👤 Direct User Profile Data:', userProfileData);
        }
        
        setUserData(userProfileData);

        // Also fetch enrollment statistics
        console.log('📊 Fetching enrollment statistics...');
        const statsData = await getEnrollmentStats(accessToken);
        console.log('📊 Enrollment Stats API Response:', statsData);
        
        if (statsData) {
          setEnrollmentStats(statsData);
        }
      } else {
        console.error('❌ Failed to fetch user profile');
        Alert.alert('Error', 'Failed to load profile data. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfileData = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
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
    console.log('Profile: Starting logout process...');
    await performCompleteLogout();
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
        <Text style={styles.quizId}>Quiz ID: {String(quizId)}</Text>
        <Text style={styles.quizScore}>Score: {String(score)}/{String(total)}</Text>
      </View>
    );
  };

  if (loading || apiLoading) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require('../../assets/animations/student.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={refreshProfileData}
        disabled={refreshing}
      >
        <Text style={styles.refreshText}>
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.imageContainer} onPress={updateProfileImage}>
        {(userData?.profileImage || userData?.photo) ? (
          <Image
            source={{ uri: userData.profileImage || userData.photo }}
            style={styles.profileImage}
            onError={(e) => console.error('Error loading profile image:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Profile</Text>

        {/* User Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{userData.name || 'N/A'}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userData.email || 'N/A'}</Text>

          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{userData.phone || 'N/A'}</Text>

          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>{String(userData.age || 'N/A')}</Text>

          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{userData.role || 'N/A'}</Text>

          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{userData.uuid || userData._id || 'N/A'}</Text>

          <Text style={styles.label}>Account Status:</Text>
          <Text
            style={[
              styles.value,
              userData.isActivated ? styles.activated : styles.notActivated,
            ]}
          >
            {userData.isActivated ? 'Activated' : 'Not Activated'}
          </Text>

          {userData.createdAt && (
            <>
              <Text style={styles.label}>Member Since:</Text>
              <Text style={styles.value}>{new Date(userData.createdAt).toLocaleDateString()}</Text>
            </>
          )}

          {userData.lastLogin && (
            <>
              <Text style={styles.label}>Last Login:</Text>
              <Text style={styles.value}>{new Date(userData.lastLogin).toLocaleString()}</Text>
            </>
          )}
        </View>

        {/* Learning Statistics for Students */}
        {userData.role === 'Student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Statistics</Text>
            
            <Text style={styles.label}>Enrolled Courses:</Text>
            <Text style={styles.value}>{String(userData.enrollmentCount || 0)}</Text>

            <Text style={styles.label}>Quizzes Taken:</Text>
            <Text style={styles.value}>{String(userData.totalQuizzesTaken || 0)}</Text>

            <Text style={styles.label}>Average Score:</Text>
            <Text style={styles.value}>{String(userData.averageScore || 0)}%</Text>

            <Text style={styles.label}>Chapters Completed:</Text>
            <Text style={styles.value}>{String(userData.totalChaptersCompleted || 0)}</Text>

            <Text style={styles.label}>Learning Streak:</Text>
            <Text style={styles.value}>{String(userData.learningStreak || 0)} days</Text>

            <Text style={styles.label}>Total Learning Days:</Text>
            <Text style={styles.value}>{String(userData.totalLearningDays || 0)}</Text>

            {(userData.totalTimeSpent !== undefined && userData.totalTimeSpent !== null) && (
              <>
                <Text style={styles.label}>Total Time Spent:</Text>
                <Text style={styles.value}>{String(Math.round(userData.totalTimeSpent / 60))} minutes</Text>
              </>
            )}
          </View>
        )}

        {/* Enrollment Statistics from API */}
        {enrollmentStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enrollment Details</Text>
            
            <Text style={styles.label}>Total Enrollments:</Text>
            <Text style={styles.value}>{String(enrollmentStats.totalEnrollments || 0)}</Text>

            {enrollmentStats.lastEnrollment && (
              <>
                <Text style={styles.label}>Last Enrolled Course:</Text>
                <Text style={styles.value}>{enrollmentStats.lastEnrollment.title || 'N/A'}</Text>
              </>
            )}
          </View>
        )}

        {/* Enrolled Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enrolled Courses</Text>
          {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
            <FlatList
              data={userData.enrolledCourses}
              renderItem={({ item }) => (
                <View style={styles.courseItem}>
                  <Text style={styles.courseTitle}>{item.title || `Course ID: ${item.courseId || item._id}`}</Text>
                  <Text style={styles.courseDescription}>{item.description || 'No description available'}</Text>
                  {item.enrolledAt && (
                    <Text style={styles.enrolledAt}>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</Text>
                  )}
                </View>
              )}
              keyExtractor={(item, index) => String(item._id || item.courseId || index)}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noCoursesText}>No courses enrolled yet.</Text>
          )}
        </View>

        {/* Quiz Performance */}
        {userData.quizPerformance && userData.quizPerformance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiz Performance</Text>
            <FlatList
              data={userData.quizPerformance}
              renderItem={({ item }) => (
                <View style={styles.quizItem}>
                  <Text style={styles.quizScore}>Score: {String(item.score || 0)}</Text>
                  <Text style={styles.quizPercentage}>Percentage: {String(item.percentage || 0)}%</Text>
                  <Text style={styles.quizGrade}>Grade: {String(item.grade || 'N/A')}</Text>
                  {item.completedAt && (
                    <Text style={styles.quizDate}>Completed: {new Date(item.completedAt).toLocaleDateString()}</Text>
                  )}
                </View>
              )}
              keyExtractor={(item, index) => String(item.quiz || index)}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Marks Summary (legacy) */}
        {userData.marksSummary && Object.entries(userData.marksSummary).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marks Summary</Text>
            <FlatList
              data={Object.entries(userData.marksSummary)}
              renderItem={renderMarksSummary}
              keyExtractor={(item) => String(item[0])}
              scrollEnabled={false}
            />
          </View>
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
  refreshButton: {
    backgroundColor: Colors.teal_400,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quizItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  quizPercentage: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  quizGrade: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    fontWeight: '600',
  },
  quizDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default Profile;
