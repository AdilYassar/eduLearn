/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Lottie from 'lottie-react-native';
import CustomText from '../../components/ui/CustomText';
import { Colors } from '../../utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate } from '../../utils/Navigation';

const SplashScreen = () => {


  useEffect(() => {
    // Set a timeout to navigate after 3 seconds
    const timer = setTimeout(() => {
     navigate('HomeScreen'); // Replace 'NextScreen' with your target screen name IntroductionScreen
    }, 3000);

    // Clear the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);



  return (
    <View style={styles.container}>
   
    <View>
  

    </View>
    
      <Lottie
        source={require('../../assets/animations/twoppl.json')} // Replace with your animation path
        autoPlay
        loop
        style={styles.animation}
      />

     
      <CustomText  variant="h1"  size={RFValue(20)} >
        Welcome to EduLearn
      </CustomText>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary
  },
  logo: {
    width: 150,
    height: 150,
  
  },
  animation: {
    width: 300,
    height: 300,
  },
  text: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d40', // Dark teal text
  },
});