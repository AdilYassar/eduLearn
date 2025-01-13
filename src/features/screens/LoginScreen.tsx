/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardTypeOptions,
} from 'react-native';
import Lottie from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { navigate } from '../../utils/Navigation';
import { runOnJS } from 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import CustomInput from '@components/ui/CustomInput';

const LoginScreen = () => {
  const [step, setStep] = useState(0); // Track the current input field
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');

  const translation = useSharedValue(0); // Shared value for animation

  const storeUserData = async (userData: { phone: string; email: string; name: string; age: string; accessToken: any; }) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Failed to store user data: ', error);
    }
  };

  const handleLogin = () => {
    const endpoint = '/api/student/login';
    const payload = { phone, email, name, age, password };

    fetch(`https://3506-101-53-234-27.ngrok-free.app/api/student/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          console.log('Student logged in successfully!', data);
          storeUserData({ phone, email, name, age, accessToken: data.accessToken });
          navigate('DashboardScreen');
        } else {
          console.error('Login failed:', data);
          Alert.alert(data.error?.message || 'Login failed. Please check your inputs.');
        }
      })
      .catch((error) => console.error('Error logging in:', error));
  };

  const handleNext = () => {
    if (step < inputFields.length - 1) {
      translation.value = withTiming(-100, { duration: 500 }, () => {
        runOnJS(setStep)(step + 1); // Use `runOnJS` to update the state after animation
        translation.value = 0; // Reset translation
      });
    } else if (step === inputFields.length - 1) {
      // Explicitly set step to inputFields.length to show the login button
      runOnJS(setStep)(inputFields.length);
    }
  };
  

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translation.value }],
  }));

  const inputFields = [
    {
      placeholder: 'Enter your phone number',
      value: phone,
      onChangeText: setPhone,
      keyboardType: 'phone-pad',
    },
    {
      placeholder: 'Enter your email',
      value: email,
      onChangeText: setEmail,
      keyboardType: 'email-address',
    },
    {
      placeholder: 'Enter your name',
      value: name,
      onChangeText: setName,
    },
    {
      placeholder: 'Enter your age',
      value: age,
      onChangeText: setAge,
      keyboardType: 'numeric',
    },
    {
      placeholder: 'Enter your password',
      value: password,
      onChangeText: setPassword,
      secureTextEntry: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Lottie
        source={require('../../assets/animations/signup.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Login to Your Account</Text>

      {step < inputFields.length && (
        <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <CustomInput
            style={styles.input}
            placeholder={inputFields[step].placeholder}
            placeholderTextColor="#000"
            keyboardType={inputFields[step].keyboardType as KeyboardTypeOptions || 'default'}
            secureTextEntry={inputFields[step].secureTextEntry || false}
            value={inputFields[step].value}
            onChangeText={inputFields[step].onChangeText}
            left={<View />} // Provide an empty View as the left component
          />
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {step === inputFields.length && (
        <TouchableOpacity
          style={[styles.button, styles.studentButton]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login as Student</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.teal_200,
    paddingHorizontal: 20,
  },
  animation: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: '#6c757d',
  },
  studentButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  animatedContainer: {
    width: '100%',
    marginBottom: 15,
  },
});
