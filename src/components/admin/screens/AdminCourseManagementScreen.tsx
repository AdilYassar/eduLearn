import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { 
  Plus, 
  Trash2, 
  Book, 
  X, 
  Search, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Edit3,
  MoreVertical,
  Clock,
  Briefcase
} from 'lucide-react-native';
import {
  getCourses,
  deleteCourse,
  createCourse,
  updateCourse,
  getTheories,
  createTheory,
  updateTheory,
} from '../../../redux/reducers/adminSlice';
import { adminCourseService } from '../../../components/admin/services/adminAPI';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import AdminButton from '../ui/AdminButton';
import { AdminCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import { AdminInput } from '../ui/AdminInput';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const SPACING = (width - ITEM_WIDTH) / 2;

interface Props {
  navigation: any;
}

const AnimatedAdminCourseCard = React.memo(({
  item,
  index,
  theme,
  styles,
  onEdit,
  onManageChapters,
  onDelete,
  scrollX,
}: {
  item: any;
  index: number;
  theme: any;
  styles: any;
  onEdit: (item: any) => void;
  onManageChapters: (item: any) => void;
  onDelete: (id: string, title: string) => void;
  scrollX: Animated.SharedValue<number>;
}) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
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
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ width: ITEM_WIDTH }, animatedStyle]}>
      <AdminCard style={styles.courseCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.languageBadge, { backgroundColor: '#5D4BA3' }]}>
            <Text style={styles.languageText}>COURSE</Text>
          </View>
          <Text style={[styles.pagesCount, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
            {item.estimatedTime || 'N/A'}
          </Text>
        </View>

        <View style={styles.courseIconBox}>
          <Book size={48} color="#5D4BA3" />
        </View>

        <View style={styles.titleRow}>
           <Text style={[styles.courseTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={2}>
             {item.title}
           </Text>
        </View>

         <Text style={[styles.instructorText, { color: theme.dark ? '#cac4d3' : '#797582' }]} numberOfLines={1}>
           👨‍🏫 {item.instructor || 'Staff Instructor'}
         </Text>

         <Text style={{ color: theme.dark ? '#cac4d3' : '#797582', fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
           {item.description || 'Comprehensive curriculum designed for mastery. Includes interactive chapters and practical exercises.'}
         </Text>

        <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Chapters</Text>
            <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]}>
              {typeof item.theoryInfo === 'object' ? (item.theoryInfo.chapters || 0) : (item.theoryInfo || 0)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Level</Text>
            <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]}>All Levels</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => onManageChapters(item)} style={styles.actionBtn}>
            <FileText size={18} color="#5D4BA3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
            <Edit3 size={18} color="#5D4BA3" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id, item.title)} style={[styles.actionBtn, styles.deleteBtn]}>
            <Trash2 size={18} color="#ba1a1a" />
          </TouchableOpacity>
        </View>
      </AdminCard>
    </Animated.View>
  );
});

const AdminCourseManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { courses, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.admin
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentTheory, setCurrentTheory] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedTime: '',
    materialsNeeded: '',
    steps: [] as string[],
  });
  const [chapters, setChapters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  const scrollX = useSharedValue(0);
  const flatListRef = React.useRef<any>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    fetchCourses();
  }, [dispatch]);

  const fetchCourses = (page = pagination.page, query = '') => {
    dispatch(getCourses({ 
      page: page, 
      limit: pagination.limit,
      search: query 
    }));
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
    if (newPage >= 1 && newPage <= totalPages) {
      fetchCourses(newPage);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setShowSearchDropdown(false);
      setSearchResults([]);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const response = await adminCourseService.getCourses(1, 10, text);
        setSearchResults(response.data?.data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const validateForm = () => {
    const errors: any = {};
    if (!formData.title) errors.title = 'Course title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.estimatedTime) errors.estimatedTime = 'Estimated time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCourse = async () => {
    if (!validateForm()) return;

    try {
      if (editingCourse) {
        await dispatch(updateCourse({ id: editingCourse.id, data: formData })).unwrap();
        Alert.alert('Success', 'Course updated successfully');
      } else {
        await dispatch(createCourse(formData)).unwrap();
        Alert.alert('Success', 'Course created successfully');
      }
      resetForm();
      setShowAddModal(false);
      fetchCourses();
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingCourse ? 'update' : 'create'} course`);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', estimatedTime: '', materialsNeeded: '', steps: [] });
    setEditingCourse(null);
    setFormErrors({});
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      estimatedTime: course.estimatedTime || '',
      materialsNeeded: course.materialsNeeded || '',
      steps: course.steps || [],
    });
    setShowAddModal(true);
  };

  const handleManageChapters = async (course: any) => {
    setSelectedCourse(course);
    try {
      const theoryRes: any = await dispatch(getTheories(course.title)).unwrap();
      const theoriesList = Array.isArray(theoryRes) ? theoryRes : (theoryRes.data || []);
      
      const theory = theoriesList.find((t: any) => 
        (t.courseId && t.courseId === (course._id || course.id)) || 
        (t.courseTitle && t.courseTitle.toLowerCase() === course.title.toLowerCase())
      );
      
      if (theory) {
        setCurrentTheory(theory);
        setChapters(theory.chapters || []);
      } else {
        setCurrentTheory(null);
        setChapters([]);
      }
      setShowChapterModal(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch chapters');
    }
  };

  const handleSyncChapters = async () => {
    if (!selectedCourse) return;

    const courseId = selectedCourse._id || selectedCourse.id;
    const theoryData = {
      courseTitle: selectedCourse.title,
      description: selectedCourse.description,
      courseId: courseId,
      chapters: chapters.map(ch => ({
        title: ch.title,
        content: ch.content || 'New chapter content',
        course: courseId
      }))
    };

    try {
      if (currentTheory) {
        await dispatch(updateTheory({ id: currentTheory._id || currentTheory.id, data: theoryData })).unwrap();
      } else {
        await dispatch(createTheory(theoryData)).unwrap();
      }
      Alert.alert('Success', 'Chapters synchronized successfully');
      setShowChapterModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to synchronize chapters');
    }
  };

  const handleDeleteCourse = (id: string, title: string) => {
    Alert.alert(
      'Archive Course',
      `Are you sure you want to archive "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => dispatch(deleteCourse(id)),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 0,
      gap: 12,
      zIndex: 10,
    },
    wheelerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 5, // Even higher
    },
    courseCard: {
      height: 420,
      borderRadius: 32,
      padding: 15,
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      marginHorizontal: 0,
      gap: 4, 
      overflow: 'hidden', // Fail-safe
      shadowColor: '#5D4BA3',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.15,
      shadowRadius: 30,
      elevation: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    languageBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    languageText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFF',
      letterSpacing: 1,
    },
    pagesCount: {
      fontSize: 12,
      fontWeight: '700',
    },
    courseIconBox: {
      width: '100%',
      height: 70, // Minimal height to leave room for text
      backgroundColor: theme.dark ? '#1c1b21' : '#F4F2FF',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    courseTitle: {
      fontSize: 20,
      fontWeight: '800',
      flex: 1,
      lineHeight: 26,
    },
    instructorText: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 16,
    },
    divider: {
      height: 1,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 15,
      fontWeight: '800',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 'auto',
      marginBottom: 0, 
    },
    actionBtn: {
      flex: 1,
      height: 44, // Slightly taller
      borderRadius: 14,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteBtn: {
      backgroundColor: theme.dark ? '#3a1f21' : '#FFEBEE',
    },
    paginationCard: {
      width: ITEM_WIDTH,
      height: 420, // Match courseCard
      borderRadius: 32,
      padding: 24,
      backgroundColor: '#5D4BA3',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#5D4BA3',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 15,
    },
    paginationTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: 8,
      textAlign: 'center',
    },
    paginationSub: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 40,
      textAlign: 'center',
    },
    paginationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    pageCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pageNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: '#ffffff',
    },
    searchDropdown: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      borderRadius: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
      zIndex: 1000,
      overflow: 'hidden',
    },
    searchResultItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
    },
    searchResultTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    },
    searchResultSub: {
      fontSize: 12,
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(45, 37, 96, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 40,
      minHeight: '70%',
      maxHeight: '95%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    chapterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.dark ? '#25232a' : '#F8F6FD',
      borderRadius: 12,
      marginBottom: 8,
    },
    chapterInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      padding: 0,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.dark ? '#cac4d3' : '#797582',
      marginBottom: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AdminHeader
        title="Courses"
        subtitle="Curriculum Management"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
          >
            <Plus size={24} color="#5D4BA3" />
          </TouchableOpacity>
        }
      />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, zIndex: 100 }}>
          {error && <AdminErrorBanner message={error} />}

          <View style={styles.searchRow}>
            <AdminInput
              placeholder={`Search ${pagination.total || 0} courses...`}
              value={searchQuery}
              onChangeText={handleSearch}
              icon={<Search size={18} color="#cac4d3" />}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              hideLabel
            />
            
            {showSearchDropdown && (
              <View style={[styles.searchDropdown, { 
                backgroundColor: theme.dark ? '#25232a' : '#ffffff',
                borderColor: theme.dark ? '#3a3645' : '#EDE5F8',
              }]}>
                {isSearching ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.dark ? '#cac4d3' : '#797582' }}>Searching...</Text>
                  </View>
                ) : searchResults.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.dark ? '#cac4d3' : '#797582' }}>No courses found</Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => String(item._id || item.id || Math.random())}
                    style={{ maxHeight: 300 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.searchResultItem, { borderBottomColor: theme.dark ? '#3a3645' : '#EDE5F8' }]}
                        onPress={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          handleEditCourse(item);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.searchResultTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]}>{item.title}</Text>
                          <Text style={[styles.searchResultSub, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
                            {item.instructor || 'Staff'} • {item.estimatedTime || 'N/A'}
                          </Text>
                        </View>
                        <ChevronRight size={16} color="#cac4d3" />
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.wheelerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={courses}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: SPACING,
              alignItems: 'center',
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <AnimatedAdminCourseCard
                item={item}
                index={index}
                theme={theme}
                styles={styles}
                onEdit={handleEditCourse}
                onManageChapters={handleManageChapters}
                onDelete={handleDeleteCourse}
                scrollX={scrollX}
              />
            )}
            ListEmptyComponent={
              !isLoading ? (
                <View style={{ width: width - SPACING * 2 }}>
                  <AdminEmptyState
                    icon={<Book size={48} color="#5D4BA3" />}
                    title="No Courses Found"
                    description="Create your first course to start building the curriculum."
                    onPress={() => setShowAddModal(true)}
                    buttonText="Add Course"
                  />
                </View>
              ) : null
            }
            ListFooterComponent={() => {
              const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
              if (totalPages <= 1) return null;

              return (
                <Animated.View style={[{ width: ITEM_WIDTH }, useAnimatedStyle(() => {
                  const index = courses.length;
                  const inputRange = [(index - 1) * ITEM_WIDTH, index * ITEM_WIDTH, (index + 1) * ITEM_WIDTH];
                  const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], 'clamp');
                  return { transform: [{ scale }] };
                })]}>
                  <View style={styles.paginationCard}>
                    <Text style={styles.paginationTitle}>Navigation</Text>
                    <Text style={styles.paginationSub}>Page {pagination.page} of {totalPages}</Text>
                    
                    <View style={styles.paginationControls}>
                      <TouchableOpacity 
                        style={[styles.pageCircle, pagination.page === 1 && { opacity: 0.3 }]}
                        onPress={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft size={28} color="#ffffff" />
                      </TouchableOpacity>
                      
                      <View style={[styles.pageCircle, { backgroundColor: '#ffffff' }]}>
                        <Text style={[styles.pageNumber, { color: '#5D4BA3' }]}>{pagination.page}</Text>
                      </View>

                      <TouchableOpacity 
                        style={[styles.pageCircle, pagination.page === totalPages && { opacity: 0.3 }]}
                        onPress={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === totalPages}
                      >
                        <ChevronRight size={28} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            }}
          />
        </View>
      </View>

      {/* Add/Edit Course Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCourse ? 'Edit Course' : 'Create Course'}</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <X size={24} color="#797582" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AdminInput
                label="Course Title"
                placeholder="e.g. Advanced UI Design"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                error={formErrors.title}
              />
              <AdminInput
                label="Description"
                placeholder="What will students learn?"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                error={formErrors.description}
                multiline
                numberOfLines={3}
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <AdminInput
                  label="Estimated Time"
                  placeholder="e.g. 4 Weeks"
                  value={formData.estimatedTime}
                  onChangeText={(text) => setFormData({ ...formData, estimatedTime: text })}
                  error={formErrors.estimatedTime}
                  containerStyle={{ flex: 1 }}
                />
                <AdminInput
                  label="Materials"
                  placeholder="e.g. Figma, Pen"
                  value={formData.materialsNeeded}
                  onChangeText={(text) => setFormData({ ...formData, materialsNeeded: text })}
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <AdminButton
                title={editingCourse ? 'Update Course' : 'Create Course'}
                onPress={handleAddCourse}
                loading={isLoading}
                style={{ marginTop: 24 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chapter Management Modal */}
      <Modal visible={showChapterModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Manage Chapters</Text>
                <Text style={{ color: '#797582', fontSize: 13 }}>{selectedCourse?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowChapterModal(false)}>
                <X size={24} color="#797582" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <Text style={styles.inputLabel}>Course Content ({chapters.length} Chapters)</Text>
              {chapters.map((chapter, index) => (
                <View key={index} style={styles.chapterItem}>
                  <TextInput
                    style={styles.chapterInput}
                    value={chapter.title}
                    onChangeText={(text) => {
                      const newChapters = [...chapters];
                      newChapters[index] = { ...newChapters[index], title: text };
                      setChapters(newChapters);
                    }}
                    placeholder="Chapter Title"
                    placeholderTextColor={theme.dark ? '#666' : '#999'}
                  />
                  <TouchableOpacity onPress={() => {
                    const newChapters = [...chapters];
                    newChapters.splice(index, 1);
                    setChapters(newChapters);
                  }}>
                    <Trash2 size={16} color="#ba1a1a" />
                  </TouchableOpacity>
                </View>
              ))}

              <AdminButton
                title="Add New Chapter"
                onPress={() => {
                  const courseId = selectedCourse._id || selectedCourse.id;
                  setChapters([...chapters, { 
                    title: `Chapter ${chapters.length + 1}`, 
                    content: 'New chapter content',
                    course: courseId
                  }]);
                }}
                variant="outline"
                style={{ marginTop: 12 }}
                icon={<Plus size={18} color="#5D4BA3" />}
              />
            </ScrollView>

            <AdminButton
              title="Save Curriculum"
              onPress={handleSyncChapters}
              loading={isLoading}
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminCourseManagementScreen;
