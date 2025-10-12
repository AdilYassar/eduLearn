/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, RefreshControl, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { User, Mail, Phone, Calendar, Shield, Hash, CheckCircle, XCircle, Clock, LogOut, ArrowLeft, Settings, Heart, Download, Globe, MapPin, Play, Monitor, Trash2, History, FileText, Star, Scan, MessageCircle, UserPlus, MessageSquare, HeadphonesIcon } from 'lucide-react-native';
import { navigate } from '../../utils/Navigation';
import { Colors } from '@utils/Constants';
import { performCompleteLogout } from '@service/authUtils';
import { useUser } from '@service/hooks/useUser';
import UserProgressSection from '../../components/ui/UserProgressSection';

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

interface DownloadItem {
  id: string;
  name: string;
  type: string;
  url: string;
  downloadedAt: Date;
  fileSize?: number;
  localPath?: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  type: 'course' | 'book' | 'video' | 'quiz';
  addedAt: Date;
  thumbnail?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  lastUpdated: Date;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const opacity = useSharedValue(0);

  // New state for tracking features
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [languages] = useState<LanguageOption[]>([
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ]);

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
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      // Load downloads
      const storedDownloads = await AsyncStorage.getItem('userDownloads');
      if (storedDownloads) {
        const parsedDownloads = JSON.parse(storedDownloads).map((download: any) => ({
          ...download,
          downloadedAt: new Date(download.downloadedAt),
        }));
        setDownloads(parsedDownloads);
      }

