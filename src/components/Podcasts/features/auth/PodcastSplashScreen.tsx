/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Correct import for Icon
import CustomText from '@components/ui/CustomText';

import { resetAndNavigate } from '@utils/Navigation';
import { asyncStorage } from '@components/Podcasts/state/storage';

const PodcastSplashScreen = () => {
  // Animated values for the icon and text
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation for both scale and rotation
    const ringAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    // Start the animation when the component mounts
    ringAnimation.start();

    // Cleanup animation on component unmount
    return () => ringAnimation.stop();
  }, [scale, rotate]);




  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const token = await asyncStorage.getItem('token');
        if (token) {
          resetAndNavigate('UserBottomTab');
        } else {
          resetAndNavigate('PodcastLoginScreen');
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    }, 1000);
  
    // Clear timeout if the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated text with scaling */}
      <Animated.View style={{ transform: [{ scale }, { rotate: rotate.interpolate({
          inputRange: [0, 10],
          outputRange: ['0deg', '10deg'],
        }) }] }}>
        <CustomText style={styles.title} fontFamily={''}>Podcasts</CustomText>
      </Animated.View>

      {/* Animated icon with scaling */}
      <Animated.View style={{ transform: [{ scale }, { rotate: rotate.interpolate({
          inputRange: [0, 10],
          outputRange: ['0deg', '10deg'],
        }) }] }}>
        <Icon name="mic" size={50} color="black" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'teal', // You can change the background color here
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'black',
    letterSpacing: 2,
    marginBottom: 20,
  },
});

export default PodcastSplashScreen;
