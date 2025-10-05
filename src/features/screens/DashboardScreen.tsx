import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '@utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import { useUser } from '@service/hooks/useUser';
import TimeTable from '@components/dashboard/TimeTable';
import SuggestionBox from '@components/dashboard/SuggestionBox';
import NewsComponent from '../../components/ui/NewsComponent';
import MoodSelector from '@components/dashboard/MoodSelector';
import Courses from '@components/dashboard/Courses';
import QuizChallenge from '@components/dashboard/QuizChallenge';

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string[]>(['#E8F5E9', '#F1F8F2']); // Default happy mood - light mint
  const [componentBgColor, setComponentBgColor] = useState<string[]>(['#E8F5E9', '#F1F8F2']); // Default happy mood
  const [fadeAnim] = useState(new Animated.Value(1));
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

  // Data for the FlatList
  const content = [
    { id: 'moodSelector', component: <MoodSelector userName={userName} onMoodChange={handleMoodChange} /> },
    { id: 'courses', component: <Courses bgColor={componentBgColor} /> },
    { id: 'quizChallenge', component: <QuizChallenge bgColor={componentBgColor[0]} /> },
    { id: 'SuggestionBox', component: <SuggestionBox bgColor={componentBgColor[0]} /> },
    { id: 'timetable', component: <TimeTable bgColor={componentBgColor[0]} /> },
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
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('CourseScreen')}
        >
          <Icon name="book" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('BookScreen')}
        >
          <Icon name="menu-book" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('Ai')}
        >
          <Icon name="chat" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>ChatAi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('HomeScreen')}
        >
          <Icon name="call" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('PodcastSplashScreen')}
        >
          <Icon name="mic" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Podcasts</Text>
        </TouchableOpacity>
      </View>
      
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    marginHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: Colors.primary_dark,
    marginTop: 5,
    fontFamily: 'Inter-Medium',
  },
});

export default DashboardScreen;
