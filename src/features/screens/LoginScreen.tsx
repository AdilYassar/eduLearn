import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import CustomText from '../../components/ui/CustomText';
import CustomAlertPopup from '../../components/ui/CustomAlertPopup';
import SuccessPopup from '../../components/ui/SuccessPopup';
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
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpTimeRemaining, setOtpTimeRemaining] = useState(300);
  
  // Alert/Popup States
  const [alertPopupVisible, setAlertPopupVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: 'Alert',
    message: 'Message',
    type: 'info' as 'error' | 'success' | 'warning' | 'info',
  });
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: 'Success!',
    message: 'Operation completed successfully.',
  });

  const { loginStudent, loading, error, forgotPasswordRequest, verifyResetOTP, resetPassword } = useAuth();

  // Helper function to show alert popup
  const showAlert = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertPopupVisible(true);
  };

  // Helper function to show success popup
  const showSuccess = (title: string, message: string) => {
    setSuccessConfig({ title, message });
    setSuccessPopupVisible(true);
  };

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const containerSlideUp = useRef(new Animated.Value(height)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startEntryAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (routeParams?.email) {
      setEmail(routeParams.email);
    }
    if (routeParams?.password) {
      setPassword(routeParams.password);
    }
  }, [routeParams]);

  // OTP Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showForgotPasswordModal && forgotStep === 'otp' && otpTimeRemaining > 0) {
      timer = setInterval(() => {
        setOtpTimeRemaining(prev => {
          if (prev <= 1) {
            showAlert('OTP Expired', 'Please request a new reset code', 'warning');
            handleCloseForgotPassword();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showForgotPasswordModal, forgotStep, otpTimeRemaining]);

  const startEntryAnimation = () => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerSlideUp, {
        toValue: 0,
        duration: 700,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
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
      showAlert('Error', 'Please enter email and password.', 'error');
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
        showAlert('Login Failed', 'Invalid credentials. Please try again.', 'error');
      }
    } catch (loginError) {
      console.error('LoginScreen: Login error:', loginError);
      showAlert('Login Error', error || 'An error occurred during login.', 'error');
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!forgotEmail) {
      showAlert('Error', 'Please enter your email address', 'error');
      return;
    }

    try {
      const result = await forgotPasswordRequest({ email: forgotEmail, role: 'Student' });
      if (result?.success) {
        setForgotStep('otp');
        setOtpTimeRemaining(300);
        showAlert('Success', 'Check your device for the password reset OTP code', 'success');
      } else {
        showAlert('Error', result?.message || 'Failed to send reset code', 'error');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to send reset code', 'error');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      showAlert('Error', 'Please enter a valid 6-digit OTP', 'error');
      return;
    }

    try {
      const result = await verifyResetOTP({ email: forgotEmail, otpCode: otp, role: 'Student' });
      if (result?.success) {
        setForgotStep('reset');
      } else {
        showAlert('Error', result?.message || 'Invalid or expired OTP', 'error');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to verify OTP', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert('Error', 'Please enter both password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const result = await resetPassword({
        email: forgotEmail,
        resetToken: otp,
        newPassword,
        newPasswordConfirm: confirmPassword,
        verifyMethod: 'otp',
        role: 'Student',
      });

      if (result?.success) {
        showSuccess('Success', 'Password reset successful! Please login with your new password.');
        setTimeout(() => {
          handleCloseForgotPassword();
          // Pre-fill email for convenience
          setEmail(forgotEmail);
          setPassword('');
        }, 1500);
      } else {
        showAlert('Error', result?.message || 'Failed to reset password', 'error');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to reset password', 'error');
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPasswordModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpTimeRemaining(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <View style={styles.passwordHeader}>
                  <CustomText
                    variant="h3"
                    size={RFValue(12)}
                    fontFamily="Inter-Bold"
                    style={styles.label}
                  >
                    PASSWORD
                  </CustomText>
                  <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                    <CustomText
                      variant="h3"
                      size={RFValue(11)}
                      fontFamily="Inter-SemiBold"
                      style={styles.forgotPasswordLink}
                    >
                      Forgot?
                    </CustomText>
                  </TouchableOpacity>
                </View>
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

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CustomText
                variant="h2"
                size={RFValue(18)}
                fontFamily="Inter-Bold"
                style={styles.modalTitle}
              >
                Reset Password
              </CustomText>
              <TouchableOpacity onPress={handleCloseForgotPassword}>
                <CustomText
                  variant="h3"
                  size={RFValue(24)}
                  fontFamily="Inter-Bold"
                  style={styles.closeButton}
                >
                  ✕
                </CustomText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {forgotStep === 'email' && (
                <View>
                  <CustomText
                    variant="h3"
                    size={RFValue(13)}
                    fontFamily="Inter-Regular"
                    style={styles.stepDescription}
                  >
                    Enter your registered email address. We'll send you a reset code.
                  </CustomText>
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
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleForgotPasswordRequest}
                  >
                    <CustomText
                      variant="h3"
                      size={RFValue(14)}
                      fontFamily="Inter-Bold"
                      style={styles.actionButtonText}
                    >
                      Send Reset Code
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}

              {forgotStep === 'otp' && (
                <View>
                  <CustomText
                    variant="h3"
                    size={RFValue(13)}
                    fontFamily="Inter-Regular"
                    style={styles.stepDescription}
                  >
                    Enter the 6-digit code sent to your device.
                  </CustomText>
                  <View style={styles.inputWrapper}>
                    <CustomText
                      variant="h3"
                      size={RFValue(12)}
                      fontFamily="Inter-Bold"
                      style={styles.label}
                    >
                      VERIFICATION CODE
                    </CustomText>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                  <CustomText
                    variant="h3"
                    size={RFValue(11)}
                    fontFamily="Inter-Regular"
                    style={styles.timerText}
                  >
                    Time remaining: {formatTime(otpTimeRemaining)}
                  </CustomText>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleVerifyOTP}
                  >
                    <CustomText
                      variant="h3"
                      size={RFValue(14)}
                      fontFamily="Inter-Bold"
                      style={styles.actionButtonText}
                    >
                      Verify Code
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}

              {forgotStep === 'reset' && (
                <View>
                  <CustomText
                    variant="h3"
                    size={RFValue(13)}
                    fontFamily="Inter-Regular"
                    style={styles.stepDescription}
                  >
                    Create a new password for your account.
                  </CustomText>
                  <View style={styles.inputWrapper}>
                    <CustomText
                      variant="h3"
                      size={RFValue(12)}
                      fontFamily="Inter-Bold"
                      style={styles.label}
                    >
                      NEW PASSWORD
                    </CustomText>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <Eye size={20} color="#667EEA" strokeWidth={2} />
                        ) : (
                          <EyeOff size={20} color="#999" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.inputWrapper}>
                    <CustomText
                      variant="h3"
                      size={RFValue(12)}
                      fontFamily="Inter-Bold"
                      style={styles.label}
                    >
                      CONFIRM PASSWORD
                    </CustomText>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <Eye size={20} color="#667EEA" strokeWidth={2} />
                        ) : (
                          <EyeOff size={20} color="#999" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleResetPassword}
                  >
                    <CustomText
                      variant="h3"
                      size={RFValue(14)}
                      fontFamily="Inter-Bold"
                      style={styles.actionButtonText}
                    >
                      Reset Password
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Popup */}
      <CustomAlertPopup
        visible={alertPopupVisible}
        onClose={() => setAlertPopupVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      {/* Success Popup */}
      <SuccessPopup
        visible={successPopupVisible}
        onClose={() => setSuccessPopupVisible(false)}
        title={successConfig.title}
        message={successConfig.message}
      />
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#2C2C2C',
    fontWeight: '700',
    letterSpacing: 1,
  },
  forgotPasswordLink: {
    color: '#667EEA',
    fontWeight: '600',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 30,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    color: '#2C2C2C',
    fontWeight: '700',
  },
  closeButton: {
    color: '#999999',
    fontWeight: '700',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepDescription: {
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  timerText: {
    color: '#F44336',
    marginBottom: 20,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#667EEA',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default LoginScreen;