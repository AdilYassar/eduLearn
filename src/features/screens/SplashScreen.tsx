import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';
import { checkAuthStatus } from '@service/authUtils';
import { BASE_URL } from '@service/config';

const SplashScreen = () => {
  // Logo animation
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Letter animations - individual control for each letter
  const letterE = useRef(new Animated.Value(0)).current;
  const letterD = useRef(new Animated.Value(0)).current;
  const letterU = useRef(new Animated.Value(0)).current;
  const letterL = useRef(new Animated.Value(0)).current;
  const letterE2 = useRef(new Animated.Value(0)).current;
  const letterA = useRef(new Animated.Value(0)).current;
  const letterR = useRef(new Animated.Value(0)).current;
  const letterN = useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    // Phase 1: Logo fade in and scale (0-800ms)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Logo continuous rotation (starts at 800ms, runs for 3200ms until last letter)
    Animated.sequence([
      Animated.delay(800),
      Animated.loop(
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: 2 } // 2 full rotations = 3200ms
      ),
    ]).start();

    // Phase 3: Sequential letter animations (800ms - 4000ms = 3200ms for all letters)
    const letterDelay = 400; // Time between each letter
    const letterDuration = 400; // Duration for each letter animation

    // Letter timing breakdown:
    // E: 800ms, D: 1200ms, U: 1600ms, L: 2000ms, E: 2400ms, A: 2800ms, R: 3200ms, N: 3600ms
    const letters = [
      { anim: letterE, delay: 800 },
      { anim: letterD, delay: 1200 },
      { anim: letterU, delay: 1600 },
      { anim: letterL, delay: 2000 },
      { anim: letterE2, delay: 2400 },
      { anim: letterA, delay: 2800 },
      { anim: letterR, delay: 3200 },
      { anim: letterN, delay: 3600 }, // Last letter completes at 4000ms
    ];

    letters.forEach(({ anim, delay }) => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(anim, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [
    logoRotation,
    logoScale,
    logoOpacity,
    letterE,
    letterD,
    letterU,
    letterL,
    letterE2,
    letterA,
    letterR,
    letterN,
  ]);

  useEffect(() => {
    startAnimation();

    const checkAuthAndNavigate = async () => {
      try {
        console.log('SplashScreen: Checking authentication status...');
        const isAuthenticated = await checkAuthStatus(BASE_URL);
        
        setTimeout(() => {
          if (isAuthenticated) {
            console.log('SplashScreen: User is authenticated, replacing with dashboard');
            replace('DashboardScreen');
          } else {
            console.log('SplashScreen: User is not authenticated, navigating to introduction');
            navigate('IntroductionScreen');
          }
        }, 4000);
      } catch (error) {
        console.error('SplashScreen: Error checking authentication:', error);
        setTimeout(() => {
          navigate('IntroductionScreen');
        }, 4000);
      }
    };
    checkAuthAndNavigate();
  }, [startAnimation]);

  // Convert rotation value to degrees
  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Letter animation interpolation (scale + opacity for smooth appearance)
  const getLetterStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
      },
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Spinning Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { rotate: spin }],
          },
        ]}
      >
        <Image
          source={require('../../assets/getStarted/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Sequential Letter Animations */}
      <View style={styles.textContainer}>
        <View style={styles.textRow}>
          {/* EDU */}
          <Animated.View style={getLetterStyle(letterE)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              E
            </CustomText>
          </Animated.View>
          
          <Animated.View style={getLetterStyle(letterD)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              D
            </CustomText>
          </Animated.View>
          
          <Animated.View style={getLetterStyle(letterU)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              U
            </CustomText>
          </Animated.View>

          {/* L with Gradient */}
          <Animated.View style={[styles.maskedView, getLetterStyle(letterL)]}>
            <MaskedView
              style={{ flex: 1 }}
              maskElement={
                <CustomText
                  variant="h1"
                  size={RFValue(65)}
                  fontFamily="Inter-Bold"
                  style={styles.maskText}
                >
                  L
                </CustomText>
              }
            >
              <LinearGradient
                colors={['#007AFF', '#0051D5', '#003D99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              />
            </MaskedView>
          </Animated.View>

          {/* EARN */}
          <Animated.View style={getLetterStyle(letterE2)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              E
            </CustomText>
          </Animated.View>
          
          <Animated.View style={getLetterStyle(letterA)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              A
            </CustomText>
          </Animated.View>
          
          <Animated.View style={getLetterStyle(letterR)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              R
            </CustomText>
          </Animated.View>
          
          <Animated.View style={getLetterStyle(letterN)}>
            <CustomText
              variant="h1"
              size={RFValue(32)}
              fontFamily="Inter-Bold"
              style={styles.letterText}
            >
              N
            </CustomText>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
  },
  textContainer: {
    alignItems: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letterText: {
    color: '#2C2C2C',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  maskedView: {
    marginHorizontal: -5,
    width: 70,
    height: 70,
  },
  maskText: {
    backgroundColor: 'transparent',
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: RFValue(95),
    lineHeight: RFValue(60),
    textAlignVertical: 'center',
  },
  gradient: {
    flex: 1,
    height: 70,
    width: 70,
  },
});