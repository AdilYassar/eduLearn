/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  ArrowLeft,
  Settings,
  Heart,
  Download,
  Globe,
  MapPin,
  Play,
  Monitor,
  Trash2,
  History,
  FileText,
  Star,
  Scan,
  MessageCircle,
  UserPlus,
  MessageSquare,
  HeadphonesIcon,
  ChevronRight,
  Edit,
  BookOpenIcon,
  Brain,
  Zap,
  BarChart3,
} from 'lucide-react-native';
import { navigate } from '../../utils/Navigation';
import { Colors } from '@utils/Constants';
import { performCompleteLogout } from '@service/authUtils';
import { useUser } from '@service/hooks/useUser';
import UserProgressSection from '../../components/ui/UserProgressSection';
import SuccessPopup from '../../components/ui/SuccessPopup';
import { ThemedText as Text, GlassCard, ThemedContainer } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';

interface UserData {
  _id?: string;
  uuid?: string;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  bio?: string;
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
  const { theme } = useTheme();
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
    uploadProfilePhoto,
    loading: apiLoading,
    error: apiError,
  } = useUser();

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editBio, setEditBio] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Success!');

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
          userProfileData = profileData.student;
        } else if (profileData.user) {
          userProfileData = profileData.user;
        } else {
          userProfileData = profileData;
        }

        setUserData(userProfileData);

        // Also fetch enrollment statistics
        const statsData = await getEnrollmentStats(accessToken);
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
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const file = response.assets[0];
        // Just store the file for now, don't upload yet
        setSelectedPhotoFile({
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.fileName || `photo_${Date.now()}.jpg`,
        });
      }
    });
  };

  const openEditModal = () => {
    if (userData) {
      setEditName(userData.name || '');
      setEditEmail(userData.email || '');
      setEditPhone(userData.phone || '');
      setEditAge(userData.age?.toString() || '');
      setEditBio(userData.bio || '');
      setShowEditModal(true);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditAge('');
    setEditBio('');
    setSelectedPhotoFile(null);
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }

    setUpdatingProfile(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'You must be logged in');
        setUpdatingProfile(false);
        return;
      }

      const updateData: any = {
        name: editName.trim(),
      };

      if (editEmail.trim()) updateData.email = editEmail.trim();
      if (editPhone.trim()) updateData.phone = editPhone.trim();
      if (editAge.trim()) updateData.age = parseInt(editAge, 10);
      if (editBio.trim()) updateData.bio = editBio.trim();

      // First update the profile data
      const result = await updateUserProfile(updateData, accessToken);

      if (result) {
        // Update local state with new data
        setUserData(prev => prev ? {
          ...prev,
          ...updateData,
        } : null);

        // Then upload photo if one was selected
        if (selectedPhotoFile) {
          setUploadingPhoto(true);
          try {
            const photoResult = await uploadProfilePhoto(selectedPhotoFile);
            
            if (photoResult?.success) {
              // Update userData with new photo
              setUserData(prev => prev ? {
                ...prev,
                profileImage: photoResult.data?.photoUrl || selectedPhotoFile.uri,
                photo: photoResult.data?.photoUrl || selectedPhotoFile.uri,
              } : null);
              setSuccessMessage('Profile and photo updated successfully!');
              setShowSuccessPopup(true);
            } else {
              Alert.alert('Warning', 'Profile updated but photo upload failed. Try again later.');
            }
          } catch (photoError: any) {
            console.error('Photo upload error:', photoError);
            Alert.alert('Warning', 'Profile updated but photo upload failed. Try again later.');
          } finally {
            setUploadingPhoto(false);
          }
        } else {
          setSuccessMessage('Profile updated successfully!');
          setShowSuccessPopup(true);
        }

        closeEditModal();
      } else {
        Alert.alert('Error', apiError || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
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
              const keys = await AsyncStorage.getAllKeys();
              const essentialKeys = ['accessToken', 'refreshToken', 'userData'];
              const keysToClear = keys.filter(key => !essentialKeys.includes(key));
              await AsyncStorage.multiRemove(keysToClear);

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

  const navigateToDownloads = () => {
    Alert.alert(
      'Downloads',
      `You have ${downloads.length} downloaded items.\n\nRecent downloads:\n${downloads.slice(0, 3).map(d => `• ${d.name} (${d.downloadedAt.toLocaleDateString()})`).join('\n')}${downloads.length > 3 ? '\n...' : ''}`,
      [{ text: 'OK' }]
    );
  };

  const navigateToFavorites = () => {
    Alert.alert(
      'Favorites',
      `You have ${favorites.length} favorite items.\n\nRecent favorites:\n${favorites.slice(0, 3).map(f => `• ${f.name} (${f.addedAt.toLocaleDateString()})`).join('\n')}${favorites.length > 3 ? '\n...' : ''}`,
      [{ text: 'OK' }]
    );
  };

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

  const documentScan = () => Alert.alert('Document Scan', 'Document scanning feature is coming soon! 📱✨', [{ text: 'OK' }]);
  const messageFriend = () => Alert.alert('Message a Friend', 'Messaging feature is coming soon! 💬✨', [{ text: 'OK' }]);
  const inviteFriend = () => Alert.alert('Invite a Friend', 'Friend invitation feature is coming soon! 👥✨', [{ text: 'OK' }]);
  const giveFeedback = () => Alert.alert('Give Feedback', 'Feedback system is coming soon! 💭✨', [{ text: 'OK' }]);
  const customerSupport = () => Alert.alert('Customer Support', 'Customer support chat is coming soon! 🎧✨', [{ text: 'OK' }]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: withSpring(1.05, { damping: 10, stiffness: 80 }) }],
    };
  });

  if (loading || apiLoading) {
    return (
      <ThemedContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('../../assets/animations/student.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>Loading profile...</Text>
      </ThemedContainer>
    );
  }

  if (!userData) {
    return (
      <ThemedContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.errorText}>User data not found. Please add your profile information.</Text>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer style={styles.mainContainer}>
      {/* 1. TOP NAVIGATION BAR - Sticky */}
      <View style={[styles.stickyNavBar, { borderBottomColor: 'rgba(255,255,255,0.07)' }]}>
        <TouchableOpacity
          style={[styles.circleButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
          onPress={() => navigate('DashboardScreen')}
        >
          <ArrowLeft size={18} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text.primary }]}>My Profile</Text>
        <TouchableOpacity style={[styles.circleButton, { borderColor: 'rgba(255,255,255,0.1)' }]}>
          <Settings size={18} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshProfileData}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* 2. HERO SECTION */}
        <View style={styles.heroSection}>
          {/* Avatar Container */}
          <View style={styles.avatarContainer}>
            {(userData?.profileImage || userData?.photo) ? (
              <>
                {/* When photo exists - show image directly */}
                <Image
                  source={{ uri: userData.profileImage || userData.photo }}
                  style={styles.avatarImageDirect}
                />
                {/* Edit badge on existing photo */}
                <TouchableOpacity
                  style={[
                    styles.modernAddPhotoBadge,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={updateProfileImage}
                  disabled={uploadingPhoto}
                  activeOpacity={0.8}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modernAddPhotoText}>✎</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* When no photo - show add photo container */}
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.primary + '15' },
                  ]}
                >
                  <TouchableOpacity
                    onPress={updateProfileImage}
                    disabled={uploadingPhoto}
                    style={styles.addPhotoCenter}
                  >
                    {uploadingPhoto ? (
                      <ActivityIndicator size="large" color={theme.primary} />
                    ) : (
                      <>
                        <Text style={styles.addPhotoIconBig}>📸</Text>
                        <Text
                          style={[
                            styles.addPhotoTextSmall,
                            { color: theme.primary },
                          ]}
                        >
                          Add Photo
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Right side: Username, email, Edit Profile button */}
          <View style={styles.heroInfoSection}>
            <Text style={[styles.heroUsername, { color: theme.text.primary }]}>{userData?.name || 'User Name'}</Text>
            <Text style={[styles.heroEmail, { color: theme.text.secondary }]}>{userData?.email || 'user@example.com'}</Text>
            
            <TouchableOpacity
              style={[
                styles.editProfileButton,
                {
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                },
              ]}
              onPress={openEditModal}
            >
              <Edit size={16} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.editProfileButtonText, { color: theme.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. STATUS PILLS ROW - Horizontal Scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusPillsContainer}
          contentContainerStyle={styles.statusPillsContent}
        >
          <View
            style={[
              styles.statusPill,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: 'rgba(255,255,255,0.07)' },
            ]}
          >
            <View style={[styles.pillDot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.pillText, { color: theme.text.primary }]}>Active</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: 'rgba(255,255,255,0.07)' },
            ]}
          >
            <View style={[styles.pillDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={[styles.pillText, { color: theme.text.primary }]}>Student</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: 'rgba(255,255,255,0.07)' },
            ]}
          >
            <Text style={[styles.pillText, { color: theme.text.primary }]}>📅 Member since Apr '26</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: 'rgba(255,255,255,0.07)' },
            ]}
          >
            <Text style={[styles.pillText, { color: theme.text.primary }]}>v2.3</Text>
          </View>
        </ScrollView>

        {/* 4. QUICK ACCESS SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>QUICK ACCESS</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)' }]}
          opacity={0.05}
          glow={false}
        >
          <TouchableOpacity style={styles.quickAccessItem} onPress={navigateToFavorites}>
            <View style={styles.quickAccessIcon}>
              <Heart size={20} color={theme.primary} />
            </View>
            <Text style={[styles.quickAccessItemText, { color: theme.text.primary }]}>Favourites</Text>
            <ChevronRight size={20} color={theme.text.secondary} />
          </TouchableOpacity>

          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          <TouchableOpacity style={styles.quickAccessItem} onPress={navigateToDownloads}>
            <View style={styles.quickAccessIcon}>
              <Download size={20} color={theme.primary} />
            </View>
            <Text style={[styles.quickAccessItemText, { color: theme.text.primary }]}>Downloads</Text>
            <ChevronRight size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        </GlassCard>

        {/* 5. FEATURES SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>FEATURES</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)' }]}
          opacity={0.05}
          glow={false}
        >
          {/* Document Scan */}
          <TouchableOpacity style={styles.featureItem} onPress={documentScan}>
            <View style={styles.featureIconContainer}>
              <Scan size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Document Scan</Text>
            <View style={styles.featureRight}>
              <View style={[styles.soonBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Message a Friend */}
          <TouchableOpacity style={styles.featureItem} onPress={messageFriend}>
            <View style={styles.featureIconContainer}>
              <MessageCircle size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Message a Friend</Text>
            <View style={styles.featureRight}>
              <View style={[styles.soonBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Invite a Friend */}
          <TouchableOpacity style={styles.featureItem} onPress={inviteFriend}>
            <View style={styles.featureIconContainer}>
              <UserPlus size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Invite a Friend</Text>
            <View style={styles.featureRight}>
              <View style={[styles.soonBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Location */}
          <TouchableOpacity style={styles.featureItem} onPress={getCurrentLocation}>
            <View style={styles.featureIconContainer}>
              <MapPin size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Location</Text>
            <View style={styles.featureRight}>
              <Text style={[styles.featureSubtitle, { color: theme.text.secondary }]}>
                {location?.city || 'Not Set'}
              </Text>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Give Feedback */}
          <TouchableOpacity style={styles.featureItem} onPress={giveFeedback}>
            <View style={styles.featureIconContainer}>
              <MessageSquare size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Give Feedback</Text>
            <View style={styles.featureRight}>
              <View style={[styles.soonBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Customer Support */}
          <TouchableOpacity style={styles.featureItem} onPress={customerSupport}>
            <View style={styles.featureIconContainer}>
              <HeadphonesIcon size={18} color={theme.primary} />
            </View>
            <Text style={[styles.featureItemText, { color: theme.text.primary }]}>Customer Support</Text>
            <View style={styles.featureRight}>
              <View style={[styles.soonBadge, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
              <ChevronRight size={18} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
        </GlassCard>

        {/* 6. USER PROGRESS SECTION - Learning Statistics */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>USER PROGRESS</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 20 }]}
          opacity={0.05}
          glow={false}
        >
          {/* Title with Subtitle */}
          <View style={styles.learningStatsHeader}>
            <Text style={[styles.learningStatsTitle, { color: theme.text.primary }]}>Learning Statistics</Text>
            <Text style={[styles.learningStatsSubtitle, { color: theme.text.secondary }]}>All time</Text>
          </View>

          {/* Donut Chart + Legend */}
          <View style={styles.chartAndLegendContainer}>
            {/* Donut SVG Chart */}
            <View style={styles.donutChartContainer}>
              <Svg width="100" height="100" viewBox="0 0 100 100">
                {/* Arc segments for 4 colored segments */}
                <Circle cx="50" cy="50" r="35" fill="none" stroke="#8B5CF6" strokeWidth="8" strokeDasharray="50 360" />
                <Circle cx="50" cy="50" r="35" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray="30 360" strokeDashoffset="-50" />
                <Circle cx="50" cy="50" r="35" fill="none" stroke="#F97316" strokeWidth="8" strokeDasharray="20 360" strokeDashoffset="-80" />
                <Circle cx="50" cy="50" r="35" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="10 360" strokeDashoffset="-100" />

                {/* Center text */}
                <SvgText x="50" y="45" textAnchor="middle" fontSize="14" fill={theme.text.primary} fontWeight="700">
                  2
                </SvgText>
                <SvgText x="50" y="60" textAnchor="middle" fontSize="12" fill={theme.text.secondary}>
                  courses
                </SvgText>
              </Svg>
            </View>

            {/* Legend */}
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Enrolled</Text>
                  <Text style={[styles.legendValue, { color: theme.text.primary }]}>2</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Quizzes</Text>
                  <Text style={[styles.legendValue, { color: theme.text.primary }]}>1</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Chapters</Text>
                  <Text style={[styles.legendValue, { color: theme.text.primary }]}>0</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <View style={styles.legendTextContainer}>
                  <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Avg Score</Text>
                  <Text style={[styles.legendValue, { color: theme.text.primary }]}>0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Statistics Grid - 3x2 */}
          <View style={styles.statsGrid}>
            {/* Enrolled Courses */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  borderColor: 'rgba(139, 92, 246, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>2</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Enrolled</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#8B5CF6' }]} />
            </View>

            {/* Quizzes Taken */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  borderColor: 'rgba(34, 197, 94, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#22C55E' }]}>1</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Quizzes</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#22C55E' }]} />
            </View>

            {/* Chapters Done */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(249, 115, 22, 0.08)',
                  borderColor: 'rgba(249, 115, 22, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#F97316' }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Chapters</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#F97316' }]} />
            </View>

            {/* Avg Score */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderColor: 'rgba(59, 130, 246, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Avg Score</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#3B82F6' }]} />
            </View>

            {/* Learning Streak */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(236, 72, 153, 0.08)',
                  borderColor: 'rgba(236, 72, 153, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#EC4899' }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Streak</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#EC4899' }]} />
            </View>

            {/* Learning Days */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: 'rgba(14, 165, 233, 0.08)',
                  borderColor: 'rgba(14, 165, 233, 0.1)',
                },
              ]}
            >
              <Text style={[styles.statNumber, { color: '#0EA5E9' }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Days</Text>
              <View style={[styles.statBottomBar, { backgroundColor: '#0EA5E9' }]} />
            </View>
          </View>
        </GlassCard>

        {/* 7. ENROLLMENT DETAILS SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ENROLLMENT DETAILS</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 20 }]}
          opacity={0.05}
          glow={false}
        >
          {/* Top Row: Label, Number, and Progress Percentage */}
          <View style={styles.enrollmentTopRow}>
            <View>
              <Text style={[styles.enrollmentLabel, { color: theme.text.secondary }]}>Total Enrollments</Text>
              <Text style={[styles.enrollmentNumber, { color: theme.primary }]}>
                {enrollmentStats?.totalEnrollments || 2}
              </Text>
            </View>
            <View style={styles.progressPercentageContainer}>
              <Text style={[styles.progressPercentage, { color: '#22C55E' }]}>20%</Text>
              <Text style={[styles.progressSubtitle, { color: theme.text.secondary }]}>overall progress</Text>
            </View>
          </View>

          {/* Gradient Progress Bar */}
          <View style={[styles.enrollmentProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.enrollmentProgressFill} />
          </View>

          {/* Latest Enrolled Card */}
          <View
            style={[
              styles.latestEnrolledCard,
              {
                backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.07)',
              },
            ]}
          >
            <Text style={[styles.latestEnrolledLabel, { color: theme.text.secondary }]}>LATEST ENROLLED</Text>
            <Text style={[styles.latestEnrolledCourse, { color: theme.text.primary }]}>
              📚 Natural Language Processing
            </Text>
            <Text style={[styles.latestEnrolledDesc, { color: theme.text.secondary }]}>
              Advanced course in NLP techniques and applications
            </Text>
          </View>
        </GlassCard>

        {/* 8. ENROLLED COURSES SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ENROLLED COURSES</Text>
        </View>

        {/* Course Card 1 */}
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 16 }]}
          opacity={0.05}
          glow={false}
        >
          <View style={styles.courseCardHeader}>
            <Text style={[styles.courseCardName, { color: theme.text.primary }]}>UI/UX Design</Text>
            <Text style={[styles.courseCardPercentage, { color: '#EC4899' }]}>50%</Text>
          </View>
          <View style={[styles.courseProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.courseProgressFill, { width: '50%', backgroundColor: '#EC4899' }]} />
          </View>
          <Text style={[styles.courseCardDesc, { color: theme.text.secondary }]}>
            Master the principles of modern UI/UX design
          </Text>
        </GlassCard>

        {/* Course Card 2 */}
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 16 }]}
          opacity={0.05}
          glow={false}
        >
          <View style={styles.courseCardHeader}>
            <Text style={[styles.courseCardName, { color: theme.text.primary }]}>Natural Language Processing</Text>
            <Text style={[styles.courseCardPercentage, { color: '#0EA5E9' }]}>64%</Text>
          </View>
          <View style={[styles.courseProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.courseProgressFill, { width: '64%', backgroundColor: '#0EA5E9' }]} />
          </View>
          <Text style={[styles.courseCardDesc, { color: theme.text.secondary }]}>
            Explore advanced NLP techniques and real-world applications
          </Text>
        </GlassCard>

        {/* 9. QUIZ PERFORMANCE SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>QUIZ PERFORMANCE</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 20 }]}
          opacity={0.05}
          glow={false}
        >
          {/* Two Metric Boxes */}
          <View style={styles.quizMetricsRow}>
            <View
              style={[
                styles.quizMetricBox,
                {
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderColor: 'rgba(59, 130, 246, 0.1)',
                },
              ]}
            >
              <Text style={[styles.quizMetricLabel, { color: theme.text.secondary }]}>Total Quizzes</Text>
              <Text style={[styles.quizMetricValue, { color: '#3B82F6' }]}>
                {userData?.totalQuizzesTaken || 1}
              </Text>
            </View>

            <View
              style={[
                styles.quizMetricBox,
                {
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  borderColor: 'rgba(34, 197, 94, 0.1)',
                },
              ]}
            >
              <Text style={[styles.quizMetricLabel, { color: theme.text.secondary }]}>Average Score</Text>
              <Text style={[styles.quizMetricValue, { color: '#22C55E' }]}>
                {userData?.averageScore || 0}%
              </Text>
            </View>
          </View>

          {/* Quiz Result Card */}
          <View
            style={[
              styles.quizResultCard,
              {
                backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.07)',
              },
            ]}
          >
            <View style={styles.quizResultHeaderRow}>
              <View>
                <Text style={[styles.quizResultTitle, { color: theme.text.primary }]}>Quiz #1</Text>
                <Text style={[styles.quizResultDate, { color: theme.text.secondary }]}>4/2/2026</Text>
              </View>

              {/* Grade Badge F */}
              <View style={[styles.gradeBadgeF, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Text style={styles.gradeBadgeText}>F</Text>
              </View>
            </View>

            {/* Score and Progress */}
            <View style={styles.quizScoreSection}>
              <Text style={[styles.quizScoreText, { color: theme.text.primary }]}>0 / 10</Text>
              <View style={[styles.quizScoreProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View
                  style={[
                    styles.quizScoreProgressFill,
                    { width: '0%', backgroundColor: '#EF4444' },
                  ]}
                />
              </View>
            </View>

            {/* Performance Indicator */}
            <Text style={[styles.quizPerformanceText, { color: '#EF4444' }]}>💪 Needs Improvement</Text>
          </View>
        </GlassCard>

        {/* 10. ACCOUNT DETAILS SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ACCOUNT DETAILS</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 16 }]}
          opacity={0.05}
          glow={false}
        >
          {/* Name */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <User size={18} color="#8B5CF6" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Name</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>{userData?.name || 'N/A'}</Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Email */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Mail size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Email</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>{userData?.email || 'N/A'}</Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Phone */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Phone size={18} color="#22C55E" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Phone</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>{userData?.phone || 'N/A'}</Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Age */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
              <Calendar size={18} color="#FBBF24" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Age</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>{userData?.age || 'N/A'}</Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Role */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
              <Shield size={18} color="#EC4899" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Role</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>{userData?.role || 'N/A'}</Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* User ID */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.1)' }]}>
              <Hash size={18} color="#0EA5E9" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>User ID</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]} numberOfLines={1}>
              {userData?.uuid?.substring(0, 8) || userData?._id?.substring(0, 8) || 'N/A'}...
            </Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Account Status */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              {userData?.isActivated ? <CheckCircle size={18} color="#22C55E" /> : <XCircle size={18} color="#EF4444" />}
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Account Status</Text>
            <View style={[styles.activeBadge, { backgroundColor: userData?.isActivated ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={[styles.activeBadgeText, { color: userData?.isActivated ? '#22C55E' : '#EF4444' }]}>
                {userData?.isActivated ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Member Since */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Calendar size={18} color="#8B5CF6" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Member Since</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={[styles.accountDetailDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          {/* Last Login */}
          <View style={styles.accountDetailRow}>
            <View style={[styles.accountDetailIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
              <Clock size={18} color="#F97316" />
            </View>
            <Text style={[styles.accountDetailKey, { color: theme.text.secondary }]}>Last Login</Text>
            <Text style={[styles.accountDetailValue, { color: theme.text.primary }]}>
              {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </GlassCard>

        {/* 11. ACCOUNT ACTIONS SECTION */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ACCOUNT ACTIONS</Text>
        </View>
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)' }]}
          opacity={0.05}
          glow={false}
        >
          <TouchableOpacity style={styles.actionItem} onPress={clearAllCache}>
            <View style={styles.actionIconContainer}>
              <Trash2 size={18} color="#FBBF24" />
            </View>
            <Text style={[styles.actionItemText, { color: theme.text.primary }]}>Clear Cache</Text>
            <ChevronRight size={18} color={theme.text.secondary} />
          </TouchableOpacity>

          <View style={[styles.hairlineDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />

          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <View style={styles.actionIconContainer}>
              <LogOut size={18} color="#EF4444" />
            </View>
            <Text style={[styles.actionItemText, { color: '#EF4444' }]}>Log Out</Text>
            <ChevronRight size={18} color="#EF4444" />
          </TouchableOpacity>
        </GlassCard>

        {/* 12. FOOTER */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: theme.text.secondary }]}>App Version 2.3</Text>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={closeEditModal}>
                <Text style={[styles.modalCloseButton, { color: theme.text.primary }]}>✕</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Edit Profile</Text>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={updatingProfile}
              >
                <Text style={[styles.modalSaveButton, { color: theme.primary, opacity: updatingProfile ? 0.5 : 1 }]}>
                  {updatingProfile ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Full Name Field */}
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: theme.text.primary }]}>Full Name</Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text.primary, borderColor: theme.border, backgroundColor: theme.componentBackground[0] }]}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.text.secondary}
                  value={editName}
                  onChangeText={setEditName}
                  editable={!updatingProfile}
                />
              </View>

              {/* Email Field */}
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: theme.text.primary }]}>Email</Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text.primary, borderColor: theme.border, backgroundColor: theme.componentBackground[0] }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.text.secondary}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!updatingProfile}
                />
              </View>

              {/* Phone Field */}
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: theme.text.primary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text.primary, borderColor: theme.border, backgroundColor: theme.componentBackground[0] }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.text.secondary}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  editable={!updatingProfile}
                />
              </View>

              {/* Age Field */}
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: theme.text.primary }]}>Age</Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text.primary, borderColor: theme.border, backgroundColor: theme.componentBackground[0] }]}
                  placeholder="Enter your age"
                  placeholderTextColor={theme.text.secondary}
                  value={editAge}
                  onChangeText={setEditAge}
                  keyboardType="numeric"
                  editable={!updatingProfile}
                />
              </View>

              {/* Bio Field */}
              <View style={styles.modalFormGroup}>
                <Text style={[styles.modalLabel, { color: theme.text.primary }]}>Bio</Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text.primary, borderColor: theme.border, backgroundColor: theme.componentBackground[0], height: 100, textAlignVertical: 'top' }]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={theme.text.secondary}
                  value={editBio}
                  onChangeText={setEditBio}
                  multiline
                  numberOfLines={4}
                  editable={!updatingProfile}
                />
              </View>

              {/* Photo Upload Section - Beautiful Card */}
              <View style={styles.photoUploadCard}>
                {/* Header */}
                <View style={styles.photoCardHeader}>
                  <Text style={[styles.photoCardTitle, { color: theme.text.primary }]}>
                    Profile Photo
                  </Text>
                  <Text style={[styles.photoCardSubtitle, { color: theme.text.secondary }]}>
                    JPG, PNG • Max 5MB
                  </Text>
                </View>

                {/* Photo Preview - Shows when photo is selected */}
                {selectedPhotoFile ? (
                  <View style={[styles.photoPreviewContainer, { backgroundColor: theme.componentBackground[0] }]}>
                    <Image
                      source={{ uri: selectedPhotoFile.uri }}
                      style={styles.photoPreview}
                    />
                    <TouchableOpacity
                      style={styles.clearPhotoButton}
                      onPress={() => {
                        setSelectedPhotoFile(null);
                        setPhotoMessage({ type: 'success', text: 'Photo selection cleared' });
                        setTimeout(() => setPhotoMessage(null), 2000);
                      }}
                    >
                      <Text style={styles.clearPhotoText}>✕ Clear</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Upload Button - Shows when no photo selected */
                  <TouchableOpacity
                    style={[
                      styles.beautifulUploadButton,
                      {
                        backgroundColor: uploadingPhoto
                          ? theme.componentBackground[0]
                          : theme.primary,
                        borderColor: theme.primary,
                        opacity: uploadingPhoto ? 0.6 : 1,
                      },
                    ]}
                    onPress={updateProfileImage}
                    disabled={uploadingPhoto}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadButtonContent}>
                      {uploadingPhoto ? (
                        <>
                          <ActivityIndicator color={theme.primary} size="large" />
                          <Text
                            style={[
                              styles.uploadButtonTextLoading,
                              { color: theme.text.primary, marginTop: 12 },
                            ]}
                          >
                            Uploading...
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.uploadIconCircle}>
                            <Text style={styles.uploadEmoji}>📸</Text>
                          </View>
                          <Text
                            style={[
                              styles.uploadButtonTextMain,
                              { color: '#FFF' },
                            ]}
                          >
                            Choose Photo
                          </Text>
                          <Text
                            style={[
                              styles.uploadButtonTextSub,
                              { color: 'rgba(255,255,255,0.8)' },
                            ]}
                          >
                            Tap to upload from gallery
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        onClose={() => {
          setShowSuccessPopup(false);
          setSelectedPhotoFile(null);
        }}
        title="Success!"
        message={successMessage}
        buttonText="Done"
      />
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 40,
  },

  // 1. TOP NAVIGATION BAR
  stickyNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // 2. HERO SECTION
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 16,
  },
  avatarImageDirect: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#667EEA',
  },
  addPhotoCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  addPhotoIconBig: {
    fontSize: 36,
    marginBottom: 4,
  },
  addPhotoTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  conicGradientRing: {
    display: 'none',
  },
  avatarImage: {
    display: 'none',
  },
  avatarInitials: {
    display: 'none',
  },
  onlineStatusDot: {
    display: 'none',
  },
  addPhotoLabel: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // Modern Add Photo Badge
  modernAddPhotoBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modernAddPhotoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },

  // Photo Upload Card Styles
  photoUploadCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
  },
  photoCardHeader: {
    marginBottom: 16,
  },
  photoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  photoCardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  photoPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    height: 200,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  clearPhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearPhotoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  photoAlertBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  photoAlertText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  beautifulUploadButton: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    borderWidth: 2,
    borderColor: '#667EEA',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadEmoji: {
    fontSize: 28,
  },
  uploadButtonTextMain: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  uploadButtonTextSub: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  uploadButtonTextLoading: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  heroInfoSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  heroUsername: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  editProfileButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // 3. STATUS PILLS
  statusPillsContainer: {
    marginVertical: 16,
  },
  statusPillsContent: {
    paddingHorizontal: 0,
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // Section Labels
  sectionLabelContainer: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },

  // Card Styles
  cardWithBorder: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  hairlineDivider: {
    height: 1,
    marginHorizontal: 0,
  },

  // 4. QUICK ACCESS
  quickAccessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  quickAccessItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // 5. FEATURES
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  featureItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soonText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#D97706',
  },
  featureSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  // 6. LEARNING STATISTICS
  learningStatsHeader: {
    marginBottom: 20,
  },
  learningStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  learningStatsSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  chartAndLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  donutChartContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLegend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  statBox: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  statBottomBar: {
    width: '70%',
    height: 2,
    borderRadius: 1,
  },

  // 7. ENROLLMENT DETAILS
  enrollmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  enrollmentLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  enrollmentNumber: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  progressPercentageContainer: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  progressSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  enrollmentProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  enrollmentProgressFill: {
    height: '100%',
    width: '20%',
    backgroundColor: '#8B5CF6',
  },

  latestEnrolledCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  latestEnrolledLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  latestEnrolledCourse: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  latestEnrolledDesc: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  // 8. ENROLLED COURSES
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseCardName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  courseCardPercentage: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  courseProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  courseCardDesc: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  // 9. QUIZ PERFORMANCE
  quizMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quizMetricBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizMetricLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginBottom: 6,
    textAlign: 'center',
  },
  quizMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },

  quizResultCard: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quizResultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  quizResultDate: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  gradeBadgeF: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  gradeBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
  },

  quizScoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  quizScoreText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  quizScoreProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  quizScoreProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  quizPerformanceText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // 10. ACCOUNT DETAILS
  accountDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  accountDetailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetailKey: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    flex: 0.4,
  },
  accountDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    flex: 0.6,
    textAlign: 'right',
  },
  accountDetailDivider: {
    height: 1,
    marginHorizontal: 0,
  },

  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },

  // 11. ACCOUNT ACTIONS
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // 12. FOOTER
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },

  // States
  container: {
    flex: 1,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingAnimation: {
    width: 250,
    height: 250,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },

  // EDIT PROFILE MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    fontSize: 28,
    fontWeight: '600',
    width: 36,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    width: 36,
    textAlign: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalFormGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  uploadPhotoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Profile;
