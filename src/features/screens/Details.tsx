/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import Lottie from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, replace } from '../../utils/Navigation';
import { Colors } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomButton from '../../components/ui/CustomButton';

const { width, height } = Dimensions.get('window');

const Details = () => {
  // Core animations
  const containerFadeAnim = useRef(new Animated.Value(0)).current;
  const containerSlideAnim = useRef(new Animated.Value(100)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced animations
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const lottieScaleAnim = useRef(new Animated.Value(0.5)).current;
  const lottieFadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Button individual animations
  const studentButtonSlide = useRef(new Animated.Value(50)).current;
  const adminButtonSlide = useRef(new Animated.Value(50)).current;
  const studentButtonScale = useRef(new Animated.Value(0.8)).current;
  const adminButtonScale = useRef(new Animated.Value(0.8)).current;
  
  // Particle animations for role selection theme
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  const particle5 = useRef(new Animated.Value(0)).current;
  const particle6 = useRef(new Animated.Value(0)).current;
  const particle7 = useRef(new Animated.Value(0)).current;
  const particle8 = useRef(new Animated.Value(0)).current;
  
  // Floating elements (books, graduation caps, etc.)
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;
  const float5 = useRef(new Animated.Value(0)).current;
  
  // Shimmer and glow effects
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Progress states
  const [showTitle, setShowTitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const startParticleAnimations = useCallback(() => {
    const particles = [particle1, particle2, particle3, particle4, particle5, particle6, particle7, particle8];
    
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 4000 + (index * 400),
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 4000 + (index * 400),
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
        ]).start(() => animateParticle());
      };
      
      setTimeout(() => animateParticle(), index * 500);
    });
  }, [particle1, particle2, particle3, particle4, particle5, particle6, particle7, particle8]);

  const startFloatingAnimations = useCallback(() => {
    const floaters = [
      { anim: float1, duration: 5000 },
      { anim: float2, duration: 6000 },
      { anim: float3, duration: 4500 },
      { anim: float4, duration: 5500 },
      { anim: float5, duration: 4800 },
    ];
    
    floaters.forEach(({ anim, duration }, index) => {
      const animateFloat = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => animateFloat());
      };
      
      setTimeout(() => animateFloat(), index * 800);
    });
  }, [float1, float2, float3, float4, float5]);

  const startPulseAnimation = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnim]);

  const startBounceAnimation = useCallback(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    setTimeout(() => bounce(), 2000);
  }, [bounceAnim]);

  const startShimmerAnimation = useCallback(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const startGlowAnimation = useCallback(() => {
    const glow = () => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => glow());
    };
    glow();
  }, [glowAnim]);

  const startTitleAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(titleSlideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowButtons(true);
      startButtonAnimations();
    });
  }, [titleFadeAnim, titleSlideAnim]);

  const startButtonAnimations = useCallback(() => {
    // Student button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(studentButtonScale, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(studentButtonSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Admin button animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(adminButtonScale, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(adminButtonSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Overall button container fade
    Animated.timing(buttonFadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, [studentButtonScale, studentButtonSlide, adminButtonScale, adminButtonSlide, buttonFadeAnim]);

  const startLottieAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(lottieFadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(lottieScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowTitle(true);
      startTitleAnimations();
      startPulseAnimation();
    });

    // Start rotation after initial animation
    setTimeout(() => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, [lottieFadeAnim, lottieScaleAnim, rotateAnim, startTitleAnimations, startPulseAnimation]);

  const startAnimationSequence = useCallback(() => {
    // Background animations
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Start supporting animations
    startFloatingAnimations();
    startShimmerAnimation();
    startGlowAnimation();

    // Container entrance
    Animated.parallel([
      Animated.timing(containerFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(containerSlideAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startLottieAnimations();
      startBounceAnimation();
      
      setTimeout(() => {
        setShowParticles(true);
        startParticleAnimations();
      }, 1000);
    });
  }, [
    backgroundAnim,
    containerFadeAnim,
    containerSlideAnim,
    scaleAnim,
    startFloatingAnimations,
    startShimmerAnimation,
    startGlowAnimation,
    startLottieAnimations,
    startBounceAnimation,
    startParticleAnimations,
  ]);

  useEffect(() => {
    startAnimationSequence();
  }, [startAnimationSequence]);

  // Animation interpolations
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.5, width * 1.5],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  // Particle styles for role selection theme
  const getParticleStyle = (particleAnim: Animated.Value, index: number) => {
    const isEven = index % 2 === 0;
    const translateY = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [height + 100, -200],
    });

    const translateX = particleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, isEven ? 80 : -80, 0],
    });

    const opacity = particleAnim.interpolate({
      inputRange: [0, 0.1, 0.8, 1],
      outputRange: [0, 0.8, 0.8, 0],
    });

    const scale = particleAnim.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0.2, 1.2, 1.2, 0.2],
    });

    const rotate = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', isEven ? '360deg' : '-360deg'],
    });

    return {
      position: 'absolute' as const,
      left: (width / 10) * (index + 1),
      transform: [{ translateY }, { translateX }, { scale }, { rotate }],
      opacity,
    };
  };

  // Floating educational elements
  const getFloatingStyle = (floatAnim: Animated.Value, position: any, index: number) => {
    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -60],
    });

    const translateX = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, index % 2 === 0 ? 30 : -30, 0],
    });

    const opacity = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.2, 0.7, 0.2],
    });

    const rotate = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', index % 2 === 0 ? '360deg' : '-360deg'],
    });

    const scale = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 1.2, 0.8],
    });

    return {
      position: 'absolute' as const,
      ...position,
      transform: [{ translateY }, { translateX }, { rotate }, { scale }],
      opacity,
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Animated Background */}
      <Animated.View style={[
        styles.backgroundContainer,
        { opacity: backgroundOpacity },
      ]}>
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
        
        {/* Shimmer Effect */}
        <Animated.View style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] }
        ]}>
          <View style={styles.shimmer} />
        </Animated.View>
      </Animated.View>

      {/* Floating Educational Elements */}
      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float1, { top: 100, left: 40 }, 0),
      ]}>
        <View style={[styles.bookIcon, styles.floatingBook1]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float2, { top: 180, right: 60 }, 1),
      ]}>
        <View style={[styles.graduationCap, styles.floatingCap1]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float3, { bottom: 250, left: 70 }, 2),
      ]}>
        <View style={[styles.pencilIcon, styles.floatingPencil1]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float4, { bottom: 180, right: 50 }, 3),
      ]}>
        <View style={[styles.lightbulbIcon, styles.floatingBulb1]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float5, { top: 300, left: 80 }, 4),
      ]}>
        <View style={[styles.starIcon, styles.floatingStar1]} />
      </Animated.View>

      {/* Enhanced Particle System */}
      {showParticles && [particle1, particle2, particle3, particle4, particle5, particle6, particle7, particle8].map((particle, index) => (
        <Animated.View key={index} style={getParticleStyle(particle, index)}>
          <View style={[styles.particle, {
            backgroundColor: [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
              '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
            ][index],
            width: 8 + (index % 4) * 4,
            height: 8 + (index % 4) * 4,
            borderRadius: 8 + (index % 4) * 4,
          }]} />
        </Animated.View>
      ))}

      {/* Main Content Container */}
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: containerFadeAnim,
          transform: [
            { translateY: containerSlideAnim },
            { scale: scaleAnim }
          ],
        }
      ]}>
        {/* Enhanced Lottie Container */}
        <Animated.View style={[
          styles.animationContainer,
          {
            opacity: lottieFadeAnim,
            transform: [
              { scale: lottieScaleAnim },
              { rotate: rotation },
              { scale: pulseAnim }
            ],
          }
        ]}>
          <Animated.View style={[
            styles.glowContainer,
            { opacity: glowOpacity }
          ]}>
            <Lottie
              source={require('../../assets/animations/student.json')}
              autoPlay
              loop
              style={styles.animation}
              speed={0.8}
            />
          </Animated.View>

          {/* Bouncing Role Icons */}
          <Animated.View style={[
            styles.roleIconsContainer,
            {
              transform: [{
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20]
                })
              }]
            }
          ]}>
            <View style={styles.studentIcon} />
            <View style={styles.adminIcon} />
          </Animated.View>
        </Animated.View>

        {/* Enhanced Title */}
        {showTitle && (
          <Animated.View style={[
            styles.titleContainer,
            {
              opacity: titleFadeAnim,
              transform: [{ translateY: titleSlideAnim }],
            }
          ]}>
            <Text style={styles.title}>Welcome! Who are you?</Text>
            
            {/* Animated underline */}
            <Animated.View style={[
              styles.underline,
              { transform: [{ scaleX: titleFadeAnim }] }
            ]} />
          </Animated.View>
        )}

        {/* Enhanced Button Container */}
        {showButtons && (
          <Animated.View style={[
            styles.buttonContainer,
            { opacity: buttonFadeAnim }
          ]}>
            <Animated.View style={[
              styles.buttonWrapper,
              {
                transform: [
                  { translateY: studentButtonSlide },
                  { scale: studentButtonScale }
                ],
              }
            ]}>
              <CustomButton
                title="🎓 Student"
                onPress={() => replace('LoginScreen')}
                styles={[styles.studentButton, styles.enhancedButton]}
              />
            </Animated.View>

            <Animated.View style={[
              styles.buttonWrapper,
              {
                transform: [
                  { translateY: adminButtonSlide },
                  { scale: adminButtonScale }
                ],
              }
            ]}>
              <CustomButton
                title="👨‍💼 Admin"
                onPress={() => replace('AdminLoginScreen')}
                styles={[styles.adminButton, styles.enhancedButton]}
              />
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>

      {/* Decorative Bottom Elements */}
      <Animated.View style={[
        styles.bottomDecoration,
        {
          transform: [{
            translateY: backgroundAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [200, 0],
            })
          }]
        }
      ]}>
        <View style={styles.decorativeLine1} />
        <View style={styles.decorativeLine2} />
      </Animated.View>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240, 248, 255, 0.8)',
  },
  gradientLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(230, 245, 255, 0.6)',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    width: width * 0.3,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    shadowOpacity: 0.4,
    elevation: 30,
  },
  animation: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  roleIconsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
  },
  studentIcon: {
    width: 15,
    height: 15,
    backgroundColor: Colors.teal_300,
    borderRadius: 7.5,
    marginRight: 8,
    shadowColor: Colors.teal_300,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.8,
    elevation: 5,
  },
  adminIcon: {
    width: 15,
    height: 15,
    backgroundColor: Colors.secondary_dark,
    borderRadius: 7.5,
    shadowColor: Colors.secondary_dark,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.8,
    elevation: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: RFValue(20),
    marginBottom: RFValue(15),
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  underline: {
    width: 100,
    height: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    borderRadius: 1.5,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: RFValue(10),
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: RFValue(15),
  },
  enhancedButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 25,
  },
  studentButton: {
    backgroundColor: Colors.teal_300,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  adminButton: {
    backgroundColor: Colors.secondary_dark,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Floating Elements
  floatingElement: {
    zIndex: 5,
  },
  bookIcon: {
    width: 40,
    height: 30,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    position: 'relative',
  },
  floatingBook1: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  graduationCap: {
    width: 35,
    height: 35,
    backgroundColor: '#4ECDC4',
    borderRadius: 17.5,
    position: 'relative',
  },
  floatingCap1: {
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  pencilIcon: {
    width: 6,
    height: 45,
    backgroundColor: '#FECA57',
    borderRadius: 3,
  },
  floatingPencil1: {
    shadowColor: '#FECA57',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  lightbulbIcon: {
    width: 25,
    height: 35,
    backgroundColor: '#54A0FF',
    borderRadius: 12.5,
  },
  floatingBulb1: {
    shadowColor: '#54A0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  starIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF9FF3',
  },
  floatingStar1: {
    shadowColor: '#FF9FF3',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  // Particles
  particle: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 10,
  },
  // Decorative Elements
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  decorativeLine1: {
    width: 80,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    opacity: 0.6,
  },
  decorativeLine2: {
    width: 60,
    height: 4,
    backgroundColor: Colors.secondary_dark,
    borderRadius: 2,
    opacity: 0.6,
  },
});