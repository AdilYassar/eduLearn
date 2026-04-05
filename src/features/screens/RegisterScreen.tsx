import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import CustomText from '../../components/ui/CustomText';
import SuccessPopup from '../../components/ui/SuccessPopup';
import CustomAlertPopup from '../../components/ui/CustomAlertPopup';
import { RFValue } from 'react-native-responsive-fontsize';
import { navigate, replace } from '../../utils/Navigation';
import { useAuth } from '@service/hooks/useAuth';
import { registerDeviceToken, getFirebaseToken } from '@service/deviceTokenService';
import { verifyOtp } from '@service/otpAuthService';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // New States for Flow
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userUuid, setUserUuid] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Alert/Popup States
  const [alertPopupVisible, setAlertPopupVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: 'Alert',
    message: 'Message',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
  });

  const { registerStudent, loading, error } = useAuth();

  // Helper function to show alert popup
  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertPopupVisible(true);
  };

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
      showAlert('Error', 'Please fill all required fields for registration.', 'error');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateRegisterFields()) {
      return;
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : (phone.startsWith('0') ? `+92${phone.slice(1)}` : `+92${phone}`);
      
      const result = await registerStudent({
        email,
        password,
        name,
        phone: formattedPhone,
      });
      
      console.log('RegisterScreen: Registration result:', JSON.stringify(result, null, 2));

      // According to logs, UUID is directly inside result.data.uuid
      const uuid = result?.data?.uuid || result?.user?.uuid || result?.uuid;
      
      if (uuid) {
        console.log('RegisterScreen: Found UUID:', uuid);
        setUserUuid(uuid);
        
        // Step 3: Register Device Token
        try {
          console.log('RegisterScreen: Fetching FCM token...');
          const fcmToken = await getFirebaseToken();
          console.log('RegisterScreen: FCM Token retrieved:', fcmToken ? 'Exists' : 'NULL');
          if (fcmToken) {
            console.log('RegisterScreen: Registering device with token...');
            const deviceResult = await registerDeviceToken(fcmToken, uuid);
            console.log('RegisterScreen: Device registration result:', deviceResult);
            
            // Extract sessionId from device response
            const extractedSessionId = deviceResult?.data?.otp?.sessionId;
            if (extractedSessionId) {
              console.log('RegisterScreen: SessionId extracted:', extractedSessionId);
              setSessionId(extractedSessionId);
            }
          } else {
            console.warn('RegisterScreen: No FCM token found, skipping device registration');
          }
        } catch (deviceError) {
          console.error('RegisterScreen: Device registration failed:', deviceError);
        }

        // Switch to OTP entry UI (No new screen added as requested)
        console.log('RegisterScreen: Switching to OTP step');
        setIsOtpStep(true);
      } else {
        console.error('RegisterScreen: No UUID found in response');
        showAlert('Registration Failed', 'User ID not received from server.', 'error');
      }
    } catch (registerError) {
      console.error('Registration error:', registerError);
      showAlert('Registration Error', error || 'An error occurred during registration.', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showAlert('Error', 'Please enter a valid 6-digit OTP code.', 'error');
      return;
    }

    if (!sessionId) {
      showAlert('Error', 'Session ID not found. Please try registering again.', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      // Step 6: Verify OTP with correct sessionId
      console.log('RegisterScreen: Verifying OTP with sessionId:', sessionId);
      await verifyOtp(userUuid, sessionId, otpCode);
      setShowSuccessPopup(true);
    } catch (err: any) {
      showAlert('Verification Failed', err.message || 'OTP verification failed.', 'error');
    } finally {
      setVerifyingOtp(false);
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
          {isOtpStep ? 'VERIFY' : 'JOIN US'}
        </CustomText>
        <CustomText
          variant="h1"
          size={RFValue(32)}
          fontFamily="Inter-Bold"
          style={styles.titleBold}
        >
          {isOtpStep ? 'ACCOUNT' : 'TODAY!'}
        </CustomText>
        <CustomText
          variant="h3"
          size={RFValue(14)}
          fontFamily="Inter-Regular"
          style={styles.subtitle}
        >
          {isOtpStep ? 'Enter the OTP sent to your device' : 'Create account to get started'}
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
          {!isOtpStep ? (
            <>
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
                  <View style={styles.inputContainer}>
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
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPasswordField}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPasswordField(!showPasswordField)}
                    >
                      {showPasswordField ? (
                        <Eye size={20} color="#667EEA" strokeWidth={2} />
                      ) : (
                        <EyeOff size={20} color="#999" strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>
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
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor="#999"
                    />
                  </View>
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
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Age Input (Optional) */}
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
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your age"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                  </View>
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
            </>
          ) : (
            <>
              {/* OTP Input */}
              <Animated.View style={getFieldAnimStyle(emailAnim)}>
                <View style={styles.inputWrapper}>
                  <CustomText
                    variant="h3"
                    size={RFValue(12)}
                    fontFamily="Inter-Bold"
                    style={styles.label}
                  >
                    OTP CODE
                  </CustomText>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Primary Button for OTP */}
              <Animated.View style={getFieldAnimStyle(buttonAnim)}>
                <TouchableOpacity
                  style={[styles.primaryButton, verifyingOtp && styles.disabledButton]}
                  onPress={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? (
                    <ActivityIndicator color="#2C2C2C" />
                  ) : (
                    <CustomText
                      variant="h3"
                      size={RFValue(16)}
                      fontFamily="Inter-Bold"
                      style={styles.primaryButtonText}
                    >
                      Verify OTP
                    </CustomText>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Back to registration */}
              <Animated.View style={getFieldAnimStyle(toggleAnim)}>
                <TouchableOpacity style={styles.toggleButton} onPress={() => setIsOtpStep(false)}>
                  <CustomText
                    variant="h3"
                    size={RFValue(14)}
                    fontFamily="Inter-Bold"
                    style={styles.toggleTextBold}
                  >
                    Back to Register
                  </CustomText>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}

          {/* Toggle Button for Login (Common) */}
          {!isOtpStep && (
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
          )}
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

      {/* Custom Alert Popup */}
      <CustomAlertPopup
        visible={alertPopupVisible}
        onClose={() => setAlertPopupVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordToggle: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: RFValue(14),
    color: '#2C2C2C',
    fontFamily: 'Inter-Regular',
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

