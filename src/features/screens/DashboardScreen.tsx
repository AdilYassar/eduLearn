import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { BotMessageSquare } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@service/hooks/useUser';
import { useTheme } from '../../context/ThemeContext';
import { push } from '../../utils/Navigation';
import { ThemedContainer, GlassCard } from '../../components/ui/ThemedComponents';
import DashboardHeader from '@components/dashboard/DashboardHeader';
import Courses from '@components/dashboard/Courses';
import QuizChallenge from '@components/dashboard/QuizChallenge';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';
import SocialCard from '@components/dashboard/SocialCard';
import DailySurprise from '@components/dashboard/DailySurprise';
import NewsComponent from '../../components/ui/NewsComponent';

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [coursesRefreshTrigger, setCoursesRefreshTrigger] = useState<number>(0);
  const { getUserProfile } = useUser();
  const { theme } = useTheme();

  // Container animation values
  const containerOpacity = useSharedValue(0);
  const containerScale = useSharedValue(0.95);
  const bottomNavOpacity = useSharedValue(0);
  const bottomNavTranslateY = useSharedValue(50);

  // Chat button animation values
  const chatButtonScale = useSharedValue(1);
  const chatButtonFloatY = useSharedValue(0);
  const chatButtonPulse = useSharedValue(1);

  const triggerAnimations = useCallback((skipReset: boolean = false) => {
    if (!skipReset) {
      containerOpacity.value = 0;
      containerScale.value = 0.95;
      bottomNavOpacity.value = 0;
      bottomNavTranslateY.value = 50;
    }

    containerOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    containerScale.value = withSequence(
      withTiming(0.98, { duration: 200 }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );

    const navDelay = skipReset ? 0 : 800;
    bottomNavOpacity.value = withDelay(navDelay, withSpring(1, { damping: 15, stiffness: 100 }));
    bottomNavTranslateY.value = withDelay(navDelay, withSpring(0, { damping: 15, stiffness: 100 }));

    // Chat button floating animation
    chatButtonFloatY.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.cubic) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.cubic) })
        ),
        -1,
        true
      )
    );

    // Chat button pulse animation
    chatButtonPulse.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    triggerAnimations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      triggerAnimations(true);
    }, [triggerAnimations])
  );

  const fetchUserData = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        const userProfile = await getUserProfile(accessToken);
        if (userProfile && userProfile.student) {
          setUserName(userProfile.student.name || userProfile.student.email);
          return;
        }
      }
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserName(parsedUserData.name);
      }
    } catch (fetchError) {
      console.error('📱 DashboardScreen: Error fetching user data:', fetchError);
    }
  }, [getUserProfile]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    containerScale.value = withSequence(
      withTiming(0.98, { duration: 200 }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );

    try {
      await fetchUserData();
      setCoursesRefreshTrigger(prev => prev + 1);
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setRefreshing(false);
    }
  }, [fetchUserData, containerScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const bottomNavAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomNavOpacity.value,
    transform: [{ translateY: bottomNavTranslateY.value }],
  }));

  const chatButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomNavOpacity.value,
    transform: [
      { translateY: bottomNavTranslateY.value + chatButtonFloatY.value },
      { scale: chatButtonPulse.value },
    ],
  }));

  const handleChatPress = () => {
    chatButtonScale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    setTimeout(() => push('Ai'), 100);
  };

  const content = [
    {
      id: 'dashboardHeader',
      component: <DashboardHeader userName={userName} />,
    },
    {
      id: 'courses',
      component: <Courses bgColor={[theme.background[0], theme.surface]} refreshTrigger={coursesRefreshTrigger} />,
    },
    {
      id: 'quizChallenge',
      component: <QuizChallenge />,
    },
    {
      id: 'socialCard',
      component: <SocialCard />,
    },
    {
      id: 'dailySurprise',
      component: <DailySurprise />,
    },

    {
      id: 'news',
      component: <NewsComponent />,
    },
  ];

  const renderItem = ({ item }: { item: { id: string; component: React.ReactNode } }) => (
    <View>{item.component}</View>
  );

  return (
    <ThemedContainer>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
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
              colors={[theme.primary]}
              tintColor={theme.primary}
              progressBackgroundColor={theme.card}
            />
          }
        />

        <Animated.View style={bottomNavAnimatedStyle}>
          <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="DashboardScreen" />
        </Animated.View>

        {/* Floating Chat Button */}
        <Animated.View style={[styles.floatingChatButton, chatButtonAnimatedStyle]}>
          {/* Glow/Pulse Background */}
          <Animated.View
            style={[
              styles.chatButtonGlow,
              { backgroundColor: theme.primary },
              useAnimatedStyle(() => ({
                opacity: withRepeat(
                  withSequence(
                    withTiming(0.3, { duration: 1200 }),
                    withTiming(0.1, { duration: 1200 })
                  ),
                  -1,
                  false
                ),
                transform: [
                  {
                    scale: withRepeat(
                      withSequence(
                        withTiming(1.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
                      ),
                      -1,
                      false
                    ),
                  },
                ],
              })),
            ]}
          />

          {/* Main Button */}
          <TouchableOpacity
            style={[styles.chatButtonInner, { backgroundColor: theme.primary }]}
            onPress={handleChatPress}
            activeOpacity={1}
          >
            <BotMessageSquare size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    zIndex: 50,
  },
  chatButtonGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 0,
    left: 0,
  },
  chatButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
});

export default DashboardScreen;