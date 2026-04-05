import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  Image, 
  TextInput,
  Dimensions
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { navigate, goBack } from '../../utils/Navigation';
import { useCourse } from '@service/hooks/useCourse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EnrollPopup from '../../components/ui/EnrollPopup';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard, ThemedContainer } from '../../components/ui/ThemedComponents';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72; // High density sleek card width
const SPACING = (width - ITEM_WIDTH) / 2;

interface CourseItem {
  _id: string;
  title: string;
  description?: string;
  instructor?: string;
  chapters?: any[];
}

const courseImages = [
  require('../../assets/getStarted/100.png'),
  require('../../assets/getStarted/101.png'),
  require('../../assets/getStarted/102.png'),
  require('../../assets/getStarted/103.png'),
];

// Reusable Animated Card Component
const AnimatedCourseCard = ({ 
  item, 
  index, 
  scrollX, 
  isEnrolled, 
  isEnrolling, 
  onPress, 
  onEnroll, 
  theme 
}: any) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    // 3D Wheeler Effect Math
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], 'clamp');
    const rotateY = interpolate(scrollX.value, inputRange, [15, 0, -15], 'clamp');

    return {
      opacity,
      transform: [
        { perspective: 800 },
        { translateY },
        { scale },
        { rotateY: `${rotateY}deg` } // True horizontal wheeler rotation
      ],
    };
  });

  let imageIndex = 0;
  if (item._id) {
    const idHash = item._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    imageIndex = idHash % courseImages.length;
  }

  return (
    <Animated.View style={[{ width: ITEM_WIDTH }, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)}>
        <GlassCard style={styles.courseCard} opacity={0.12}>
          <View style={styles.imageBox}>
            <Image source={courseImages[imageIndex]} style={styles.courseImage} />
          </View>
          
          <View style={styles.infoBox}>
            <View>
              <Text style={[styles.courseTitle, { color: theme.text.primary }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.instructor, { color: theme.text.secondary }]}>
                {item.instructor || 'Premium Series'}
              </Text>
            </View>
            
            <View style={styles.footerRow}>
              <View style={styles.meta}>
                <Icon name="bar-chart" size={16} color={theme.text.secondary} />
                <Text style={[styles.metaText, { color: theme.text.secondary }]}>Pro Level</Text>
              </View>
              
              <TouchableOpacity 
                onPress={() => onEnroll(item._id)}
                disabled={isEnrolled || isEnrolling}
                style={[
                    styles.actionButton, 
                    { backgroundColor: isEnrolled ? 'rgba(45, 212, 191, 0.1)' : theme.primary }
                ]}
              >
                {isEnrolling ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Text style={[styles.actionText, { color: isEnrolled ? '#2DD4BF' : '#FFF' }]}>
                        {isEnrolled ? 'ENROLLED' : 'LOCKED'}
                    </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CourseScreen = () => {
  const { theme } = useTheme();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [showEnrollPopup, setShowEnrollPopup] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  const { getAllCourses, enrollInCourse, getEnrollmentStats } = useCourse();
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const fetchCourses = useCallback(async () => {
    try {
      const result = await getAllCourses();
      if (result) setCourses(result);
    } catch (err) {
      console.error(err);
    }
  }, [getAllCourses]);

  const fetchEnrollmentStats = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;
      const stats = await getEnrollmentStats(accessToken);
      if (stats) {
        const enrolledIds = new Set(stats.enrolledCourses.map((c: any) => c._id));
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (err) {
      console.error(err);
    }
  }, [getEnrollmentStats]);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await Promise.all([fetchCourses(), fetchEnrollmentStats()]);
      setInitialLoading(false);
    };
    loadData();
  }, []);

  const handleCourseCardClick = (course: CourseItem) => {
    setSelectedCourse(course);
    if (enrolledCourseIds.has(course._id)) {
      navigate('TheoryScreen', { courseId: course._id });
    } else {
      setShowEnrollPopup(true);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (enrollingCourses.has(courseId)) return;
    try {
      setEnrollingCourses(prev => new Set(prev).add(courseId));
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        Alert.alert('Error', 'Please log in to enroll.');
        return;
      }
      const result = await enrollInCourse(courseId, accessToken);
      if (result) {
        setEnrolledCourseIds(prev => new Set(prev).add(courseId));
        return true;
      }
    } catch (err) {
      Alert.alert('Error', 'Enrollment failed.');
    } finally {
      setEnrollingCourses(prev => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <ThemedContainer>
      <View style={styles.container}>
        <View style={styles.header}>
           <View style={{ width: 24 }} />
           <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Neural Academy</Text>
           <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
              <Icon name="search" size={24} color={theme.text.primary} />
           </TouchableOpacity>
        </View>

        {showSearchBar && (
             <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.searchWrap}>
                <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                   <Icon name="search" size={20} color={theme.text.secondary} />
                   <TextInput 
                      placeholder="Search courses..." 
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={[styles.input, { color: theme.text.primary }]}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                   />
                   {searchQuery.length > 0 && (
                       <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <Icon name="close" size={20} color={theme.text.secondary} />
                       </TouchableOpacity>
                   )}
                </View>
             </Animated.View>
        )}

        {initialLoading ? (
            <View style={styles.center}>
               <ActivityIndicator size="large" color={theme.primary} />
            </View>
        ) : (
            <View style={styles.wheelerContainer}>
              <Animated.FlatList
                data={filteredCourses}
                keyExtractor={item => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                bounces={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: SPACING, alignItems: 'center' }}
                renderItem={({ item, index }) => (
                  <AnimatedCourseCard
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    isEnrolled={enrolledCourseIds.has(item._id)}
                    isEnrolling={enrollingCourses.has(item._id)}
                    onPress={handleCourseCardClick}
                    onEnroll={handleEnrollCourse}
                    theme={theme}
                  />
                )}
              />
            </View>
        )}

        <EnrollPopup
          visible={showEnrollPopup}
          onClose={() => setShowEnrollPopup(false)}
          onEnroll={() => {
              setShowEnrollPopup(false);
              if(selectedCourse) handleEnrollCourse(selectedCourse._id);
          }}
          courseTitle={selectedCourse?.title || ''}
        />

        {/* Bottom Navigation Bar */}
        <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="CourseScreen" />
      </View>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  searchWrap: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  wheelerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  courseCard: {
    height: 380, // High density vertical card
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12, // Sharp corners instead of bubbly
    justifyContent: 'space-between',
  },
  imageBox: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  courseImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  infoBox: {
    flex: 1,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    lineHeight: 26,
    marginBottom: 6,
  },
  instructor: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8, // Sharp buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CourseScreen;