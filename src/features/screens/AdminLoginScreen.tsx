import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import Lottie from 'lottie-react-native';
import { navigate } from '../../utils/Navigation';
import { BASE_URL } from '@service/config';

const AdminLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const handleLogin = () => {
    const endpoint = '/api/admin/login';
    const payload = { email, password }; // Only required fields for login

    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.accessToken) {
          console.log('Admin logged in successfully!', data);
          navigate('MarkSummaryScreen');
        } else {
          const errorMessage = data.error?.message || 'Login failed. Please check your credentials.';
          console.error('Login failed:', errorMessage);
          Alert.alert(errorMessage);
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        Alert.alert('An error occurred during login. Please try again.');
      });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Lottie
        source={require('../../assets/animations/signup.json')} // Ensure the correct file path
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Login to Admin Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#000"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#000"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login as Admin</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  adminButton: {
    backgroundColor: '#28A745', // Green color for Admin button
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
