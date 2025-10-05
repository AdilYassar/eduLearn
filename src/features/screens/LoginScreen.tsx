/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../../utils/Navigation';
import { useAuth } from '@service/hooks/useAuth';
import { Colors } from '@utils/Constants';
import { BASE_URL } from '@service/config';
import { saveAuthData } from '@service/authUtils';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');

  const { loginStudent, registerStudent, loading, error } = useAuth();

  useEffect(() => {
    // Removed authentication check - now handled in SplashScreen
  }, []);

  const validateLoginFields = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return false;
    }
    return true;
  };

  const validateRegisterFields = () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill all fields for registration.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateLoginFields()) {
      return;
    }

    try {
      console.log('LoginScreen: Attempting login...');
      const result = await loginStudent({ email, password });
      
      if (result?.accessToken) {
        console.log('LoginScreen: Login successful, saving auth data...');
        
        // Save authentication data using utility
        await saveAuthData({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          student: result.student,
        });
        
        console.log('LoginScreen: Auth data saved, navigating to dashboard');
        navigate('DashboardScreen');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (loginError) {
      console.error('LoginScreen: Login error:', loginError);
      Alert.alert('Login Error', error || 'An error occurred during login.');
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterFields()) {
      return;
    }

    try {
      // Format phone number with country code if not present
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
      
      const result = await registerStudent({
        email,
        password,
        name,
        phone: formattedPhone,
        age: parseInt(age, 10),
      });
      
      if (result?.accessToken || result?.message) {
        Alert.alert('Success', 'Registration successful! You can now login.');
        setIsLogin(true); // Switch to login mode
        // Clear registration fields
        setName('');
        setPhone('');
        setAge('');
      } else {
        Alert.alert('Registration Failed', error || 'Please check your details and try again.');
      }
    } catch (registerError) {
      console.error('Registration error:', registerError);
      Alert.alert('Registration Error', error || 'An error occurred during registration.');
    }
  };

  const clearFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearFields();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isLogin ? 'Login to Your Account' : 'Create New Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Welcome back!' : 'Join us today!'}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? 'Login' : 'Register'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={toggleMode}
        >
          <Text style={styles.secondaryButtonText}>
            {isLogin
              ? 'Don\'t have an account? Register'
              : 'Already have an account? Login'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.teal_200,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007BFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;
