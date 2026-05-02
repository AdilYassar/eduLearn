import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { getDashboardStats, getDashboardActivities } from '../../../redux/reducers/adminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard, AdminStatGridCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminLoadingSkeleton } from '../ui/AdminEmpty';
import {
  Users,
  Book,
  HelpCircle,
  Video,
  Zap,
  Settings,
  ChevronRight,
  FileText,
  Layers,
  Library,
  GraduationCap,
  Activity,
  Menu,
  X,
  Building,
} from 'lucide-react-native';
import AdminDrawer from '../ui/AdminDrawer';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface Props {
  navigation: any;
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Swipe to open gesture from ANY position
  const swipeGesture = Gesture.Pan()
    .activeOffsetX(20) // Only start after moving 20px right
    .failOffsetY([-20, 20]) // Fail if there's significant vertical movement
    .onEnd((event) => {
      // If we swipe right significantly from anywhere on the screen
      if (event.translationX > 60 && Math.abs(event.velocityX) > 400) {
        runOnJS(setIsDrawerOpen)(true);
      }
    });

  const toggleDrawer = (open: boolean) => {
    setIsDrawerOpen(open);
  };

  const calculateMetrics = () => {
    if (!dashboardStats) return [];
    const students = dashboardStats.studentsCount || 0;
    const submissions = dashboardStats.submissionsCount || 0;
    const sessions = dashboardStats.sessionsCount || 0;
    const courses = dashboardStats.coursesCount || 0;
    const engagementRate = students > 0 ? Math.min(Math.round((submissions / students) * 100), 100) : 0;
    const completionRate = students > 0 ? Math.min(Math.round((sessions / students) * 100), 100) : 0;
    const resourceUtilization = Math.min(Math.round((courses / 50) * 100), 100);
    return [
      { label: 'Platform Engagement', value: engagementRate },
      { label: 'Learning Completion', value: completionRate },
      { label: 'Resource Utilization', value: resourceUtilization },
    ];
  };

  const { dashboardStats, activities, isLoading, error } = useSelector(
    (state: RootState) => state.admin
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getDashboardStats()),
        dispatch(getDashboardActivities()),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getDashboardActivities());
  }, [dispatch]);

  const healthMetrics = calculateMetrics();

  const menuItems = [
    { id: 'students', label: 'Student Management', icon: Users, color: '#5D4BA3', screen: 'AdminStudentManagement', description: 'Manage enrollments and profiles' },
    { id: 'courses', label: 'Course Management', icon: Book, color: '#5D4BA3', screen: 'AdminCourseManagement', description: 'Create and edit course content' },
    { id: 'quizzes', label: 'Quiz Management', icon: HelpCircle, color: '#5D4BA3', screen: 'AdminQuizManagement', description: 'Review and update assessments' },
    { id: 'videos', label: 'Video Library', icon: Video, color: '#5D4BA3', screen: 'AdminVideoLibrary', description: 'Manage media assets and library' },
    { id: 'books', label: 'Book Library', icon: Book, color: '#5D4BA3', screen: 'AdminBookLibrary', description: 'Upload and manage PDF resources' },
    { id: 'meetings', label: 'Google Meet', icon: Video, color: '#1a73e8', screen: 'HomeScreen', description: 'Join or start a live session' },
    { id: 'performance', label: 'Performance Tracking', icon: Zap, color: '#5D4BA3', screen: 'AdminPerformance', description: 'Analyze student metrics' },
    { id: 'settings', label: 'Admin Settings', icon: Settings, color: '#5D4BA3', screen: 'AdminSettings', description: 'Configure portal preferences' },
  ];

  const getActivityEmoji = (icon: string) => icon || '📌';

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD' },
    scrollContent: { paddingHorizontal: 20, paddingVertical: 12 },
    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      letterSpacing: -0.5,
    },
    statsGrid: { marginBottom: 8 },
    statsRowLarge: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    statsRowSmall: { flexDirection: 'row', justifyContent: 'space-between' },
    healthCard: { padding: 16, marginBottom: 0 },
    metricContainer: { width: '100%' },
    metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    metricLabel: { fontSize: 12, fontWeight: '600', color: theme.dark ? '#cac4d3' : '#797582' },
    metricValue: { fontSize: 12, fontWeight: '800', color: theme.dark ? '#fdf7ff' : '#2D2560' },
    progressBarBg: { height: 6, backgroundColor: theme.dark ? '#312f36' : '#F8F6FD', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#5D4BA3', borderRadius: 3 },
    // Compact Activity Row
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.06)',
    },
    activityIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.dark ? '#25232a' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    activityTextContainer: { flex: 1 },
    activityTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    activityDescription: {
      fontSize: 11,
      color: theme.dark ? '#cac4d3' : '#797582',
      marginTop: 1,
    },
    activityTime: { fontSize: 10, color: '#A09CAB', fontWeight: '500' },
    // Drawer
    drawerOverlay: { flex: 1 },
    drawerContainer: {
      position: 'absolute',
      top: 0, bottom: 0, left: 0,
      width: DRAWER_WIDTH,
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
      shadowColor: '#5D4BA3',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      overflow: 'hidden',
    },
    drawerHeader: {
      paddingHorizontal: 24,
      paddingTop: 64,
      paddingBottom: 24,
      backgroundColor: theme.dark ? '#25232a' : '#F8F6FD',
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    companyInfo: { flex: 1 },
    companyLogo: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: '#5D4BA3',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      shadowColor: '#5D4BA3',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    companyName: { fontSize: 18, fontWeight: '800', color: theme.dark ? '#fdf7ff' : '#2D2560', letterSpacing: -0.5 },
    companyTagline: { fontSize: 12, color: theme.dark ? '#cac4d3' : '#797582', marginTop: 3, fontWeight: '500' },
    drawerContent: { flex: 1, paddingTop: 12, paddingHorizontal: 12 },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 12,
      marginBottom: 2,
      borderRadius: 12,
    },
    drawerItemIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    drawerItemText: { fontSize: 14, fontWeight: '700', color: theme.dark ? '#fdf7ff' : '#2D2560', letterSpacing: 0.1 },
    drawerItemDesc: { fontSize: 11, color: theme.dark ? '#cac4d3' : '#797582', marginTop: 1 },
    drawerFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)',
    },
    versionText: { fontSize: 11, color: '#A09CAB', textAlign: 'center' },
    backgroundCircles: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: -1 },
    circle: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: theme.dark ? '#312f36' : 'rgba(93, 75, 163, 0.03)', top: -100, right: -100 },
  });

  return (
    <GestureDetector gesture={swipeGesture}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.backgroundCircles}>
          <View style={styles.circle} />
          <View style={[styles.circle, { width: 400, height: 400, borderRadius: 200, bottom: -150, left: -150, backgroundColor: 'rgba(168, 164, 232, 0.05)' }]} />
        </View>


      <AdminHeader
        title="EduLearn Admin"
        subtitle="Welcome back, Administrator"
        leftAction={
          <TouchableOpacity onPress={() => toggleDrawer(true)} style={{ padding: 4 }}>
            <Menu size={24} color={theme.dark ? '#fdf7ff' : '#2D2560'} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeScreen', { fromAdmin: true })}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: theme.dark ? 'rgba(26, 115, 232, 0.1)' : 'rgba(26, 115, 232, 0.08)',
              justifyContent: 'center', 
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(26, 115, 232, 0.2)'
            }}
          >
            <Video size={22} color="#1a73e8" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5D4BA3']}
            tintColor={theme.dark ? '#fdf7ff' : '#5D4BA3'}
          />
        }
      >
        {error && (
          <Text style={{ color: '#ba1a1a', marginBottom: 16, fontWeight: '600', textAlign: 'center' }}>{error}</Text>
        )}

        {isLoading ? (
          <AdminLoadingSkeleton count={6} />
        ) : dashboardStats ? (
          <>
            {/* Overview Metrics with pulse icon */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Overview Metrics</Text>
                <Activity size={20} color="#5D4BA3" />
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statsRowLarge}>
                  <AdminStatGridCard label="Students" value={dashboardStats.studentsCount || 0} icon={<GraduationCap size={20} color="#5D4BA3" />} />
                  <View style={{ width: 8 }} />
                  <AdminStatGridCard label="Courses" value={dashboardStats.coursesCount || 0} icon={<Book size={20} color="#5D4BA3" />} />
                  <View style={{ width: 8 }} />
                  <AdminStatGridCard label="Quizzes" value={dashboardStats.quizzesCount || 0} icon={<HelpCircle size={20} color="#5D4BA3" />} />
                </View>
                <View style={styles.statsRowSmall}>
                  <AdminStatGridCard compact label="Entries" value={dashboardStats.submissionsCount || 0} icon={<FileText size={16} color="#5D4BA3" />} />
                  <View style={{ width: 6 }} />
                  <AdminStatGridCard compact label="Items" value={dashboardStats.questionsCount || 0} icon={<Zap size={16} color="#5D4BA3" />} />
                  <View style={{ width: 6 }} />
                  <AdminStatGridCard compact label="Types" value={dashboardStats.categoriesCount || 0} icon={<Layers size={16} color="#5D4BA3" />} />
                  <View style={{ width: 6 }} />
                  <AdminStatGridCard compact label="Books" value={dashboardStats.booksCount || 0} icon={<Library size={16} color="#5D4BA3" />} />
                </View>
              </View>
            </View>

            {/* System Health */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>System Health</Text>
                <Activity size={20} color="#5D4BA3" />
              </View>
              <AdminCard style={styles.healthCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 }} />
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#4CAF50', textTransform: 'uppercase', letterSpacing: 0.5 }}>Connected & Running</Text>
                </View>
                {healthMetrics.length > 0 ? healthMetrics.map((metric, index) => (
                  <View key={index} style={[styles.metricContainer, index !== 0 && { marginTop: 16 }]}>
                    <View style={styles.metricLabelRow}>
                      <Text style={styles.metricLabel}>{metric.label}</Text>
                      <Text style={styles.metricValue}>{metric.value}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${metric.value}%` }]} />
                    </View>
                  </View>
                )) : (
                  <Text style={styles.metricLabel}>Calculating metrics...</Text>
                )}
              </AdminCard>
            </View>

            {/* Recent Activities - Compact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Activities</Text>
                <Activity size={20} color="#5D4BA3" />
              </View>
              <AdminCard style={{ padding: 12 }}>
                {activities && activities.length > 0 ? (
                  activities.map((activity: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.activityItem,
                        index === activities.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                      ]}
                    >
                      <View style={styles.activityIconContainer}>
                        <Text style={{ fontSize: 14 }}>{getActivityEmoji(activity.icon)}</Text>
                      </View>
                      <View style={styles.activityTextContainer}>
                        <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                        <Text style={styles.activityDescription} numberOfLines={1}>{activity.description}</Text>
                      </View>
                      {activity.time && (
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                    <Text style={{ color: theme.dark ? '#cac4d3' : '#797582', fontWeight: '500', fontSize: 13 }}>
                      No recent activities found
                    </Text>
                  </View>
                )}
              </AdminCard>
            </View>
          </>
        ) : (
          <AdminEmptyState
            title="No data available"
            description="Unable to load dashboard statistics at this time."
          />
        )}
      </ScrollView>

      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        navigation={navigation}
        activeScreen="AdminDashboard"
      />
    </SafeAreaView>
    </GestureDetector>
  );
};

export default AdminDashboardScreen;
