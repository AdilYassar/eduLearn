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
  withInfiniteLoop,
  Easing,
} from 'react-native-reanimated';
import { BotMessageSquare } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@service/hooks/useUser';
import { useTheme } from '../../context/ThemeContext';
import { push } from '../../utils/Navigation';
import { ThemedContainer } from '../../components/ui/ThemedComponents';
import DashboardHeader from '@components/dashboard/DashboardHeader';
import Courses from '@components/dashboard/Courses';
import QuizChallenge from '@components/dashboard/QuizChallenge';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';
import SocialCard from '@components/dashboard/SocialCard';
import DailySurprise from '@components/dashboard/DailySurprise';
import NewsComponent from '../../components/ui/NewsComponent';

// Animated Wrapper Component for each dashboard item
const AnimatedDashboardItem = React.memo(({
  children,
  index,
  delay = 0,
  animationType = 'slideUp',
  animationTrigger = 0
}: {
  children: React.ReactNode;
  index: number;
  delay?: number;
  animationType?: 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  animationTrigger?: number; // Trigger to restart animations
}) => {
  // Initialize values based on animation type
  const getInitialValues = () => {
    switch (animationType) {
      case 'slideLeft':
        return { opacity: 0, translateY: 0, translateX: 100, scale: 0.8, rotate: 0 };
      case 'slideRight':
        return { opacity: 0, translateY: 0, translateX: -100, scale: 0.8, rotate: 0 };
      case 'rotate':
        return { opacity: 0, translateY: 0, translateX: 0, scale: 0.8, rotate: -10 };
      case 'scale':
        return { opacity: 0, translateY: 0, translateX: 0, scale: 0.5, rotate: 0 };
      default: // slideUp
        return { opacity: 0, translateY: 50, translateX: 0, scale: 0.8, rotate: 0 };
    }
  };

  const initialValues = getInitialValues();
  const opacity = useSharedValue(initialValues.opacity);
  const translateY = useSharedValue(initialValues.translateY);
  const translateX = useSharedValue(initialValues.translateX);
  const scale = useSharedValue(initialValues.scale);
  const rotate = useSharedValue(initialValues.rotate);

  useEffect(() => {
    // Reset values to initial state before animating
    opacity.value = initialValues.opacity;
    translateY.value = initialValues.translateY;
    translateX.value = initialValues.translateX;
    scale.value = initialValues.scale;
    rotate.value = initialValues.rotate;

    const baseDelay = delay + index * 150; // Stagger each item by 150ms

    switch (animationType) {
      case 'slideUp':
        opacity.value = withDelay(baseDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        translateY.value = withDelay(baseDelay, withSpring(0, { damping: 12, stiffness: 100 }));
        scale.value = withDelay(
          baseDelay,
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1, { damping: 10, stiffness: 120 })
          )
        );
        break;
      case 'slideLeft':
        opacity.value = withDelay(baseDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        translateX.value = withDelay(baseDelay, withSpring(0, { damping: 12, stiffness: 100 }));
        scale.value = withDelay(
          baseDelay,
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1, { damping: 10, stiffness: 120 })
          )
        );
        break;
      case 'slideRight':
        opacity.value = withDelay(baseDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        translateX.value = withDelay(baseDelay, withSpring(0, { damping: 12, stiffness: 100 }));
        scale.value = withDelay(
          baseDelay,
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1, { damping: 10, stiffness: 120 })
          )
        );
        break;
      case 'scale':
        opacity.value = withDelay(baseDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        scale.value = withDelay(
          baseDelay,
          withSequence(
            withTiming(1.3, { duration: 400 }),
            withSpring(0.95, { damping: 10, stiffness: 120 }),
            withSpring(1, { damping: 10, stiffness: 120 })
          )
        );
        break;
      case 'rotate':
        opacity.value = withDelay(baseDelay, withSpring(1, { damping: 12, stiffness: 100 }));
        rotate.value = withDelay(baseDelay, withSpring(0, { damping: 12, stiffness: 100 }));
        scale.value = withDelay(
          baseDelay,
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withSpring(1, { damping: 10, stiffness: 120 })
          )
        );
        break;
    }
  }, [index, delay, animationType, animationTrigger]);

  // Note: Breathing effect removed to avoid conflicts with main animations
  // The scale animations are already smooth and spring-based

  const animatedStyle = useAnimatedStyle(() => {
    const transforms: any[] = [{ scale: scale.value }];

    if (animationType === 'slideLeft' || animationType === 'slideRight') {
      transforms.push({ translateX: translateX.value });
    } else if (animationType === 'rotate') {
      transforms.push({ rotate: `${rotate.value}deg` });
    } else {
      transforms.push({ translateY: translateY.value });
    }

    return {
      opacity: opacity.value,
      transform: transforms,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
});

AnimatedDashboardItem.displayName = 'AnimatedDashboardItem';

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [animationTrigger, setAnimationTrigger] = useState<number>(0);
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

  // Function to trigger all animations
  const triggerAnimations = useCallback((skipReset: boolean = false) => {
    // Only reset if not already visible (first load)
    if (!skipReset) {
      containerOpacity.value = 0;
      containerScale.value = 0.95;
      bottomNavOpacity.value = 0;
      bottomNavTranslateY.value = 50;
    }

    // Container fades in and scales up smoothly
    containerOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
    containerScale.value = withSequence(
      withTiming(0.98, { duration: 200 }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );

    // Bottom nav appears after a delay (or immediately if returning)
    const navDelay = skipReset ? 0 : 800;
    bottomNavOpacity.value = withDelay(navDelay, withSpring(1, { damping: 15, stiffness: 100 }));
    bottomNavTranslateY.value = withDelay(navDelay, withSpring(0, { damping: 15, stiffness: 100 }));

    // Chat button floating animation - infinite subtle bounce
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

    // Chat button pulse animation - gentle scale pulse
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

    // Trigger item animations by updating animationTrigger
    setAnimationTrigger(prev => prev + 1);
    setIsMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Shared values are stable and don't need to be in dependencies

  // Trigger animations on mount
  useEffect(() => {
    triggerAnimations();
  }, []);

  // Trigger animations every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Pass true to skipReset so button appears immediately when returning from navigation
      triggerAnimations(true);
    }, [triggerAnimations])
  );

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

  // Re-animate items on refresh (subtle pulse effect)
  const animateRefresh = useCallback(() => {
    // Subtle container scale pulse
    containerScale.value = withSequence(
      withTiming(0.98, { duration: 200 }),
      withSpring(1, { damping: 12, stiffness: 120 })
    );
  }, [containerScale]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    animateRefresh(); // Trigger refresh animation

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

      // Trigger courses refresh
      setCoursesRefreshTrigger(prev => prev + 1);

      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setRefreshing(false);
    }
  }, [getUserProfile, animateRefresh]);

  // Container animated style
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  // Bottom navigation animated style
  const bottomNavAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomNavOpacity.value,
    transform: [{ translateY: bottomNavTranslateY.value }],
  }));

  // Chat button animated style with floating and pulse effects
  const chatButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: chatButtonFloatY.value },
      { scale: chatButtonPulse.value },
    ],
  }));

  // Chat button press handler with spring animation
  const handleChatPress = () => {
    // Spring bounce on press
    chatButtonScale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    // Navigate after a short delay to let animation start
    setTimeout(() => push('Ai'), 100);
  };

  // Data for the FlatList with animation types
  const content = [
    {
      id: 'dashboardHeader',
      component: <DashboardHeader userName={userName} />,
      animationType: 'slideUp' as const,
      delay: 0,
    },
    {
      id: 'courses',
      component: <Courses bgColor={[theme.background[0], theme.surface]} refreshTrigger={coursesRefreshTrigger} />,
      animationType: 'slideLeft' as const,
      delay: 150,
    },
    {
      id: 'quizChallenge',
      component: <QuizChallenge />,
      animationType: 'scale' as const,
      delay: 300,
    },
    {
      id: 'socialCard',
      component: <SocialCard />,
      animationType: 'slideRight' as const,
      delay: 375,
    },
    {
      id: 'dailySurprise',
      component: <DailySurprise />,
      animationType: 'slideUp' as const,
      delay: 450,
    },
    {
      id: 'news',
      component: <NewsComponent />,
      animationType: 'slideUp' as const,
      delay: 600,
    },
  ];

  const renderItem = ({ item, index }: { item: { id: string; component: any; animationType: string; delay: number }; index: number }) => {
    if (!isMounted) {
      return null;
    }

    return (
      <AnimatedDashboardItem
        index={index}
        delay={item.delay}
        animationType={item.animationType as any}
        animationTrigger={animationTrigger}
      >
        {item.component}
      </AnimatedDashboardItem>
    );
  };

  return (
    <ThemedContainer>
      {/* Main Content */}
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

        {/* Bottom Navigation Bar with Animation */}
        <Animated.View style={bottomNavAnimatedStyle}>
          <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="DashboardScreen" />
        </Animated.View>

        {/* Floating Chat Button */}
        <Animated.View
          style={[
            styles.floatingChatButton,
            {
              opacity: bottomNavOpacity.value,
              transform: [{ translateY: bottomNavTranslateY.value }],
            },
            chatButtonAnimatedStyle,
          ]}
        >
          {/* Glow/Pulse Background */}
          <Animated.View
            style={[
              styles.chatButtonGlow,
              {
                backgroundColor: theme.primary,
              },
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
    paddingBottom: 120, // Sufficient padding to prevent tab bar overlap
    borderTopLeftRadius: 12, // Sharper top edge
    borderTopRightRadius: 12, // Sharper top edge
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
