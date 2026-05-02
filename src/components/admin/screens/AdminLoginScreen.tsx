import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { adminLogin } from '../../../redux/reducers/adminSlice';
import { AppDispatch } from '../../../redux/store';
import AdminInput from '../ui/AdminInput';
import AdminButton from '../ui/AdminButton';
import { Lock, Mail } from 'lucide-react-native';

interface Props {
  navigation: any;
}

const AdminLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const isMountedRef = useRef(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await dispatch(adminLogin({ email, password }));
      if (adminLogin.fulfilled.match(result)) {
        navigation.replace('AdminDashboard');
      } else {
        if (isMountedRef.current) {
          Alert.alert('Login Failed', result.payload as string);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        Alert.alert('Error', 'An error occurred during login');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    backgroundCircles: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: -1,
    },
    circle: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor: 'rgba(93, 75, 163, 0.05)',
      top: -150,
      right: -150,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      marginBottom: 48,
      alignItems: 'center',
    },
    logoContainer: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#312f36' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#2D2560',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 4,
      overflow: 'hidden',
    },
    logoImage: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 12,
      letterSpacing: -1,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
      textAlign: 'center',
    },
    form: {
      marginBottom: 32,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
    },
    footerText: {
      color: theme.dark ? '#cac4d3' : '#797582',
      marginRight: 6,
      fontSize: 14,
      fontWeight: '500',
    },
    linkText: {
      color: '#5D4BA3',
      fontWeight: '700',
      fontSize: 14,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundCircles}>
        <View style={styles.circle} />
        <View style={[styles.circle, { width: 500, height: 500, borderRadius: 250, bottom: -200, left: -200, backgroundColor: 'rgba(168, 164, 232, 0.06)' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icons/appIcon.png')}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.title}>EduLearn Admin</Text>
          <Text style={styles.subtitle}>Secure access for educational management</Text>
        </View>

        <View style={styles.form}>
          <AdminInput
            label="Administrative Email"
            placeholder="admin@edulearn.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color="#5D4BA3" />}
            error={errors.email}
          />

          <AdminInput
            label="Secret Key"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={20} color="#5D4BA3" />}
            error={errors.password}
          />
        </View>

        <AdminButton
          title={loading ? 'Authenticating...' : 'Enter Workspace'}
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          size="large"
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Encountering issues?</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Get Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;

