import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import Lottie from 'lottie-react-native';
import { navigate } from '../../utils/Navigation';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleLogin = () => {
    const endpoint = '/api/student/login';
    const payload = { phone, email, name, age, password };

    fetch(`https://0243-101-53-234-27.ngrok-free.app${endpoint}`, {
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
          navigate('CourseScreen');
        } else {
          console.error('Login failed:', data);
          Alert.alert(data.error?.message || 'Login failed. Please check your inputs.');
        }
      })
      .catch((error) => console.error('Error logging in:', error));
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Lottie
        source={require('../../assets/animations/signup.json')} // Replace with actual Lottie animation file
        autoPlay
        loop
        style={styles.animation}
      />

      <Text style={styles.title}>Login to Your Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        placeholderTextColor="#000"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
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
        placeholder="Enter your name"
        placeholderTextColor="#000"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        placeholderTextColor="#000"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
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
          style={[styles.button, styles.studentButton]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Login as Student</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default LoginScreen;

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
  studentButton: {
    backgroundColor: '#007BFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
