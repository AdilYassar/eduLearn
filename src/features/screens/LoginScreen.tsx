import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';
import { useAuth } from '@service/hooks/useAuth';
import { saveAuthData } from '@service/authUtils';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const route = useRoute();
  const routeParams = route.params as { email?: string; password?: string } | undefined;
  
  const [email, setEmail] = useState(routeParams?.email || '');
  const [password, setPassword] = useState(routeParams?.password || '');

  const { loginStudent, loading, error } = useAuth();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const containerSlideUp = useRef(new Animated.Value(height)).current; // Start completely below screen
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startEntryAnimation();
  }, []);

  // Update fields when route params change (e.g., when navigating from RegisterScreen)
  useEffect(() => {
    if (routeParams?.email) {
      setEmail(routeParams.email);
    }
    if (routeParams?.password) {
      setPassword(routeParams.password);
    }
  }, [routeParams]);

  const startEntryAnimation = () => {
    Animated.sequence([
      // Header fades in
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Container slides up from bottom (FULL WIDTH)
      Animated.timing(containerSlideUp, {
        toValue: 0,
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After container settles, animate fields
      animateFields();
    });
  };

  const animateFields = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(0),
        Animated.spring(emailAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(passwordAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(buttonAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(toggleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const validateLoginFields = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
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
        
        await saveAuthData({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          student: result.student,
        });
        
        console.log('LoginScreen: Auth data saved, replacing with dashboard');
        replace('DashboardScreen');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      }
    } catch (loginError) {
      console.error('LoginScreen: Login error:', loginError);
      Alert.alert('Login Error', error || 'An error occurred during login.');
    }
  };

  const navigateToRegister = () => {
    navigate('RegisterScreen');
  };

  const getFieldAnimStyle = (animValue) => ({
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
          outputRange: [0.95, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Section - Fixed at top */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <CustomText
          variant="h1"
          size={RFValue(28)}
          fontFamily="Inter-Bold"
          style={styles.title}
        >
          WELCOME
        </CustomText>
        <CustomText
          variant="h1"
          size={RFValue(32)}
          fontFamily="Inter-Bold"
          style={styles.titleBold}
        >
          BACK!
        </CustomText>
        <CustomText
          variant="h3"
          size={RFValue(14)}
          fontFamily="Inter-Regular"
          style={styles.subtitle}
        >
          Login to continue your journey
        </CustomText>
      </Animated.View>

      {/* Bottom Sheet Container - FULL WIDTH */}
      <Animated.View
        style={[
          styles.bottomSheetContainer,
          {
            transform: [{ translateY: containerSlideUp }],
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Email Input */}
            <Animated.View style={getFieldAnimStyle(emailAnim)}>
              <View style={styles.inputWrapper}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Bold"
                  style={styles.label}
                >
                  EMAIL
                </CustomText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View style={getFieldAnimStyle(passwordAnim)}>
              <View style={styles.inputWrapper}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Bold"
                  style={styles.label}
                >
                  PASSWORD
                </CustomText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
            </Animated.View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Regular"
                  style={styles.errorText}
                >
                  {error}
                </CustomText>
              </View>
            )}

            {/* Primary Button */}
            <Animated.View style={getFieldAnimStyle(buttonAnim)}>
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#2C2C2C" />
                ) : (
                  <CustomText
                    variant="h3"
                    size={RFValue(16)}
                    fontFamily="Inter-Bold"
                    style={styles.primaryButtonText}
                  >
                    Login
                  </CustomText>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Toggle Button */}
            <Animated.View style={getFieldAnimStyle(toggleAnim)}>
              <TouchableOpacity style={styles.toggleButton} onPress={navigateToRegister}>
                <CustomText
                  variant="h3"
                  size={RFValue(14)}
                  fontFamily="Inter-Regular"
                  style={styles.toggleText}
                >
                  Don't have an account?{' '}
                  <CustomText
                    variant="h3"
                    size={RFValue(14)}
                    fontFamily="Inter-Bold"
                    style={styles.toggleTextBold}
                  >
                    Register
                  </CustomText>
                </CustomText>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: '#2C2C2C',
    fontWeight: '600',
    marginBottom: 5,
  },
  titleBold: {
    color: '#2C2C2C',
    fontWeight: '900',
    marginBottom: 15,
  },
  subtitle: {
    color: '#666666',
    fontWeight: '400',
    lineHeight: 20,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    backgroundColor: '#CAC4FF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    minHeight: height * 0.65,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 70,
    paddingBottom: 70,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: '#2C2C2C',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: RFValue(14),
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#2C2C2C',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleText: {
    color: '#2C2C2C',
    fontWeight: '400',
  },
  toggleTextBold: {
    color: '#2C2C2C',
    fontWeight: '800',
  },
});

export default LoginScreen;