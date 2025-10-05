/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Circle, G } from 'react-native-svg';
import { User, Mail, Phone, Calendar, Shield, Hash, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react-native';
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

  // Chart colors for statistics
  const statColors = {
    color1: '#5B4CDB',
    color2: '#4DBAB8',
    color3: '#F5A962',
    color4: '#E8C368',
    color5: '#F4988C',
    color6: '#D95F9F',
  };

  // Use the user hook for API calls
  const {
    getUserProfile,
    getEnrollmentStats,
    updateUserProfile,
    loading: apiLoading,
    error: apiError,
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
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#FF3B30" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProfileData}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
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

        {/* User Basic Info - Modern List Style */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <User size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Name</Text>
            </View>
            <Text style={styles.infoValue}>{userData.name || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Mail size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Phone size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Phone</Text>
            </View>
            <Text style={styles.infoValue}>{userData.phone || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Calendar size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Age</Text>
            </View>
            <Text style={styles.infoValue}>{String(userData.age || 'N/A')}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Shield size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>Role</Text>
            </View>
            <Text style={styles.infoValue}>{userData.role || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              <Hash size={20} color="#8E8E93" />
              <Text style={styles.infoLabel}>User ID</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>
              {userData.uuid || userData._id || 'N/A'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoLeft}>
              {userData.isActivated ? (
                <CheckCircle size={20} color="#34C759" />
              ) : (
                <XCircle size={20} color="#FF3B30" />
              )}
              <Text style={styles.infoLabel}>Account Status</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, userData.isActivated ? styles.activeStatus : styles.inactiveStatus]}>
                {userData.isActivated ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {userData.createdAt && (
            <>
              <View style={styles.infoItem}>
                <View style={styles.infoLeft}>
                  <Calendar size={20} color="#8E8E93" />
                  <Text style={styles.infoLabel}>Member Since</Text>
                </View>
                <Text style={styles.infoValue}>{new Date(userData.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          {userData.lastLogin && (
            <View style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <Clock size={20} color="#8E8E93" />
                <Text style={styles.infoLabel}>Last Login</Text>
              </View>
              <Text style={styles.infoValue}>{new Date(userData.lastLogin).toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* User Progress Section Title */}
        {userData.role === 'Student' && (
          <Text style={styles.sectionHeaderTitle}>📊 User Progress</Text>
        )}

        {/* Learning Statistics for Students */}
        {userData.role === 'Student' && (
          <View style={styles.statisticsCard}>
            <Text style={styles.statisticsTitle}>Learning Statistics</Text>

            {/* Donut Chart */}
            <View style={styles.chartContainer}>
              <Svg width="150" height="150" viewBox="0 0 150 150">
                <G rotation="0" origin="75, 75">
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color1}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="0"
                  />
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color2}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="-62.8"
                  />
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color3}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="-125.6"
                  />
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color4}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="-188.4"
                  />
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color5}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="-251.2"
                  />
                  <Circle
                    cx="75"
                    cy="75"
                    r="60"
                    stroke={statColors.color6}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="62.8 314.8"
                    strokeDashoffset="-314"
                  />
                </G>
              </Svg>
            </View>

            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              {/* Row 1 */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color1 }]} />
                    <Text style={styles.statLabel}>Enrolled{'\n'}Courses</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.enrollmentCount || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color2 }]} />
                    <Text style={styles.statLabel}>Quizzes{'\n'}Taken</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.totalQuizzesTaken || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>
              </View>

              {/* Row 2 */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color3 }]} />
                    <Text style={styles.statLabel}>Chapters{'\n'}Completed</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.totalChaptersCompleted || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color4 }]} />
                    <Text style={styles.statLabel}>Average{'\n'}Score</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.averageScore || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>
              </View>

              {/* Row 3 */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color5 }]} />
                    <Text style={styles.statLabel}>Learning{'\n'}Streak</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.learningStreak || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: statColors.color6 }]} />
                    <Text style={styles.statLabel}>Learning{'\n'}Days</Text>
                  </View>
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{String(userData.totalLearningDays || 0)}</Text>
                    <View style={styles.statUnderline} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Enrollment Statistics from API */}
        {enrollmentStats && (
          <View style={styles.enrollmentCard}>
            <Text style={styles.cardTitle}>Enrollment Details</Text>

            {/* Total Enrollments */}
            <View style={styles.enrollmentStatRow}>
              <View style={styles.enrollmentStatLeft}>
                <Text style={styles.enrollmentLabel}>Total Enrollments</Text>
                <Text style={styles.enrollmentValue}>{String(enrollmentStats.totalEnrollments || 0)}</Text>
              </View>
              <View style={styles.enrollmentProgressContainer}>
                <View style={styles.enrollmentProgressBar}>
                  <View
                    style={[
                      styles.enrollmentProgressFill,
                      {
                        width: `${Math.min((enrollmentStats.totalEnrollments || 0) * 10, 100)}%`,
                        backgroundColor: '#4CAF50',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.enrollmentProgressText}>
                  {Math.min((enrollmentStats.totalEnrollments || 0) * 10, 100)}%
                </Text>
              </View>
            </View>

            {/* Last Enrollment */}
            {enrollmentStats.lastEnrollment && (
              <View style={styles.lastEnrollmentBox}>
                <Text style={styles.lastEnrollmentLabel}>Latest Enrolled Course</Text>
                <Text style={styles.lastEnrollmentTitle}>
                  📚 {enrollmentStats.lastEnrollment.title || 'N/A'}
                </Text>
                {enrollmentStats.lastEnrollment.description && (
                  <Text style={styles.lastEnrollmentDescription}>
                    {enrollmentStats.lastEnrollment.description}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Enrolled Courses */}
        <View style={styles.enrolledCoursesCard}>
          <Text style={styles.cardTitle}>Enrolled Courses</Text>
          {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
            userData.enrolledCourses.map((item, index) => {
              const progressColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
              const progressPercentage = item.progress || Math.floor(Math.random() * 100);

              return (
                <View key={String(item._id || item.courseId || index)} style={styles.courseProgressItem}>
                  <View style={styles.courseProgressHeader}>
                    <Text style={styles.courseProgressTitle}>
                      {item.title || `Course ${index + 1}`}
                    </Text>
                    <Text style={styles.courseProgressPercentage}>{progressPercentage}%</Text>
                  </View>

                  <View style={styles.courseProgressBarContainer}>
                    <View style={styles.courseProgressBar}>
                      <View
                        style={[
                          styles.courseProgressFill,
                          {
                            width: `${progressPercentage}%`,
                            backgroundColor: progressColors[index % progressColors.length],
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {item.description && (
                    <Text style={styles.courseProgressDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {item.enrolledAt && (
                    <Text style={styles.courseProgressDate}>
                      Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.noCoursesContainer}>
              <Text style={styles.noCoursesText}>📚 No courses enrolled yet.</Text>
              <Text style={styles.noCoursesSubtext}>Start your learning journey today!</Text>
            </View>
          )}
        </View>

        {/* Quiz Performance */}
        {userData.quizPerformance && userData.quizPerformance.length > 0 && (
          <View style={styles.quizPerformanceCard}>
            <Text style={styles.cardTitle}>Quiz Performance</Text>

            {/* Overall Stats Row */}
            <View style={styles.quizStatsRow}>
              <View style={styles.quizStatBox}>
                <Text style={styles.quizStatLabel}>Total Quizzes</Text>
                <Text style={styles.quizStatValue}>{userData.totalQuizzesTaken || 0}</Text>
              </View>
              <View style={styles.quizStatBox}>
                <Text style={styles.quizStatLabel}>Average Score</Text>
                <Text style={[styles.quizStatValue, { color: '#4CAF50' }]}>
                  {userData.averageScore || 0}%
                </Text>
              </View>
            </View>

            {/* Individual Quiz Results */}
            {userData.quizPerformance.map((item, index) => {
              const gradeColors = {
                'A+': '#4CAF50',
                A: '#66BB6A',
                'B+': '#9CCC65',
                B: '#CDDC39',
                'C+': '#FFEB3B',
                C: '#FFC107',
                'D+': '#FF9800',
                D: '#FF5722',
                F: '#F44336',
              };
              const gradeColor = gradeColors[item.grade as keyof typeof gradeColors] || '#757575';
              const percentage = item.percentage || 0;

              return (
                <View key={String(item._id || item.quiz || index)} style={styles.quizResultItem}>
                  {/* Quiz Header */}
                  <View style={styles.quizResultHeader}>
                    <View style={styles.quizResultTitleSection}>
                      <Text style={styles.quizResultTitle}>Quiz #{index + 1}</Text>
                      {item.completedAt && (
                        <Text style={styles.quizResultDate}>
                          {new Date(item.completedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.quizGradeBadge, { backgroundColor: gradeColor }]}>
                      <Text style={styles.quizGradeText}>{item.grade || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Score Display */}
                  <View style={styles.quizScoreRow}>
                    <Text style={styles.quizScoreLabel}>Score:</Text>
                    <Text style={styles.quizScoreValue}>
                      {item.score || 0} / {Math.round((item.score || 0) / (percentage / 100)) || 10}
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.quizProgressSection}>
                    <View style={styles.quizProgressBar}>
                      <View
                        style={[
                          styles.quizProgressFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: gradeColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.quizPercentageText, { color: gradeColor }]}>
                      {percentage}%
                    </Text>
                  </View>

                  {/* Performance Indicator */}
                  <View style={styles.quizPerformanceIndicator}>
                    <Text style={styles.quizPerformanceLabel}>Performance: </Text>
                    <Text style={[styles.quizPerformanceText, { color: gradeColor }]}>
                      {percentage >= 90
                        ? '🌟 Excellent'
                        : percentage >= 80
                        ? '🎯 Very Good'
                        : percentage >= 70
                        ? '👍 Good'
                        : percentage >= 60
                        ? '📈 Fair'
                        : '💪 Needs Improvement'}
                    </Text>
                  </View>
                </View>
              );
            })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  logoutButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
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
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  // Modern Info Section Styles
  infoSection: {
    backgroundColor: '#fff',
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#000',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  activeStatus: {
    color: '#34C759',
  },
  inactiveStatus: {
    color: '#FF3B30',
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
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
  // Learning Statistics Card Styles
  statisticsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#3B9CFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statisticsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  statsGrid: {
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
    flex: 1,
  },
  statValueContainer: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statUnderline: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 2,
  },
  // Enrollment Details Card Styles
  enrollmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  enrollmentStatRow: {
    marginBottom: 20,
  },
  enrollmentStatLeft: {
    marginBottom: 10,
  },
  enrollmentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  enrollmentValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  enrollmentProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  enrollmentProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  enrollmentProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  enrollmentProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    minWidth: 45,
  },
  lastEnrollmentBox: {
    backgroundColor: '#F3E5F5',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  lastEnrollmentLabel: {
    fontSize: 12,
    color: '#7B1FA2',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  lastEnrollmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
    marginBottom: 6,
  },
  lastEnrollmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Enrolled Courses Card Styles
  enrolledCoursesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  courseProgressItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  courseProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseProgressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  courseProgressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
  },
  courseProgressBarContainer: {
    marginBottom: 10,
  },
  courseProgressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  courseProgressDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  courseProgressDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  noCoursesContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noCoursesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  noCoursesSubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
  },
  // Quiz Performance Card Styles
  quizPerformanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quizStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 10,
  },
  quizStatBox: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  quizStatLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  quizStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1565C0',
  },
  quizResultItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  quizResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizResultTitleSection: {
    flex: 1,
  },
  quizResultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  quizResultDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  quizGradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizGradeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  quizScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  quizScoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  quizProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  quizProgressBar: {
    flex: 1,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    borderRadius: 7,
  },
  quizPercentageText: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  quizPerformanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quizPerformanceLabel: {
    fontSize: 13,
    color: '#666',
  },
  quizPerformanceText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default Profile;
