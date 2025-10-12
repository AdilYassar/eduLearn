import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate } from '../../utils/Navigation';

const { width, height } = Dimensions.get('window');

const IntroductionScreen = () => {
  // Animation values
  const containerSlideUp = useRef(new Animated.Value(height * 0.4)).current; // Start below screen
  const heading1Anim = useRef(new Animated.Value(0)).current;
  const heading2Anim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Step 1: Slide up the purple container (0-600ms)
      Animated.timing(containerSlideUp, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-out
        useNativeDriver: true,
      }),
      
      // Step 2: Animate content sequentially
      Animated.parallel([
        // Heading 1 appears (600-900ms)
        Animated.sequence([
          Animated.delay(0),
          Animated.spring(heading1Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Heading 2 appears (750-1050ms)
        Animated.sequence([
          Animated.delay(150),
          Animated.spring(heading2Anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Subtitle appears (900-1200ms)
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(subtitleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        
        // Button appears (1050-1350ms)
        Animated.sequence([
          Animated.delay(450),
          Animated.spring(buttonAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [containerSlideUp, heading1Anim, heading2Anim, subtitleAnim, buttonAnim]);

  const handleGetStarted = () => {
    navigate('Details');
  };

  // Reusable animation style generator
  const getTextAnimStyle = (animValue) => ({
    opacity: animValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Upper Section - Image with Checkered Background */}
      <View style={styles.upperSection}>
        <View style={styles.checkeredBackground} />
        <Image
          source={require('../../assets/getStarted/getstarted.jpg')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Lower Section - Animated Content */}
      <Animated.View 
        style={[
          styles.lowerSection,
          {
            transform: [{ translateY: containerSlideUp }],
          },
        ]}
      >
        {/* Heading 1 */}
        <View style={styles.textContainer}>
          <Animated.View style={getTextAnimStyle(heading1Anim)}>
            <CustomText
              variant="h1"
              size={RFValue(28)}
              fontFamily="Inter-Bold"
              style={styles.heading1}
            >
              EXPLORE YOUR
            </CustomText>
          </Animated.View>

          {/* Heading 2 */}
          <Animated.View style={getTextAnimStyle(heading2Anim)}>
            <CustomText
              variant="h1"
              size={RFValue(28)}
              fontFamily="Inter-Bold"
              style={styles.heading2}
            >
              CREATIVITY
            </CustomText>
          </Animated.View>
          
          {/* Subtitle */}
          <Animated.View style={getTextAnimStyle(subtitleAnim)}>
            <CustomText
              variant="h3"
              size={RFValue(16)}
              fontFamily="Inter-Regular"
              style={styles.subtitle}
            >
              Study smarter with fun interactive tools all in one place
            </CustomText>
          </Animated.View>
        </View>
        
        {/* Get Started Button */}
        <Animated.View style={getTextAnimStyle(buttonAnim)}>
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <CustomText
              variant="h3"
              size={RFValue(16)}
              fontFamily="Inter-Bold"
              style={styles.buttonText}
            >
              Get Started
            </CustomText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default IntroductionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  upperSection: {
    flex: 0.6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkeredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F7FF',
    opacity: 0.3,
  },
  illustration: {
    width: width * 0.9,
    height: height * 0.4,
    zIndex: 1,
  },
  lowerSection: {
    flex: 0.4,
    backgroundColor: '#CAC4FF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
    marginTop: -30,
  },
  textContainer: {
    marginBottom: 30,
  },
  heading1: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 5,
    fontSize: RFValue(24),
  },
  heading2: {
    color: '#000000',
    fontWeight: '900',
    textAlign: 'left',
    marginBottom: 20,
    fontSize: RFValue(32),
  },
  subtitle: {
    color: '#666666',
    textAlign: 'left',
    lineHeight: 20,
    fontSize: RFValue(14),
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    minWidth: width * 0.75,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: RFValue(16),
  },
});