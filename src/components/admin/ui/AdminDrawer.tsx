import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useAppTheme } from '../../../context/ThemeContext';
import {
  Users,
  Book,
  HelpCircle,
  Video,
  Zap,
  Settings,
  ChevronRight,
  X,
  Building,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
  activeScreen?: string;
}

const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  navigation,
  activeScreen,
}) => {
  const { theme } = useAppTheme();
  const isDark = theme.dark;

  const translateX = useSharedValue(-DRAWER_WIDTH);

  useEffect(() => {
    // Instant state-based position for opening/closing
    if (isOpen) {
      translateX.value = 0;
    } else {
      translateX.value = -DRAWER_WIDTH;
    }
  }, [isOpen]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building, color: '#5D4BA3', screen: 'AdminDashboard', description: 'Main overview & metrics' },
    { id: 'students', label: 'Student Management', icon: Users, color: '#5D4BA3', screen: 'AdminStudentManagement', description: 'Manage enrollments and profiles' },
    { id: 'courses', label: 'Course Management', icon: Book, color: '#5D4BA3', screen: 'AdminCourseManagement', description: 'Create and edit course content' },
    { id: 'quizzes', label: 'Quiz Management', icon: HelpCircle, color: '#5D4BA3', screen: 'AdminQuizManagement', description: 'Review and update assessments' },
    { id: 'videos', label: 'Video Library', icon: Video, color: '#5D4BA3', screen: 'AdminVideoLibrary', description: 'Manage media assets and library' },
    { id: 'books', label: 'Book Library', icon: Book, color: '#5D4BA3', screen: 'AdminBookLibrary', description: 'Upload and manage PDF resources' },
    { id: 'meetings', label: 'Streaming Live Lectures', icon: Video, color: '#1a73e8', screen: 'HomeScreen', description: 'Join or start a live session' },
    { id: 'feedback', label: 'Student Feedback', icon: Zap, color: '#5D4BA3', screen: 'AdminFeedback', description: 'View ratings and suggestions' },
    { id: 'support', label: 'Support Tickets', icon: HelpCircle, color: '#5D4BA3', screen: 'AdminSupportTickets', description: 'Manage student inquiries' },
    { id: 'performance', label: 'Performance Tracking', icon: Zap, color: '#5D4BA3', screen: 'AdminPerformance', description: 'Analyze student metrics' },
    { id: 'settings', label: 'Admin Settings', icon: Settings, color: '#5D4BA3', screen: 'AdminSettings', description: 'Configure portal preferences' },
  ];

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isOpen) {
        translateX.value = Math.min(0, event.translationX);
      }
    })
    .onEnd((event) => {
      if (isOpen) {
        if (event.translationX < -DRAWER_WIDTH * 0.25 || event.velocityX < -500) {
          runOnJS(onClose)();
        } else {
          translateX.value = withSpring(0);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: isOpen ? 1 : 0,
    display: isOpen || translateX.value > -DRAWER_WIDTH ? 'flex' : 'none',
  }));

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 1000,
    },
    drawerContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: DRAWER_WIDTH,
      backgroundColor: isDark ? '#1c1b21' : '#ffffff',
      zIndex: 1001,
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 5, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 20,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 24,
      backgroundColor: isDark ? '#25232a' : '#F8F6FD',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logoImage: {
      width: 42,
      height: 42,
      borderRadius: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#fdf7ff' : '#2D2560',
    },
    subtitle: {
      fontSize: 11,
      color: isDark ? '#cac4d3' : '#797582',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      marginBottom: 8,
    },
    activeMenuItem: {
      backgroundColor: isDark ? 'rgba(93, 75, 163, 0.2)' : 'rgba(93, 75, 163, 0.08)',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#312f36' : '#F0EEFA',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuTextWrap: {
      flex: 1,
    },
    menuLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#fdf7ff' : '#2D2560',
    },
    menuDesc: {
      fontSize: 10,
      color: isDark ? '#cac4d3' : '#797582',
      marginTop: 2,
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0EEFA',
    },
    version: {
      fontSize: 10,
      color: '#A09CAB',
      textAlign: 'center',
      fontWeight: '600',
    },
  });

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawerContainer, animatedStyle]}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/icons/appIcon.png')}
                style={styles.logoImage}
              />
              <View>
                <Text style={styles.title}>EduLearn</Text>
                <Text style={styles.subtitle}>Admin Portal</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color={isDark ? '#79747E' : '#797582'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => {
                    onClose();
                    const params = item.screen === 'HomeScreen' ? { fromAdmin: true } : {};
                    setTimeout(() => navigation.navigate(item.screen, params), 100);
                  }}
                >
                  <View style={[styles.iconWrap, isActive && { backgroundColor: '#5D4BA3' }]}>
                    <item.icon size={18} color={isActive ? '#fff' : '#5D4BA3'} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={[styles.menuLabel, isActive && { color: '#5D4BA3' }]}>{item.label}</Text>
                    <Text style={styles.menuDesc}>{item.description}</Text>
                  </View>
                  <ChevronRight size={14} color={isDark ? '#484551' : '#cac4d3'} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.version}>v1.2.4-PRO • Powered by Antigravity</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

export default AdminDrawer;
