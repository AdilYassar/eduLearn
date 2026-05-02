import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ThemedText, ThemedContainer, GlassCard, ThemedHeader } from '../../components/ui/ThemedComponents';
import {
  CalendarDaysIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ArrowPathIcon
} from 'react-native-heroicons/outline';
import { useCourse } from '../../service/hooks/useCourse';
import {
  generateCourseTimeline,
  CourseData,
  syncTimelineWithBackend, 
  getTimelineFromBackend,
  getAllTimelinesFromBackend
} from '../../service/timelineService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TimelineScreen = () => {
  const { theme } = useTheme();
  const { getMyEnrolledCourses } = useCourse();
  
  // Local state instead of Redux
  const [courseTimelines, setCourseTimelines] = useState<{[key: string]: any}>({});
  const [courseLoading, setCourseLoading] = useState<{[key: string]: boolean}>({});
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Courses' | 'Progress'>('Timeline');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAllTimelines();
  }, []);

  const fetchAllTimelines = async () => {
    try {
      const allData = await getAllTimelinesFromBackend();
      if (allData && Array.isArray(allData)) {
        const timelineMap: {[key: string]: any} = {};
        allData.forEach(item => {
          if (item.courseId) {
            // Support both full object and sessions array
            timelineMap[item.courseId] = item.sessions || item;
          }
        });
        setCourseTimelines(prev => ({ ...prev, ...timelineMap }));
      }
    } catch (err) {
      console.error('Error fetching all timelines:', err);
    }
  };

  useEffect(() => {
    if (selectedCourseId && !courseTimelines[selectedCourseId]) {
      fetchTimelineFromBackend(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchTimelineFromBackend = async (courseId: string) => {
    setCourseLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const savedTimeline = await getTimelineFromBackend(courseId);
      if (savedTimeline) {
        setCourseTimelines(prev => ({
          ...prev,
          [courseId]: savedTimeline
        }));
      }
    } catch (err) {
      console.error('Error fetching timeline from backend:', err);
    } finally {
      setCourseLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const courses = await getMyEnrolledCourses(token);
        if (courses) {
          setEnrolledCourses(courses);
          if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0].course._id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const currentTimeline = useMemo(() => {
    if (!selectedCourseId) return null;
    return courseTimelines[selectedCourseId];
  }, [selectedCourseId, courseTimelines]);

  const isLoading = selectedCourseId ? courseLoading[selectedCourseId] : false;

  const handleGenerateTimeline = async (courseId: string, customPrompt?: string) => {
    const course = enrolledCourses.find(c => c.course._id === courseId);
    if (!course) return;

    setCourseLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const courseData: CourseData = {
        id: course.course._id,
        title: course.course.title,
        chapters: course.course.chapters || [],
        completedChapters: course.completedChapters || [],
      };

      // 1. Generate with AI
      const generated = await generateCourseTimeline(courseData, customPrompt);
      
      // 2. Sync with backend (POST)
      await syncTimelineWithBackend(courseId, generated, customPrompt);
      
      // 3. RE-FETCH from backend (GET) to ensure backend is the source of truth
      await fetchTimelineFromBackend(courseId);
    } catch (err: any) {
      console.error('Generation error:', err);
    } finally {
      setCourseLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  // Week Strip Logic
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: DAYS[d.getDay()],
        dayNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString()
      });
    }
    return days;
  }, []);

  const renderHeader = () => (
    <ThemedHeader
      title="Study Planner"
      showBack
      rightAction={
        <TouchableOpacity onPress={fetchCourses}>
          <ArrowPathIcon size={24} color={theme.text.primary} />
        </TouchableOpacity>
      }
      style={{ paddingHorizontal: 0 }}
    />
  );

  const renderWeekStrip = () => (
    <View style={styles.weekContainer}>
      {weekDays.map((item) => (
        <TouchableOpacity
          key={item.date}
          onPress={() => setSelectedDate(item.date)}
          style={[
            styles.dayCard,
            selectedDate === item.date && { backgroundColor: theme.primary, borderRadius: 12 }
          ]}
        >
          <ThemedText style={[
            styles.dayName,
            selectedDate === item.date && { color: '#fff' }
          ]}>{item.dayName}</ThemedText>
          <ThemedText style={[
            styles.dayNum,
            selectedDate === item.date && { color: '#fff', fontWeight: 'bold' }
          ]}>{item.dayNum}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCourseChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsContainer}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {enrolledCourses.map((item) => (
        <TouchableOpacity
          key={item.course._id}
          onPress={() => setSelectedCourseId(item.course._id)}
          style={[
            styles.chip,
            { backgroundColor: selectedCourseId === item.course._id ? theme.primary : theme.card.background },
            selectedCourseId === item.course._id && styles.activeChip
          ]}
        >
          <ThemedText style={[
            styles.chipText,
            selectedCourseId === item.course._id && { color: '#fff' }
          ]}>{item.course.title}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTimelineFeed = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={{ marginTop: 10 }}>Generating AI Timeline...</ThemedText>
        </View>
      );
    }

    if (!currentTimeline) {
      return (
        <View style={styles.centerContent}>
          <SparklesIcon size={48} color={theme.text.secondary} />
          <ThemedText style={styles.emptyTitle}>No Timeline Generated</ThemedText>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={() => selectedCourseId && handleGenerateTimeline(selectedCourseId)}
          >
            <SparklesIcon size={20} color="#fff" />
            <ThemedText style={styles.generateButtonText}>Generate AI Timeline</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    const dayTimeline = currentTimeline.find((t: any) => t.date === selectedDate);

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.timelineHeader}>
          <ThemedText style={styles.timelineTitle}>Today's Goals</ThemedText>
        </View>
        <FlatList
          data={dayTimeline ? dayTimeline.chapters : []}
          keyExtractor={(item, index) => `${selectedDate}-${index}`}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInUp.delay(index * 100)}
              layout={Layout.springify()}
              style={styles.taskCardContainer}
            >
              <GlassCard style={styles.taskCard}>
                <View style={[styles.colorBar, { backgroundColor: theme.primary }]} />
                <View style={styles.taskContent}>
                  <ThemedText style={styles.taskTitle}>{item}</ThemedText>
                  <View style={styles.taskMeta}>
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>Chapter {index + 1}</ThemedText>
                    </View>
                    <View style={styles.llamaPill}>
                      <SparklesIcon size={12} color={theme.primary} />
                      <ThemedText style={[styles.llamaText, { color: theme.primary }]}>llama</ThemedText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyDay}>
              <CheckCircleIcon size={40} color={theme.text.secondary} />
              <ThemedText style={{ color: theme.text.secondary, marginTop: 10 }}>
                No tasks scheduled for this day
              </ThemedText>
            </View>
          }
          contentContainerStyle={{ padding: 16 }}
        />
      </View>
    );
  };

  return (
    <ThemedContainer style={styles.container}>
      {renderHeader()}
      {renderWeekStrip()}
      {renderCourseChips()}

      <View style={styles.tabContainer}>
        {['Timeline', 'Courses', 'Progress'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tab, activeTab === tab && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && { color: theme.primary }]}>{tab}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === 'Timeline' && renderTimelineFeed()}
        {activeTab === 'Courses' && (
          <ScrollView style={{ padding: 16 }}>
            {enrolledCourses.map(c => {
              const isCourseLoading = courseLoading[c.course._id] || false;
              return (
                <GlassCard key={c._id} style={styles.courseItem}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.courseItemTitle}>{c.course.title}</ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                      {c.course.chapters?.length || 0} Chapters • {c.progress || 0}% Complete
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleGenerateTimeline(c.course._id)}
                    disabled={isCourseLoading}
                    style={{ padding: 8 }}
                  >
                    {isCourseLoading ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <ArrowPathIcon size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                </GlassCard>
              );
            })}
          </ScrollView>
        )}
      </View>

      <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="TimelineScreen" />
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: RFValue(22),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginHorizontal: 10,
    borderRadius: 16,
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: 10,
    width: (width - 60) / 7,
    borderRadius: 12,
  },
  dayName: {
    fontSize: 10,
    marginBottom: 4,
    opacity: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '600',
  },
  chipsContainer: {
    maxHeight: 60,
    marginVertical: 15,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '800',
    marginLeft: 10,
    fontSize: 15,
  },
  taskCardContainer: {
    marginBottom: 15,
  },
  taskCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    minHeight: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  colorBar: {
    width: 6,
    height: '100%',
  },
  taskContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  llamaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  llamaText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
    textTransform: 'lowercase',
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 80,
    opacity: 0.5,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,
  },
  courseItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  nudgeButtonText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // Increased dimming
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  modalBody: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  nudgeInput: {
    height: 140,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  nudgeSubmitButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nudgeSubmitButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default TimelineScreen;
