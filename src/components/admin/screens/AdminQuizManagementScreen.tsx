import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import {
  Plus,
  Trash2,
  ClipboardList,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  Edit3,
  HelpCircle,
  Clock,
  BarChart2,
  CheckCircle2,
  MoreVertical
} from 'lucide-react-native';
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../../redux/reducers/adminSlice';
import { adminQuizService } from '../../../components/admin/services/adminAPI';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import AdminButton from '../ui/AdminButton';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import { AdminInput } from '../ui/AdminInput';

interface Props {
  navigation: any;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const SPACING = (width - ITEM_WIDTH) / 2;

const AnimatedAdminQuizCard = React.memo(({
  item,
  index,
  theme,
  styles,
  onOpenOptions,
  scrollX,
}: {
  item: any;
  index: number;
  theme: any;
  styles: any;
  onOpenOptions: (item: any) => void;
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
      <View style={[
        styles.quizListItem,
        {
          height: 350,
          marginHorizontal: 8,
          padding: 20,
          borderRadius: 28,
          justifyContent: 'flex-start',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 4,
          backgroundColor: theme.dark ? '#25232a' : '#ffffff',
          shadowColor: '#5D4BA3',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        }
      ]}>
        <View style={styles.cardHeader}>
          <View style={[styles.languageBadge, { backgroundColor: '#5D4BA3' }]}>
            <Text style={styles.languageText}>{item.level?.toUpperCase() || 'INTERMEDIATE'}</Text>
          </View>
          <Text style={[styles.pagesCount, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
            {item.totalQuestions || 0} Qs
          </Text>
        </View>

        <View style={styles.bookCoverBox}>
          <Text style={styles.bookCoverEmoji}>📝</Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={[styles.bookTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => onOpenOptions(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MoreVertical size={20} color={theme.dark ? '#cac4d3' : '#797582'} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.authorText, { color: theme.dark ? '#cac4d3' : '#797582' }]} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Time</Text>
            <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={1}>
              {item.duration}m
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Difficulty</Text>
            <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={1}>
              {item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1) || 'Medium'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const AdminQuizManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { quizzes, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.admin
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const scrollX = useSharedValue(0);
  const flatListRef = React.useRef<any>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: 'medium',
    level: 'intermediate',
    passingScore: '70',
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'medium',
    points: '5',
  });

  useEffect(() => {
    fetchQuizzes();
  }, [dispatch]);

  const fetchQuizzes = (page = pagination.page, query = '') => {
    dispatch(getQuizzes({
      page: page,
      limit: pagination.limit,
      search: query
    }));
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
    if (newPage >= 1 && newPage <= totalPages) {
      fetchQuizzes(newPage);
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
        const response = await adminQuizService.getQuizzes(1, 10, text);
        setSearchResults(response.data?.data || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      duration: '',
      difficulty: 'medium',
      level: 'intermediate',
      passingScore: '70',
    });
    setEditingQuiz(null);
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title || !quizForm.duration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const data = {
        ...quizForm,
        duration: parseInt(quizForm.duration),
        passingScore: parseInt(quizForm.passingScore)
      };

      if (editingQuiz) {
        await dispatch(updateQuiz({ id: editingQuiz.id, data })).unwrap();
        Alert.alert('Success', 'Quiz updated successfully');
      } else {
        await dispatch(createQuiz(data)).unwrap();
        Alert.alert('Success', 'Quiz created successfully');
      }
      setShowAddModal(false);
      resetQuizForm();
      fetchQuizzes();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save quiz');
    }
  };

  const handleDeleteQuiz = (id: string, title: string) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${title}"? This will also remove all linked questions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteQuiz(id)).unwrap();
              Alert.alert('Success', 'Quiz deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete quiz');
            }
          }
        }
      ]
    );
  };

  const handleManageQuestions = async (quiz: any) => {
    setSelectedQuiz(quiz);
    try {
      const targetQuizId = quiz._id || quiz.id;
      const res = await dispatch(getQuestions({ page: 1, limit: 100, quizId: String(targetQuizId) })).unwrap();
      const quizQuestions = res.data || (Array.isArray(res) ? res : []);
      setQuestions(quizQuestions);
      setShowQuestionModal(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch questions');
    }
  };

  const handleAddQuestion = async () => {
    const validOptions = newQuestion.options.filter(o => o.trim() !== '');

    if (!newQuestion.question.trim()) {
      Alert.alert('Error', 'Question text is required');
      return;
    }

    if (newQuestion.type === 'multiple-choice' && validOptions.length < 2) {
      Alert.alert('Error', 'At least 2 options are required for MCQ');
      return;
    }

    if (!newQuestion.correctAnswer) {
      Alert.alert('Error', 'Correct answer is required');
      return;
    }

    try {
      const questionData = {
        ...newQuestion,
        options: newQuestion.type === 'multiple-choice' ? validOptions : [],
        points: parseInt(newQuestion.points),
        quiz: selectedQuiz._id || selectedQuiz.id
      };
      const res = await dispatch(createQuestion(questionData)).unwrap();
      setQuestions([...questions, res.data || res]);
      setNewQuestion({
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficulty: 'medium',
        points: '5',
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      setQuestions(questions.filter(q => String(q._id || q.id) !== String(id)));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete question');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.dark ? '#2d2b33' : '#EDE5F8',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '800',
      color: '#5D4BA3',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.dark ? '#cac4d3' : '#797582',
      textTransform: 'uppercase',
      marginTop: 2,
    },
    quizListItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#2d2b33' : '#EDE5F8',
    },
    quizContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    quizIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.dark ? '#312f36' : '#EDE5F8',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    quizInfo: {
      flex: 1,
    },
    quizTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 4,
    },
    quizMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    quizMetaText: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: theme.dark ? '#312f36' : '#EDE5F8',
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteBtn: {
      backgroundColor: theme.dark ? '#3d1c1c' : '#FFDAD6',
    },
    searchDropdown: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      zIndex: 1000,
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
      fontWeight: '600',
      marginBottom: 4,
    },
    searchResultSub: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      gap: 16,
    },
    pageBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.dark ? '#312f36' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
    },
    pageIndicator: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
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
      minHeight: '80%',
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
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.dark ? '#cac4d3' : '#2D2560',
      marginBottom: 8,
      marginTop: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContentOptions: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 32,
      maxHeight: '90%',
    },
    modalHeaderOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitleOptions: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)',
    },
    optionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.dark ? '#312f36' : '#EDE5F8',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionIconContainerDelete: {
      backgroundColor: theme.dark ? '#312f36' : '#ffdad6',
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    optionTextDelete: {
      color: '#ba1a1a',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    languageBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    languageText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFF',
      letterSpacing: 0.5,
    },
    pagesCount: {
      fontSize: 12,
      fontWeight: '500',
    },
    bookCoverBox: {
      width: '100%',
      height: 70, // Drastic reduction
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#EDE5F8',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    bookCoverEmoji: {
      fontSize: 60,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    bookTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 6,
      marginRight: 8,
    },
    authorText: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
      marginBottom: 12,
    },
    divider: {
      height: 1,
      marginVertical: 12,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    wheelerContainer: {
      flex: 1,
      justifyContent: 'center',
      marginTop: -10, // Move higher
    },
    chapterItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.dark ? '#2d2b33' : '#EDE5F8',
    },
    chapterInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      padding: 0,
    },
    optionTag: {
      width: 32,
      height: 32,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <AdminHeader
        title="Assessments"
        subtitle="Manage Quizzes & Questions"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => { resetQuizForm(); setShowAddModal(true); }}
            style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
          >
            <Plus size={24} color="#5D4BA3" />
          </TouchableOpacity>
        }
      />

      <View style={{ flex: 1 }}>
        <View>
          {error ? <AdminErrorBanner message={error} /> : null}

          <View style={[styles.searchRow, { paddingHorizontal: 20, zIndex: 10 }]}>
            <AdminInput
              placeholder={`Search ${pagination.total || 0} quizzes...`}
              value={searchQuery}
              onChangeText={handleSearch}
              icon={<Search size={18} color="#cac4d3" />}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              hideLabel
            />

            {/* Search Dropdown Drawer */}
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
                    <Text style={{ color: theme.dark ? '#cac4d3' : '#797582' }}>No quizzes found for "{searchQuery}"</Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => String(item._id || item.id || Math.random())}
                    style={{ maxHeight: 300 }}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.searchResultItem, { borderBottomColor: theme.dark ? '#3a3645' : '#EDE5F8' }]}
                        onPress={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          setSelectedQuiz(item);
                          setOptionsVisible(true);
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.searchResultTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.searchResultSub, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
                            {item.difficulty} • {item.totalQuestions || 0} Questions
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

          <View style={[styles.statsRow, { paddingHorizontal: 20 }]}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pagination.total || 0}</Text>
              <Text style={styles.statLabel}>Total Quizzes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(quizzes || []).reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(quizzes || []).filter((q: any) => q.difficulty === 'hard').length}
              </Text>
              <Text style={styles.statLabel}>Hard Mode</Text>
            </View>
          </View>

          {isLoading && (quizzes || []).length === 0 && (
            <Text style={{ textAlign: 'center', color: '#5D4BA3', marginVertical: 20 }}>
              Loading assessments...
            </Text>
          )}
        </View>

        <View style={styles.wheelerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={quizzes}
            renderItem={({ item, index }) => (
              <AnimatedAdminQuizCard
                item={item}
                index={index}
                theme={theme}
                styles={styles}
                onOpenOptions={(q) => {
                  setSelectedQuiz(q);
                  setOptionsVisible(true);
                }}
                scrollX={scrollX}
              />
            )}
            keyExtractor={(item) => String(item._id || item.id || Math.random())}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: SPACING, alignItems: 'center' }}
            ListEmptyComponent={
              !isLoading ? (
                <View style={{ padding: 20, marginTop: 40, width: width }}>
                  <AdminEmptyState
                    title="No Quizzes Found"
                    description="Create a new quiz to start assessing your students."
                    icon={<ClipboardList size={64} color="#5D4BA3" />}
                    onPress={() => setShowAddModal(true)}
                    buttonText="Create Quiz"
                  />
                </View>
              ) : <View style={{ width: width }} />
            }
            ListFooterComponent={
              (() => {
                const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
                if (totalPages <= 1) return null;

                return (
                  <View style={{ width: ITEM_WIDTH, height: 350, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 }}>
                    <View style={{
                      backgroundColor: '#5D4BA3',
                      width: '100%',
                      height: '100%',
                      borderRadius: 28,
                      padding: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#5D4BA3',
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                      elevation: 10,
                    }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 4 }}>
                        Navigation
                      </Text>
                      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 30 }}>
                        Page {pagination.page} of {totalPages}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <TouchableOpacity
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: pagination.page === 1 ? 0.3 : 1
                          }}
                          onPress={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft size={24} color="#ffffff" />
                        </TouchableOpacity>

                        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: '#5D4BA3' }}>{pagination.page}</Text>
                        </View>

                        <TouchableOpacity
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: pagination.page === totalPages ? 0.3 : 1
                          }}
                          onPress={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === totalPages}
                        >
                          <ChevronRight size={24} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })()
            }
          />
        </View>
      </View>

      {/* Add/Edit Quiz Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetQuizForm(); }}>
                <X size={24} color="#797582" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[]}
              ListHeaderComponent={
                <View>
                  <AdminInput
                    label="Quiz Title"
                    placeholder="e.g. React Hooks Deep Dive"
                    value={quizForm.title}
                    onChangeText={(text) => setQuizForm({ ...quizForm, title: text })}
                  />
                  <AdminInput
                    label="Description"
                    placeholder="Brief overview of the assessment"
                    value={quizForm.description}
                    onChangeText={(text) => setQuizForm({ ...quizForm, description: text })}
                    multiline
                    numberOfLines={2}
                  />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <AdminInput
                      label="Duration (min)"
                      placeholder="45"
                      value={quizForm.duration}
                      onChangeText={(text) => setQuizForm({ ...quizForm, duration: text.replace(/[^0-9]/g, '') })}
                      containerStyle={{ flex: 1 }}
                      keyboardType="numeric"
                    />
                    <AdminInput
                      label="Passing %"
                      placeholder="70"
                      value={quizForm.passingScore}
                      onChangeText={(text) => setQuizForm({ ...quizForm, passingScore: text.replace(/[^0-9]/g, '') })}
                      containerStyle={{ flex: 1 }}
                      keyboardType="numeric"
                    />
                  </View>

                  <Text style={styles.inputLabel}>Difficulty (Backend Enum)</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {['easy', 'medium', 'hard'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setQuizForm({ ...quizForm, difficulty: level })}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: quizForm.difficulty === level ? '#5D4BA3' : (theme.dark ? '#312f36' : '#EDE5F8'),
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: quizForm.difficulty === level ? '#5D4BA3' : 'transparent'
                        }}
                      >
                        <Text style={{
                          color: quizForm.difficulty === level ? '#ffffff' : (theme.dark ? '#cac4d3' : '#5D4BA3'),
                          fontWeight: '700',
                          fontSize: 11,
                          textTransform: 'capitalize'
                        }}>{level}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Level (Backend Enum)</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                    {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <TouchableOpacity
                        key={lvl}
                        onPress={() => setQuizForm({ ...quizForm, level: lvl })}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: quizForm.level === lvl ? '#5D4BA3' : (theme.dark ? '#312f36' : '#EDE5F8'),
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: quizForm.level === lvl ? '#5D4BA3' : 'transparent'
                        }}
                      >
                        <Text style={{
                          color: quizForm.level === lvl ? '#ffffff' : (theme.dark ? '#cac4d3' : '#5D4BA3'),
                          fontWeight: '700',
                          fontSize: 11,
                          textTransform: 'capitalize'
                        }}>{lvl}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <AdminButton
                    title={editingQuiz ? 'Save Changes' : 'Create Quiz'}
                    onPress={handleSaveQuiz}
                    loading={isLoading}
                  />
                </View>
              }
              renderItem={null}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Manage Questions Modal */}
      <Modal visible={showQuestionModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Question Bank</Text>
                <Text style={{ fontSize: 13, color: '#797582', fontWeight: '600' }} numberOfLines={1}>{selectedQuiz?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQuestionModal(false)}>
                <X size={24} color="#797582" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={questions}
              keyExtractor={(item) => item._id || item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ListHeaderComponent={
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.inputLabel, { marginTop: 0, marginBottom: 8, fontSize: 13, color: '#5D4BA3' }]}>Create New Question</Text>

                  <View style={{ flexDirection: 'row', gap: 4, marginBottom: 12 }}>
                    {['multiple-choice', 'true-false', 'short-answer'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNewQuestion({ ...newQuestion, type: type as any, correctAnswer: '', options: ['', '', '', ''] })}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: newQuestion.type === type ? '#5D4BA3' : (theme.dark ? '#312f36' : '#ffffff'),
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: newQuestion.type === type ? '#5D4BA3' : (theme.dark ? '#484551' : '#EDE5F8'),
                        }}
                      >
                        <Text style={{
                          color: newQuestion.type === type ? '#ffffff' : (theme.dark ? '#cac4d3' : '#5D4BA3'),
                          fontWeight: '800',
                          fontSize: 9,
                          textTransform: 'uppercase'
                        }}>{type.split('-')[0]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={[styles.chapterInput, { marginBottom: 12, fontSize: 14, backgroundColor: theme.dark ? '#312f36' : '#ffffff', padding: 12, borderRadius: 12, minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.dark ? '#484551' : '#EDE5F8' }]}
                    placeholder="Enter question text..."
                    value={newQuestion.question}
                    onChangeText={(text) => setNewQuestion({ ...newQuestion, question: text })}
                    multiline
                    placeholderTextColor={theme.dark ? '#666' : '#999'}
                  />

                  {newQuestion.type === 'multiple-choice' && (
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.inputLabel, { marginTop: 0, marginBottom: 0, fontSize: 11 }]}>Options</Text>
                        <Text style={{ fontSize: 9, color: '#5D4BA3', fontWeight: '700' }}>Tap A-D for correct</Text>
                      </View>
                      <View style={{ gap: 6 }}>
                        {newQuestion.options.map((opt, idx) => (
                          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                              onPress={() => opt.trim() && setNewQuestion({ ...newQuestion, correctAnswer: opt.trim() })}
                              style={[
                                styles.optionTag,
                                {
                                  backgroundColor: newQuestion.correctAnswer === opt.trim() && opt.trim() ? '#5D4BA3' : (theme.dark ? '#312f36' : '#ffffff'),
                                  borderColor: opt.trim() ? '#5D4BA3' : (theme.dark ? '#484551' : '#EDE5F8'),
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8
                                }
                              ]}
                            >
                              {newQuestion.correctAnswer === opt.trim() && opt.trim() ? (
                                <CheckCircle2 size={14} color="#ffffff" />
                              ) : (
                                <Text style={{ fontSize: 12, fontWeight: '800', color: opt.trim() ? '#5D4BA3' : (theme.dark ? '#666' : '#999') }}>{String.fromCharCode(65 + idx)}</Text>
                              )}
                            </TouchableOpacity>
                            <TextInput
                              style={[
                                styles.chapterInput,
                                {
                                  backgroundColor: theme.dark ? '#312f36' : '#ffffff',
                                  paddingHorizontal: 12,
                                  paddingVertical: 8,
                                  borderRadius: 10,
                                  borderWidth: 1,
                                  borderColor: theme.dark ? '#484551' : '#EDE5F8',
                                  fontSize: 13
                                }
                              ]}
                              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              value={opt}
                              onChangeText={(text) => {
                                const opts = [...newQuestion.options];
                                opts[idx] = text;
                                setNewQuestion({ ...newQuestion, options: opts });
                              }}
                              placeholderTextColor={theme.dark ? '#666' : '#999'}
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {newQuestion.type !== 'multiple-choice' && (
                    <AdminInput
                      label="Correct Answer"
                      placeholder={newQuestion.type === 'true-false' ? 'True or False' : 'Enter answer'}
                      value={newQuestion.correctAnswer}
                      onChangeText={(text) => setNewQuestion({ ...newQuestion, correctAnswer: text })}
                      containerStyle={{ marginTop: 8 }}
                    />
                  )}

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
                    {['easy', 'medium', 'hard'].map((diff) => (
                      <TouchableOpacity
                        key={diff}
                        onPress={() => setNewQuestion({ ...newQuestion, difficulty: diff as any })}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: newQuestion.difficulty === diff ? '#5D4BA3' : (theme.dark ? '#312f36' : '#ffffff'),
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: newQuestion.difficulty === diff ? '#5D4BA3' : (theme.dark ? '#484551' : '#EDE5F8'),
                        }}
                      >
                        <Text style={{
                          color: newQuestion.difficulty === diff ? '#ffffff' : (theme.dark ? '#cac4d3' : '#5D4BA3'),
                          fontWeight: '800',
                          fontSize: 9,
                          textTransform: 'capitalize'
                        }}>{diff}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <AdminButton
                    title="Save Question"
                    onPress={handleAddQuestion}
                    variant="primary"
                    style={{ marginTop: 24, borderRadius: 12, height: 44 }}
                    icon={<Plus size={18} color="#ffffff" />}
                  />

                  <View style={{ height: 1, backgroundColor: theme.dark ? '#2d2b33' : '#EDE5F8', marginVertical: 20 }} />
                  <Text style={[styles.inputLabel, { marginTop: 0, marginBottom: 12, fontSize: 13, color: '#5D4BA3' }]}>Existing Questions</Text>
                </View>
              }
              renderItem={({ item, index }) => (
                <View style={[styles.chapterItem, { padding: 10, borderRadius: 12, marginBottom: 8 }]}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.dark ? '#312f36' : '#EDE5F8', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#5D4BA3' }}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.dark ? '#fdf7ff' : '#2D2560' }} numberOfLines={1}>
                      {item.question}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 2, alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: '#5D4BA3', fontWeight: '800' }}>
                        ANS: {item.correctAnswer}
                      </Text>
                      <View style={{ paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, backgroundColor: theme.dark ? '#312f36' : '#EDE5F8' }}>
                        <Text style={{ fontSize: 8, fontWeight: '800', color: '#5D4BA3', textTransform: 'uppercase' }}>{item.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteQuestion(item._id || item.id)} style={{ padding: 4 }}>
                    <Trash2 size={16} color="#ba1a1a" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Text style={{ color: '#797582', fontSize: 12, fontWeight: '600' }}>Empty bank</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
      {/* Options Modal */}
      <Modal
        visible={optionsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsVisible(false)}>
          <View style={styles.modalContentOptions}>
            <View style={styles.modalHeaderOptions}>
              <Text style={styles.modalTitleOptions}>Quiz Options</Text>
              <TouchableOpacity onPress={() => setOptionsVisible(false)}>
                <X size={20} color={theme.dark ? '#cac4d3' : '#797582'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => {
                setOptionsVisible(false);
                if (selectedQuiz) {
                  setEditingQuiz(selectedQuiz);
                  setQuizForm({
                    title: selectedQuiz.title,
                    description: selectedQuiz.description || '',
                    duration: selectedQuiz.duration?.toString() || '15',
                    difficulty: selectedQuiz.difficulty || 'medium',
                    level: selectedQuiz.level || 'intermediate',
                    passingScore: (selectedQuiz.passingScore || 70).toString(),
                  });
                  setTimeout(() => setShowAddModal(true), 300);
                }
              }}
            >
              <View style={styles.optionIconContainer}>
                <Edit3 size={18} color="#5D4BA3" />
              </View>
              <Text style={styles.optionText}>Edit Quiz Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => {
                setOptionsVisible(false);
                if (selectedQuiz) {
                  setTimeout(() => handleManageQuestions(selectedQuiz), 300);
                }
              }}
            >
              <View style={styles.optionIconContainer}>
                <HelpCircle size={18} color="#5D4BA3" />
              </View>
              <Text style={styles.optionText}>Manage Questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => {
                setOptionsVisible(false);
                if (selectedQuiz) {
                  setTimeout(() => handleDeleteQuiz(selectedQuiz._id || selectedQuiz.id, selectedQuiz.title), 300);
                }
              }}
            >
              <View style={[styles.optionIconContainer, styles.optionIconContainerDelete]}>
                <Trash2 size={18} color="#ba1a1a" />
              </View>
              <Text style={[styles.optionText, styles.optionTextDelete]}>Delete Quiz</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminQuizManagementScreen;