      // Load favorites
      const storedFavorites = await AsyncStorage.getItem('userFavorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites).map((favorite: any) => ({
          ...favorite,
          addedAt: new Date(favorite.addedAt),
        }));
        setFavorites(parsedFavorites);
      }

      // Load location
      const storedLocation = await AsyncStorage.getItem('userLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setLocation({
          ...parsedLocation,
          lastUpdated: new Date(parsedLocation.lastUpdated),
        });
      }

      // Load selected language
      const storedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

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
          setEnrollmentStats(statsData as EnrollmentStats);
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

  // Location functions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show your current location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationData: LocationData = {
          latitude,
          longitude,
          lastUpdated: new Date(),
        };

        // Try to get address from coordinates (simplified)
        locationData.address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        locationData.city = 'Current Location';
        locationData.country = 'Unknown';

        setLocation(locationData);
        AsyncStorage.setItem('userLocation', JSON.stringify(locationData));

        Alert.alert('Location Updated', `Your location has been updated: ${locationData.address}`);
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Cache clearing function
  const clearAllCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data including downloads, favorites, and temporary files. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get all keys from AsyncStorage
              const keys = await AsyncStorage.getAllKeys();

              // Filter out essential keys that should not be cleared
              const essentialKeys = ['accessToken', 'refreshToken', 'userData'];
              const keysToClear = keys.filter(key => !essentialKeys.includes(key));

              // Clear non-essential data
              await AsyncStorage.multiRemove(keysToClear);

              // Reset local state
              setDownloads([]);
              setFavorites([]);
              setLocation(null);

              Alert.alert('Cache Cleared', 'All cached data has been successfully cleared.');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Language selection function
  const selectLanguage = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language:',
      [
        ...languages.map(lang => ({
          text: lang.nativeName,
          onPress: () => {
            setSelectedLanguage(lang.code);
            AsyncStorage.setItem('selectedLanguage', lang.code);
            Alert.alert('Language Changed', `Language changed to ${lang.nativeName}`);
          },
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Navigation functions for downloads and favorites
  const navigateToDownloads = () => {
    // You can create a separate DownloadsScreen or show a modal
    Alert.alert(
      'Downloads',
      `You have ${downloads.length} downloaded items.\n\nRecent downloads:\n${downloads.slice(0, 3).map(d => `• ${d.name} (${d.downloadedAt.toLocaleDateString()})`).join('\n')}${downloads.length > 3 ? '\n...' : ''}`,
      [{ text: 'OK' }]
    );
  };

  const navigateToFavorites = () => {
    // You can create a separate FavoritesScreen or show a modal
    Alert.alert(
      'Favorites',
      `You have ${favorites.length} favorite items.\n\nRecent favorites:\n${favorites.slice(0, 3).map(f => `• ${f.name} (${f.addedAt.toLocaleDateString()})`).join('\n')}${favorites.length > 3 ? '\n...' : ''}`,
      [{ text: 'OK' }]
    );
  };

  // Utility functions that can be called from other components
  const addDownload = async (downloadItem: Omit<DownloadItem, 'id' | 'downloadedAt'>) => {
    const newDownload: DownloadItem = {
      ...downloadItem,
      id: Date.now().toString(),
      downloadedAt: new Date(),
    };

    const updatedDownloads = [newDownload, ...downloads];
    setDownloads(updatedDownloads);
    await AsyncStorage.setItem('userDownloads', JSON.stringify(updatedDownloads));
  };

  const addFavorite = async (favoriteItem: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
    const newFavorite: FavoriteItem = {
      ...favoriteItem,
      id: Date.now().toString(),
      addedAt: new Date(),
    };

    const updatedFavorites = [newFavorite, ...favorites];
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
  };

  const removeFavorite = async (favoriteId: string) => {
    const updatedFavorites = favorites.filter(f => f.id !== favoriteId);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('userFavorites', JSON.stringify(updatedFavorites));
  };

  // New feature functions
  const documentScan = () => {
    Alert.alert('Document Scan', 'Document scanning feature is coming soon! 📱✨', [{ text: 'OK' }]);
  };

  const messageFriend = () => {
    Alert.alert('Message a Friend', 'Messaging feature is coming soon! 💬✨', [{ text: 'OK' }]);
  };

  const inviteFriend = () => {
    Alert.alert('Invite a Friend', 'Friend invitation feature is coming soon! 👥✨', [{ text: 'OK' }]);
  };

  const giveFeedback = () => {
    Alert.alert('Give Feedback', 'Feedback system is coming soon! 💭✨', [{ text: 'OK' }]);
  };

  const customerSupport = () => {
    Alert.alert('Customer Support', 'Customer support chat is coming soon! 🎧✨', [{ text: 'OK' }]);
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
      {/* Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigate('DashboardScreen')}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#000" />
        </TouchableOpacity>
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
        {/* Profile Section - Inspired by first screenshot */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={updateProfileImage}>
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
            <View style={styles.cameraIcon}>
              <View style={styles.cameraIconInner} />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{userData.email || 'user@example.com'}</Text>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favourites and Downloads Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToFavorites}>
            <View style={styles.menuItemLeft}>
              <Heart size={20} color="#000" />
              <Text style={styles.menuItemText}>Favourites {favorites.length > 0 && `(${favorites.length})`}</Text>
            </View>
            <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={navigateToDownloads}>
            <View style={styles.menuItemLeft}>
              <Download size={20} color="#000" />
              <Text style={styles.menuItemText}>Downloads {downloads.length > 0 && `(${downloads.length})`}</Text>
            </View>
            <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>

        {/* Settings and Features Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={documentScan}>
            <View style={styles.menuItemLeft}>
              <Scan size={20} color="#000" />
              <Text style={styles.menuItemText}>Document Scan</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={messageFriend}>
            <View style={styles.menuItemLeft}>
              <MessageCircle size={20} color="#000" />
              <Text style={styles.menuItemText}>Message a Friend</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={inviteFriend}>
            <View style={styles.menuItemLeft}>
              <UserPlus size={20} color="#000" />
              <Text style={styles.menuItemText}>Invite a Friend</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={getCurrentLocation}>
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color="#000" />
              <Text style={styles.menuItemText}>Location {location ? `(${location.city || 'Current'})` : '(Not Set)'}</Text>
            </View>
            <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={giveFeedback}>
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color="#000" />
              <Text style={styles.menuItemText}>Give Feedback</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={customerSupport}>
            <View style={styles.menuItemLeft}>
              <HeadphonesIcon size={20} color="#000" />
              <Text style={styles.menuItemText}>Customer Support</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Management Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={clearAllCache}>
            <View style={styles.menuItemLeft}>
              <Trash2 size={20} color="#000" />
              <Text style={styles.menuItemText}>Clear Cache</Text>
            </View>
            <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <LogOut size={20} color="#000" />
              <Text style={styles.menuItemText}>Log Out</Text>
            </View>
            <ArrowLeft size={16} color="#C7C7CC" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>

        {/* User Details Section - Hidden by default, can be toggled */}
        <View style={styles.userDetailsSection}>
          <Text style={styles.userDetailsTitle}>Account Details</Text>
          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <User size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Name</Text>
            </View>
            <Text style={styles.detailValue}>{userData.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <Mail size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Email</Text>
            </View>
            <Text style={styles.detailValue}>{userData.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <Phone size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Phone</Text>
            </View>
            <Text style={styles.detailValue}>{userData.phone || 'N/A'}</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <Calendar size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Age</Text>
            </View>
            <Text style={styles.detailValue}>{String(userData.age || 'N/A')}</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <Shield size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Role</Text>
            </View>
            <Text style={styles.detailValue}>{userData.role || 'N/A'}</Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <Hash size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>User ID</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={1}>
              {userData.uuid || userData._id || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <View style={styles.detailLeft}>
              {userData.isActivated ? (
                <CheckCircle size={20} color="#34C759" />
              ) : (
                <XCircle size={20} color="#FF3B30" />
              )}
              <Text style={styles.detailLabel}>Account Status</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, userData.isActivated ? styles.activeStatus : styles.inactiveStatus]}>
                {userData.isActivated ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />

          {userData.createdAt && (
            <>
              <View style={styles.detailItem}>
                <View style={styles.detailLeft}>
                  <Calendar size={20} color="#8E8E93" />
                  <Text style={styles.detailLabel}>Member Since</Text>
                </View>
                <Text style={styles.detailValue}>{new Date(userData.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailDivider} />
            </>
          )}

          {userData.lastLogin && (
            <View style={styles.detailItem}>
              <View style={styles.detailLeft}>
                <Clock size={20} color="#8E8E93" />
                <Text style={styles.detailLabel}>Last Login</Text>
              </View>
              <Text style={styles.detailValue}>{new Date(userData.lastLogin).toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* App Version Footer */}
        <View style={styles.appVersionFooter}>
          <Text style={styles.appVersionText}>App Version 2.3</Text>
        </View>

        {/* User Progress Section */}
        <UserProgressSection userData={userData} enrollmentStats={enrollmentStats} />

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
                <Text style={styles.quizStatValueGreen}>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Profile Section Styles
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  // Menu Section Styles
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#000',
    fontWeight: '400',
  },
  menuArrow: {
    transform: [{ rotate: '180deg' }],
  },
  comingSoonBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontWeight: '600',
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginLeft: 48,
  },
  // User Details Section
  userDetailsSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#000',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#000',
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  detailDivider: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginLeft: 4,
  },
  // App Version Footer
  appVersionFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  appVersionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
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
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
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
  quizStatValueGreen: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
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
