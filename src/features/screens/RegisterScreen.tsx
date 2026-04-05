import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomText from '../../components/ui/CustomText';
import SuccessPopup from '../../components/ui/SuccessPopup';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate } from '../../utils/Navigation';
import { useAuth } from '@service/hooks/useAuth';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const { registerStudent, loading, error } = useAuth();

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const nameAnim = useRef(new Animated.Value(0)).current;
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const ageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startEntryAnimation();
  }, []);

  const startEntryAnimation = () => {
    // Header fades in
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // After header appears, animate fields
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
        Animated.spring(nameAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(phoneAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.spring(ageAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(buttonAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(600),
        Animated.spring(toggleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const validateRegisterFields = () => {
    if (!email || !password || !name || !phone) {
      Alert.alert('Error', 'Please fill all required fields for registration.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateRegisterFields()) {
      return;
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;
      
      const result = await registerStudent({
        email,
        password,
        name,
        phone: formattedPhone,
        age: parseInt(age, 10) || 0,
      });
      
      if (result?.accessToken || result?.message) {
        // Show success popup
        setShowSuccessPopup(true);
      } else {
        Alert.alert('Registration Failed', error || 'Please check your details and try again.');
      }
    } catch (registerError) {
      console.error('Registration error:', registerError);
      Alert.alert('Registration Error', error || 'An error occurred during registration.');
    }
  };

  const navigateToLogin = () => {
    navigate('LoginScreen');
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Pass email and password as params to prefill LoginScreen
    navigate('LoginScreen', {
      email: email,
      password: password,
    });
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Section */}
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
          JOIN US
        </CustomText>
        <CustomText
          variant="h1"
          size={RFValue(32)}
          fontFamily="Inter-Bold"
          style={styles.titleBold}
        >
          TODAY!
        </CustomText>
        <CustomText
          variant="h3"
          size={RFValue(14)}
          fontFamily="Inter-Regular"
          style={styles.subtitle}
        >
          Create account to get started
        </CustomText>
      </Animated.View>

      {/* Form Container - NOT ABSOLUTELY POSITIONED */}
      <View style={styles.formContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled={true}
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

            {/* Name Input */}
            <Animated.View style={getFieldAnimStyle(nameAnim)}>
              <View style={styles.inputWrapper}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Bold"
                  style={styles.label}
                >
                  FULL NAME
                </CustomText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
              </View>
            </Animated.View>

            {/* Phone Input */}
            <Animated.View style={getFieldAnimStyle(phoneAnim)}>
              <View style={styles.inputWrapper}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Bold"
                  style={styles.label}
                >
                  PHONE NUMBER
                </CustomText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </Animated.View>

            {/* Age Input */}
            <Animated.View style={getFieldAnimStyle(ageAnim)}>
              <View style={styles.inputWrapper}>
                <CustomText
                  variant="h3"
                  size={RFValue(12)}
                  fontFamily="Inter-Bold"
                  style={styles.label}
                >
                  AGE
                </CustomText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
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
                onPress={handleRegister}
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
                    Register
                  </CustomText>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Toggle Button */}
            <Animated.View style={getFieldAnimStyle(toggleAnim)}>
              <TouchableOpacity style={styles.toggleButton} onPress={navigateToLogin}>
                <CustomText
                  variant="h3"
                  size={RFValue(14)}
                  fontFamily="Inter-Regular"
                  style={styles.toggleText}
                >
                  Already have an account?{' '}
                  <CustomText
                    variant="h3"
                    size={RFValue(14)}
                    fontFamily="Inter-Bold"
                    style={styles.toggleTextBold}
                  >
                    Login
                  </CustomText>
                </CustomText>
              </TouchableOpacity>
            </Animated.View>
        </ScrollView>
      </View>

      {/* Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        title="Registration Successful!"
        message="You can now login with your credentials."
        buttonText="Go to Login"
      />
    </KeyboardAvoidingView>
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
  formContainer: {
    flex: 1,
    backgroundColor: '#CAC4FF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    flexGrow: 1,
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

export default RegisterScreen;

