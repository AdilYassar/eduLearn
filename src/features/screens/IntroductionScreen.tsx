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
import CustomText from '../../components/ui/CustomText';
import { Colors, Fonts } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';
import CustomButton from '../../components/ui/CustomButton';

const { width, height } = Dimensions.get('window');

const IntroductionScreen = () => {
  // Main container animations
  const containerFadeAnim = useRef(new Animated.Value(0)).current;
  const containerSlideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Enhanced animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;
  const particle5 = useRef(new Animated.Value(0)).current;
  const particle6 = useRef(new Animated.Value(0)).current;
  
  // Floating elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;
  const float4 = useRef(new Animated.Value(0)).current;
  
  // Shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const startParticleAnimations = useCallback(() => {
    const particles = [particle1, particle2, particle3, particle4, particle5, particle6];
    
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 3000 + (index * 300),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 3000 + (index * 300),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => animateParticle());
      };
      
      setTimeout(() => animateParticle(), index * 600);
    });
  }, [particle1, particle2, particle3, particle4, particle5, particle6]);

  const startFloatingAnimations = useCallback(() => {
    const floaters = [
      { anim: float1, duration: 4000 },
      { anim: float2, duration: 5000 },
      { anim: float3, duration: 4500 },
      { anim: float4, duration: 3500 },
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
  }, [float1, float2, float3, float4]);

  const startTextAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(textScaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show button after text animation
      setShowButton(true);
      startButtonAnimations();
    });
  }, [textFadeAnim, textScaleAnim]);

  const startPulseAnimation = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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
          duration: 2000,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    setTimeout(() => bounce(), 1500);
  }, [bounceAnim]);

  const startButtonAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(buttonSlideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonFadeAnim, buttonSlideAnim]);

  const startShimmerAnimation = useCallback(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnim]);

  const startAnimationSequence = useCallback(() => {
    // Background animation
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Start floating and particle animations
    startFloatingAnimations();
    startParticleAnimations();
    startShimmerAnimation();

    // Container animations
    Animated.parallel([
      Animated.timing(containerFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(containerSlideAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowContent(true);
      startTextAnimations();
      startPulseAnimation();
      startBounceAnimation();
    });

    // Lottie animation entrance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.out(Easing.back(1.1)),
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation for Lottie
    setTimeout(() => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, [
    backgroundAnim,
    containerFadeAnim,
    containerSlideAnim,
    scaleAnim,
    fadeAnim,
    slideAnim,
    rotateAnim,
    startFloatingAnimations,
    startParticleAnimations,
    startShimmerAnimation,
    startTextAnimations,
    startPulseAnimation,
    startBounceAnimation,
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
    outputRange: [0.6, 1],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width * 2],
  });

  // Particle styles
  const getParticleStyle = (particleAnim: Animated.Value, index: number) => {
    const translateY = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [height + 50, -150],
    });

    const translateX = particleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, (index % 2 === 0 ? 50 : -50), 0],
    });

    const opacity = particleAnim.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    const scale = particleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1.2, 0.3],
    });

    return {
      position: 'absolute' as const,
      left: (width / 8) * (index + 1),
      transform: [{ translateY }, { translateX }, { scale }],
      opacity,
    };
  };

  // Floating elements styles
  const getFloatingStyle = (floatAnim: Animated.Value, position: any) => {
    const translateY = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -40],
    });

    const translateX = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 20, 0],
    });

    const opacity = floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.2, 0.8, 0.2],
    });

    const rotate = floatAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return {
      position: 'absolute' as const,
      ...position,
      transform: [{ translateY }, { translateX }, { rotate }],
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
        
        {/* Shimmer Effect */}
        <Animated.View style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] }
        ]}>
          <View style={styles.shimmer} />
        </Animated.View>
      </Animated.View>

      {/* Floating Background Elements */}
      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float1, { top: 80, left: 30 }),
      ]}>
        <View style={[styles.circle, styles.educationIcon]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float2, { top: 150, right: 50 }),
      ]}>
        <View style={[styles.hexagon, styles.innovationIcon]} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float3, { bottom: 200, left: 60 }),
      ]}>
        <View style={styles.star} />
      </Animated.View>

      <Animated.View style={[
        styles.floatingElement,
        getFloatingStyle(float4, { bottom: 120, right: 40 }),
      ]}>
        <View style={[styles.diamond, styles.learningIcon]} />
      </Animated.View>

      {/* Enhanced Particle System */}
      {[particle1, particle2, particle3, particle4, particle5, particle6].map((particle, index) => (
        <Animated.View key={index} style={getParticleStyle(particle, index)}>
          <View style={[styles.particle, {
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][index],
            width: 6 + (index * 3),
            height: 6 + (index * 3),
            borderRadius: 6 + (index * 3),
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
        {/* Animated Lottie Container */}
        <Animated.View style={[
          styles.animationContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { rotate: rotation },
              { scale: pulseAnim }
            ],
          }
        ]}>
          <View style={styles.glowContainer}>
            <Lottie
              source={require('../../assets/animations/aboutus.json')}
              autoPlay
              loop
              style={styles.animation}
              speed={0.8}
            />
          </View>

          {/* Bouncing Sparkles */}
          <Animated.View style={[
            styles.sparkleContainer,
            {
              transform: [{
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15]
                })
              }]
            }
          ]}>
            <View style={styles.sparkle1} />
            <View style={styles.sparkle2} />
            <View style={styles.sparkle3} />
          </Animated.View>
        </Animated.View>

        {/* Enhanced Text Container */}
        {showContent && (
          <Animated.View style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ scale: textScaleAnim }],
            }
          ]}>
            <CustomText variant="h4" size={RFValue(18)} style={styles.text}>
              Ready to Learn Something New Today?
            </CustomText>
            
            <Animated.View style={[
              styles.subTextContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Text style={styles.subText}>
                Empowering Education Through Innovation
              </Text>
            </Animated.View>

            {/* Animated Progress Dots */}
            <View style={styles.progressContainer}>
              {[0, 1, 2, 3].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      transform: [{
                        scale: bounceAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        })
                      }],
                      opacity: bounceAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.4, 1, 0.4],
                      })
                    }
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Enhanced Button */}
        {showButton && (
          <Animated.View style={[
            styles.buttonContainer,
            {
              opacity: buttonFadeAnim,
              transform: [{ translateY: buttonSlideAnim }],
            }
          ]}>
            <CustomButton
              title="Get Started"
              onPress={() => navigate('Details')}
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Bottom Wave Animation */}
      <Animated.View style={[
        styles.bottomWave,
        {
          transform: [{
            translateY: backgroundAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [150, 0],
            })
          }]
        }
      ]}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
      </Animated.View>
    </View>
  );
};

