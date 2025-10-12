import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '@utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import { useUser } from '@service/hooks/useUser';
import SuggestionBox from '@components/dashboard/SuggestionBox';
import NewsComponent from '../../components/ui/NewsComponent';
import MoodSelector from '@components/dashboard/MoodSelector';
import Courses from '@components/dashboard/Courses';
import QuizChallenge from '@components/dashboard/QuizChallenge';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string[]>(['#E8F5E9', '#F1F8F2']); // Default happy mood - light mint
  const [componentBgColor, setComponentBgColor] = useState<string[]>(['#E8F5E9', '#F1F8F2']); // Default happy mood
  const [fadeAnim] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { getUserProfile } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('📱 DashboardScreen: Fetching user data...');
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log('📱 DashboardScreen: Access token exists:', !!accessToken);
        
        if (accessToken) {
          // Try to get user data from API
          const userProfile = await getUserProfile(accessToken);
          console.log('📱 DashboardScreen: User profile from API:', userProfile);
          if (userProfile && userProfile.student) {
            const name = userProfile.student.name || userProfile.student.email;
            console.log('📱 DashboardScreen: Setting userName to:', name);
            setUserName(name);
            return;
          }
        }

        // Fallback to stored user data
        const storedUserData = await AsyncStorage.getItem('userData');
        console.log('📱 DashboardScreen: Stored userData exists:', !!storedUserData);
        if (!storedUserData) {
          console.log('📱 DashboardScreen: No stored user data found');
          return;
        }

        const parsedUserData = JSON.parse(storedUserData);
        console.log('📱 DashboardScreen: Parsed user data:', parsedUserData);
        console.log('📱 DashboardScreen: Setting userName to:', parsedUserData.name);
        setUserName(parsedUserData.name);
      } catch (fetchError) {
        console.error('📱 DashboardScreen: Error fetching user data:', fetchError);
      }
    };

    fetchUserData();
  }, [getUserProfile]);

  const handleMoodChange = (bgColor: string[], compBgColor: string[]) => {
    // Fade animation for smooth background color transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();

    setBackgroundColor(bgColor);
    setComponentBgColor(compBgColor);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      const fetchUserData = async () => {
        try {
          console.log('📱 DashboardScreen: Refreshing user data...');
          const accessToken = await AsyncStorage.getItem('accessToken');
          console.log('📱 DashboardScreen: Access token exists:', !!accessToken);
          
          if (accessToken) {
            // Try to get user data from API
            const userProfile = await getUserProfile(accessToken);
            console.log('📱 DashboardScreen: User profile from API:', userProfile);
            if (userProfile && userProfile.student) {
              const name = userProfile.student.name || userProfile.student.email;
              console.log('📱 DashboardScreen: Setting userName to:', name);
              setUserName(name);
              return;
            }
          }

          // Fallback to stored user data
          const storedUserData = await AsyncStorage.getItem('userData');
          console.log('📱 DashboardScreen: Stored userData exists:', !!storedUserData);
          if (!storedUserData) {
            console.log('📱 DashboardScreen: No stored user data found');
            return;
          }

          const parsedUserData = JSON.parse(storedUserData);
          console.log('📱 DashboardScreen: Parsed user data:', parsedUserData);
          console.log('📱 DashboardScreen: Setting userName to:', parsedUserData.name);
          setUserName(parsedUserData.name);
        } catch (fetchError) {
          console.error('📱 DashboardScreen: Error fetching user data:', fetchError);
        }
      };

      await fetchUserData();
      
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setRefreshing(false);
    }
  }, [getUserProfile]);

  // Data for the FlatList
  const content = [
    { id: 'moodSelector', component: <MoodSelector userName={userName} onMoodChange={handleMoodChange} /> },
    { id: 'courses', component: <Courses bgColor={componentBgColor} /> },
    { id: 'quizChallenge', component: <QuizChallenge bgColor={componentBgColor[0]} /> },
    { id: 'SuggestionBox', component: <SuggestionBox bgColor={componentBgColor[0]} /> },
    { id: 'news', component: <NewsComponent bgColor={componentBgColor[0]} /> },
  ];

  const renderItem = ({ item }: { item: { id: string; component: any } }) => {
    return item.component;
  };

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Main Content */}
      <FlatList
        data={content}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5B4FC6']}
            tintColor="#5B4FC6"
            progressBackgroundColor="#fff"
          />
        }
      />

      {/* Bottom Navigation Bar */}
      <BottomNavigationBar backgroundColor={componentBgColor[0]} currentScreen="DashboardScreen" />
      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.teal_400,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
  },
  content: {
    flexGrow: 1,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default DashboardScreen;
