/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Lottie from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, replace } from '../../utils/Navigation';
import { Colors } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { Easing } from 'react-native-reanimated';
import CustomButton from '../../components/ui/CustomButton';

const Details = () => {
  const containerFadeAnim = React.useRef(new Animated.Value(0)).current;
  const containerSlideAnim = React.useRef(new Animated.Value(100)).current;
  const buttonFadeAnim = React.useRef(new Animated.Value(0)).current;

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

    // Fade in the buttons
    Animated.timing(buttonFadeAnim, {
      toValue: 1,
      duration: 1500,
      delay: 1000,
      useNativeDriver: true,
    }).start();
  }, [containerFadeAnim, containerSlideAnim, buttonFadeAnim]);

  return (
    <Animated.View
      style={[styles.container, { opacity: containerFadeAnim, transform: [{ translateY: containerSlideAnim }] }]}
    >
      <Lottie
        source={require('../../assets/animations/student.json')} // Replace with your animation path
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={styles.title}>Welcome! Who are you?</Text>

      <Animated.View style={[styles.buttonContainer, { opacity: buttonFadeAnim }]}>
        <CustomButton
          title="Student"
          onPress={() => replace('LoginScreen')}
          styles={styles.studentButton}
        />
        <CustomButton
          title="Admin"
          onPress={() => replace('AdminLoginScreen')}
          styles={styles.adminButton}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  animation: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: RFValue(20),
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    textAlign: 'center',
    marginBottom: RFValue(20),
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
  },
  studentButton: {
    backgroundColor: Colors.teal_300,
  },
  adminButton: {
    backgroundColor: Colors.secondary_dark,
  },
});