export default IntroductionScreen;

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
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
  },
  gradientLayer3: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    shadowOpacity: 0.6,
    elevation: 25,
  },
  animation: {
    width: 400,
    height: 400,
    alignSelf: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
  sparkle1: {
    width: 8,
    height: 8,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sparkle2: {
    width: 6,
    height: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
    position: 'absolute',
    top: 15,
    left: 10,
  },
  sparkle3: {
    width: 10,
    height: 10,
    backgroundColor: '#4ECDC4',
    borderRadius: 5,
    position: 'absolute',
    top: -5,
    left: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: RFValue(30),
    paddingHorizontal: RFValue(20),
  },
  text: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subTextContainer: {
    marginTop: RFValue(15),
  },
  subText: {
    fontSize: RFValue(14),
    color: '#E0E0E0',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 25,
    justifyContent: 'center',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
    marginHorizontal: 6,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.8,
    elevation: 5,
  },
  buttonContainer: {
    marginTop: 30,
  },
  // Floating Elements
  floatingElement: {
    zIndex: 5,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  educationIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  hexagon: {
    width: 40,
    height: 35,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(78, 205, 196, 0.4)',
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  innovationIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  star: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(150, 206, 180, 0.3)',
    transform: [{ rotate: '35deg' }],
  },
  diamond: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(254, 202, 87, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(254, 202, 87, 0.4)',
    borderRadius: 15,
    transform: [{ rotate: '45deg' }],
  },
  learningIcon: {
    backgroundColor: 'rgba(69, 183, 209, 0.2)',
    borderColor: 'rgba(69, 183, 209, 0.4)',
  },
  // Particles
  particle: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  // Bottom Waves
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  wave1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  wave2: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
});