/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import Lottie from 'lottie-react-native';
import CustomText from '../../components/ui/CustomText';
import { Colors } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate } from '../../utils/Navigation';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  // Particle animations (multiple particles)
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  const particle5 = useRef(new Animated.Value(0)).current;
  
  // Floating elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  
  const [showContent, setShowContent] = useState(false);
  
  const startParticleAnimations = useCallback(() => {
    const particles = [particle1, particle2, particle3, particle4, particle5];
    
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 2000 + (index * 200),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 2000 + (index * 200),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => animateParticle());
      };
      
      // Start with delay
      setTimeout(() => animateParticle(), index * 400);
    });
  }, [particle1, particle2, particle3, particle4, particle5]);
  
  const startFloatingAnimations = useCallback(() => {
    const floaters = [
      { anim: float1, duration: 3000 },
      { anim: float2, duration: 4000 },
      { anim: float3, duration: 3500 },
    ];
    
    floaters.forEach(({ anim, duration }) => {
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
      animateFloat();
    });
  }, [float1, float2, float3]);
  
  const startTextAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(textScaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [textFadeAnim, textScaleAnim]);
  
  const startPulseAnimation = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
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
          duration: 1200,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    setTimeout(() => bounce(), 1000);
  }, [bounceAnim]);

  const startAnimationSequence = useCallback(() => {
    // Background animation
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    
    // Start particle animations
    startParticleAnimations();
    
    // Start floating animations
    startFloatingAnimations();
    
    // Main content animations sequence
    Animated.sequence([
      // Initial fade and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      
      // Rotation animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowContent(true);
      startTextAnimations();
      startPulseAnimation();
      startBounceAnimation();
    });
  }, [
    backgroundAnim,
    fadeAnim,
    scaleAnim,
    translateYAnim,
    rotateAnim,
    startBounceAnimation,
    startFloatingAnimations,
    startParticleAnimations,
    startPulseAnimation,
    startTextAnimations,
  ]);
  
  useEffect(() => {
    // Start all animations in sequence
    startAnimationSequence();
    
    // Set a timeout to navigate after 4 seconds
    const timer = setTimeout(() => {
      navigate('DashboardScreen');
    }, 4000);
    
    return () => clearTimeout(timer);
  }, [startAnimationSequence]);
  
  // Animation interpolations
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  
  // Particle positions and animations
  const getParticleStyle = (particleAnim: Animated.Value, index: number) => {
    const translateY = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [height, -100],
    });
    
    const opacity = particleAnim.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });
    
    const scale = particleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });
    
    return {
      position: 'absolute' as const,
      left: (width / 6) * (index + 1),
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };
  
  // Floating elements styles
  const getFloatingStyle = (floatAnim: Animated.Value, position: any) => {
    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -30],
    });
    
    const opacity = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    });
    
    return {
      position: 'absolute' as const,
      ...position,
      transform: [{ translateY }],
      opacity,
    };
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Animated Background */}
      <Animated.View style={[
        styles.backgroundGradient,
        { opacity: backgroundOpacity },
      ]}>
        <View style={styles.gradientLayer1} />
        <View style={styles.gradientLayer2} />
        <View style={styles.gradientLayer3} />
      </Animated.View>
      
      {/* Floating Background Elements */}
      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float1, { top: 100, left: 50 }),
      ]}>
        <View style={[styles.circle, styles.whiteCircle]} />
      </Animated.View>
      
      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float2, { top: 200, right: 40 }),
      ]}>
        <View style={[styles.square, styles.whiteSquare]} />
      </Animated.View>
      
      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float3, { bottom: 150, left: 80 }),
      ]}>
        <View style={styles.triangle} />
      </Animated.View>
      
      {/* Particle System */}
      {[particle1, particle2, particle3, particle4, particle5].map((particle, index) => (
        <Animated.View key={index} style={getParticleStyle(particle, index)}>
          <View style={[styles.particle, { 
            backgroundColor: index % 2 === 0 ? '#FFD700' : '#FF6B6B',
            width: 8 + (index * 2),
            height: 8 + (index * 2),
            borderRadius: 8 + (index * 2),
          }]} />
        </Animated.View>
      ))}
      
      {/* Main Content Container */}
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
            { rotate: rotation }
          ],
        }
      ]}>
        {/* Pulsing Animation Container */}
        <Animated.View style={[
          styles.animationContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <View style={styles.glowContainer}>
            <Lottie
              source={require('../../assets/animations/twoppl.json')}
              autoPlay
              loop
              style={styles.animation}
              speed={1.2}
            />
          </View>
          
          {/* Bouncing Overlay Elements */}
          <Animated.View style={[
            styles.bounceOverlay,
            { 
              transform: [{ 
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10]
                }) 
              }] 
            }
          ]}>
            <View style={styles.sparkle} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
      
      {/* Animated Text */}
      {showContent && (
        <Animated.View style={[
          styles.textContainer,
          {
            opacity: textFadeAnim,
            transform: [{ scale: textScaleAnim }],
          }
        ]}>
          <CustomText 
            variant="h1" 
            size={RFValue(24)}
            fontFamily="Okra-Bold"
            style={styles.welcomeText}
          >
            Welcome to EduLearn
          </CustomText>
          
          {/* Animated Subtitle */}
          <Animated.View style={[
            styles.subtitleContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}>
            <CustomText 
              variant="h3" 
              size={RFValue(16)}
              fontFamily="Okra-Regular"
              style={styles.subtitleText}
            >
              Learning Made Beautiful
            </CustomText>
          </Animated.View>
          
          {/* Loading Dots Animation */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      })
                    }],
                    opacity: bounceAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    })
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}
      
      {/* Bottom Animated Wave */}
      <Animated.View style={[
        styles.bottomWave,
        {
          transform: [{
            translateY: backgroundAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })
          }]
        }
      ]}>
        <View style={styles.wave} />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    position: 'relative',
  },
  backgroundGradient: {
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
    backgroundColor: Colors.primary,
  },
  gradientLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(106, 90, 205, 0.3)',
  },
  gradientLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(65, 105, 225, 0.2)',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
    elevation: 20,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  animation: {
    width: 320,
    height: 320,
  },
  bounceOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sparkle: {
    width: 12,
    height: 12,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitleContainer: {
    marginTop: 10,
  },
  subtitleText: {
    color: '#E0E0E0',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginHorizontal: 4,
  },
  // Floating Elements
  floatingElement: {
    zIndex: 1,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  whiteCircle: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  whiteSquare: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  // Particles
  particle: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.8,
    elevation: 5,
  },
  // Bottom Wave
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  wave: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});