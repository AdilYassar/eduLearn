import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../context/ThemeContext';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import AdminButton from '../ui/AdminButton';
import { useDispatch } from 'react-redux';
import { clearAdmin } from '../../../redux/reducers/adminSlice';
import { AppDispatch } from '../../../redux/store';
import {
  Lock,
  Bell,
  Shield,
  Info,
  ChevronRight,
} from 'lucide-react-native';

interface Props {
  navigation: any;
}

const AdminSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, toggleTheme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [notifications, setNotifications] = useState(true);
  const [secureMode, setSecureMode] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout Session', 'Are you sure you want to end your administrative session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Terminate',
        style: 'destructive',
        onPress: () => {
          dispatch(clearAdmin());
          navigation.replace('AdminLoginScreen');
        },
      },
    ]);
  };

  const settingsItems = [
    {
      id: 'notifications',
      icon: Bell,
      label: 'Push Notifications',
      description: 'System alerts and updates',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'secure',
      icon: Shield,
      label: 'Secure Workspace',
      description: 'Enhanced encryption active',
      value: secureMode,
      onToggle: setSecureMode,
    },
    {
      id: 'password',
      icon: Lock,
      label: 'Security & Access',
      description: 'Update keys and passwords',
      onPress: () => {
        Alert.alert('Restricted', 'This module is restricted in the preview version.');
      },
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.dark ? '#cac4d3' : '#797582',
      marginBottom: 12,
      paddingHorizontal: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomColor: theme.dark ? '#312f36' : '#EDE5F8',
      borderBottomWidth: 1,
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: 12,
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
    },
    aboutCard: {
      padding: 16,
    },
    aboutTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#5D4BA3',
      marginBottom: 4,
    },
    aboutText: {
      fontSize: 13,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
      lineHeight: 18,
    },
    logoutButton: {
      marginTop: 8,
    },
  });

  const renderSettingItem = (item: any, index: number, total: number) => {
    const Icon = item.icon;
    const isLast = index === total - 1;

    return (
      <View 
        key={item.id} 
        style={[
          styles.settingItem, 
          isLast && { borderBottomWidth: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
          index === 0 && { borderTopLeftRadius: 20, borderTopRightRadius: 20 }
        ]}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Icon size={20} color="#5D4BA3" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingDescription}>{item.description}</Text>
          </View>
        </View>
        {item.onToggle ? (
          <Switch 
            value={item.value} 
            onValueChange={item.onToggle} 
            trackColor={{ false: '#EDE5F8', true: '#5D4BA3' }}
            thumbColor={item.value ? '#ffffff' : '#ffffff'}
          />
        ) : (
          <TouchableOpacity onPress={item.onPress} activeOpacity={0.7}>
            <ChevronRight size={20} color="#cac4d3" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Portal Settings"
        subtitle="Configure your workspace"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Preferences</Text>
          <View style={{ borderRadius: 20, overflow: 'hidden', borderColor: theme.dark ? '#484551' : '#EDE5F8', borderWidth: 1 }}>
            {settingsItems.map((item, index) => renderSettingItem(item, index, settingsItems.length))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workspace Information</Text>
          <AdminCard style={styles.aboutCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8F6FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                <Info size={20} color="#5D4BA3" />
              </View>
              <View>
                <Text style={styles.aboutTitle}>EduLearn Admin</Text>
                <Text style={styles.aboutText}>Enterprise Workspace v1.0.0</Text>
              </View>
            </View>
            <Text style={styles.aboutText}>
              Your workspace is currently operating under the Premium Periwinkle design language. Security protocols are fully active.
            </Text>
            <Text style={[styles.aboutText, { marginTop: 12, fontSize: 11, opacity: 0.7 }]}>
              © 2024 EduLearn. High-Fidelity Management Interface.
            </Text>
          </AdminCard>
        </View>

        <View style={styles.logoutButton}>
          <AdminButton
            title="Terminate Session"
            onPress={handleLogout}
            variant="danger"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminSettingsScreen;
