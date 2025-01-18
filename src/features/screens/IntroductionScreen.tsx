/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Lottie from 'lottie-react-native';
import CustomText from '../../components/ui/CustomText';
import { Colors, Fonts } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';
import { Easing } from 'react-native-reanimated';
import CustomButton from '../../components/ui/CustomButton';

const IntroductionScreen = () => {
  const containerFadeAnim = React.useRef(new Animated.Value(0)).current;
  const containerSlideAnim = React.useRef(new Animated.Value(100)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate the container sliding up and fading in
    Animated.timing(containerFadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.timing(containerSlideAnim, {
      toValue: 0,
      duration: 2000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Trigger animations for text within the container
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      delay: 500,
      useNativeDriver: true,
    }).start();

  

    
  }, [containerFadeAnim, containerSlideAnim, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[styles.container, { opacity: containerFadeAnim, transform: [{ translateY: containerSlideAnim }] }]}
    >
      <Lottie
        source={require('../../assets/animations/aboutus.json')} // Replace with your animation path
        autoPlay
        loop
        style={styles.animation}
      />
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <CustomText variant="h4" size={RFValue(18)} style={styles.text}>
          Ready to Learn Something New Today?
        </CustomText>
        <Text style={styles.subText}>
          Empowering Education Through Innovation
        </Text>
        <View style={{ marginTop: 20 }}>
          <CustomButton  
            title="Get Started"
            onPress={() => navigate('Details')} 
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default IntroductionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  animation: {
    width: 400,
    height: 400,
    alignSelf: 'center',
    marginBottom: RFValue(20),
  },
  textContainer: {
    alignItems: 'center',
    marginTop: RFValue(20),
    paddingHorizontal: RFValue(20),
  },
  text: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: 'black', // Assuming white text contrasts well
    textAlign: 'center',
  },
  subText: {
    fontSize: RFValue(14),
    marginTop: RFValue(10),
    color:'black', // Assuming a secondary color for emphasis
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
