import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import {
  getStudents,
  deleteStudent,
  createStudent,
  updateStudent,
  bulkDeleteStudents,
  getStudentProfile,
} from '../../../redux/reducers/adminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import AdminButton from '../ui/AdminButton';
import { AdminCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import { AdminInput } from '../ui/AdminInput';
import { Plus, Trash2, User, X, Search, CheckSquare, Square, Edit2 } from 'lucide-react-native';

interface Props {
  navigation: any;
}

const AdminStudentManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { students, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.admin
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student', isActivated: true });
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchStudents();
  }, [dispatch]);

  const fetchStudents = (query = searchQuery) => {
    dispatch(getStudents({
      page: pagination.page,
      limit: pagination.limit,
      search: query
    }));
  };

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchStudents(text);
    }, 500);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedIds.length} students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(bulkDeleteStudents(selectedIds));
              setSelectedIds([]);
              Alert.alert('Success', 'Students deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete students');
            }
          },
        },
      ]
    );
  };

  const handleEditPress = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      password: '',
      role: student.role || 'Student',
      isActivated: student.isActivated ?? true,
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    const isNew = !editingStudent;
    const errors: any = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (isNew && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingStudent) {
        await dispatch(updateStudent({ id: editingStudent.id, data: formData }));
        Alert.alert('Success', 'Student updated successfully');
      } else {
        await dispatch(createStudent(formData));
        Alert.alert('Success', 'Student created successfully');
      }
      setFormData({ name: '', email: '', password: '', role: 'Student', isActivated: true });
      setEditingStudent(null);
      setShowAddModal(false);
      setFormErrors({});
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingStudent ? 'update' : 'create'} student`);
    }
  };

  const handleViewDetails = async (student: any) => {
    if (!student.id && !student._id) {
      Alert.alert("Error", "Invalid student record: missing ID");
      return;
    }
    const studentId = student.id || student._id;
    setSelectedStudentDetails(student);
    setShowDetailsModal(true);
    try {
      const result: any = await dispatch(getStudentProfile(studentId)).unwrap();
      // Merge the details to preserve basic info if the profile response structure differs
      setSelectedStudentDetails({
        ...student,
        ...result,
        student: result.student || student // Ensure nested student field is also populated
      });
    } catch (error) {
      // Profile fetch error
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteStudent(id));
          },
        },
      ]
    );
  };

  const renderStudentItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <View style={[styles.studentListItem, isSelected && { backgroundColor: theme.dark ? '#25232a' : '#F0E9FA' }]}>
        <View style={styles.studentContent}>
          <TouchableOpacity
            onPress={() => toggleSelection(item.id)}
            style={{ padding: 4, marginRight: 8 }}
          >
            {isSelected ? (
              <CheckSquare size={18} color="#5D4BA3" />
            ) : (
              <Square size={18} color={theme.dark ? '#484551' : '#EDE5F8'} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.studentInfo}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.studentName} numberOfLines={1}>{item.name || item.email.split('@')[0]}</Text>
            <Text style={styles.studentEmail} numberOfLines={1}>{item.email}</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => handleEditPress(item)}
              style={styles.iconBtn}
            >
              <Edit2 size={16} color="#5D4BA3" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteStudent(item.id, item.name)}
              style={styles.iconBtn}
            >
              <Trash2 size={16} color="#ba1a1a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
      marginBottom: 12,
      gap: 12,
    },
    bulkDeleteBtn: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#ba1a1a',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    badgeCount: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#5D4BA3',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
    },
    badgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '800',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      borderRadius: 12,
      padding: 8,
      borderColor: theme.dark ? '#484551' : '#F0E9FA',
      borderWidth: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '900',
      color: '#5D4BA3',
      marginBottom: 0,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: theme.dark ? '#cac4d3' : '#9B96A8',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    studentListItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? '#2d2b33' : '#EDE5F8',
    },
    studentContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 2,
    },
    studentEmail: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
      marginTop: 1,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBtn: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
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
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.dark ? '#cac4d3' : '#797582',
      marginBottom: 8,
    },
    roleContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    roleChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      borderWidth: 1,
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
    },
    roleChipActive: {
      backgroundColor: '#5D4BA3',
      borderColor: '#5D4BA3',
    },
    roleChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    roleChipTextActive: {
      color: '#ffffff',
    },
    statusToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    toggleTrack: {
      width: 40,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.dark ? '#312f36' : '#EDE5F8',
      padding: 2,
      marginRight: 12,
    },
    toggleTrackActive: {
      backgroundColor: '#4CAF50',
    },
    toggleThumb: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#ffffff',
    },
    toggleThumbActive: {
      transform: [{ translateX: 18 }],
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    buttonRow: {
      marginTop: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Students"
        subtitle="Manage your learning community"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
          >
            <Plus size={22} color="#5D4BA3" />
          </TouchableOpacity>
        }
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && <AdminErrorBanner message={error} />}

          <View style={styles.searchRow}>
            <AdminInput
              placeholder={`Search ${pagination.total || 0} enrolled students...`}
              value={searchQuery}
              onChangeText={handleSearch}
              icon={<Search size={18} color="#cac4d3" />}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              hideLabel
            />
            {selectedIds.length > 0 && (
              <TouchableOpacity
                onPress={handleBulkDelete}
                style={styles.bulkDeleteBtn}
              >
                <Trash2 size={20} color="#ffffff" />
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{selectedIds.length}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>



          {isLoading && students.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#5D4BA3', marginTop: 20 }}>Loading directory...</Text>
          ) : students.length > 0 ? (
            <FlatList
              data={students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <AdminEmptyState
              title={searchQuery ? "No results found" : "Empty Workspace"}
              description={searchQuery ? "Try adjusting your search filters." : "Start by adding your first student to the ecosystem."}
              icon={<User size={64} color="#5D4BA3" />}
            />
          )}
        </ScrollView>
      </View>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingStudent(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingStudent ? 'Edit Student' : 'New Student'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                style={styles.closeButton}
              >
                <X size={18} color="#797582" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <AdminInput
                label="Full Name"
                placeholder="e.g. Johnathan Doe"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                error={formErrors.name}
              />

              <AdminInput
                label="Official Email"
                placeholder="student@edulearn.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                error={formErrors.email}
              />

              {!editingStudent && (
                <AdminInput
                  label="Security Password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  error={formErrors.password}
                />
              )}

              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.roleContainer}>
                {['Student', 'Admin', 'Instructor'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setFormData({ ...formData, role: r })}
                    style={[
                      styles.roleChip,
                      formData.role === r && styles.roleChipActive
                    ]}
                  >
                    <Text style={[
                      styles.roleChipText,
                      formData.role === r && styles.roleChipTextActive
                    ]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setFormData({ ...formData, isActivated: !formData.isActivated })}
                style={styles.statusToggle}
              >
                <View style={[styles.toggleTrack, formData.isActivated && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, formData.isActivated && styles.toggleThumbActive]} />
                </View>
                <Text style={styles.toggleLabel}>Account Activated</Text>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <AdminButton
                  title={editingStudent ? "Update Directory" : "Add to Directory"}
                  onPress={handleSubmit}
                  loading={isLoading}
                  size="large"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Student Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Student Profile</Text>
                <Text style={{ fontSize: 13, color: '#797582' }}>Comprehensive learning analytics</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <X size={18} color="#797582" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedStudentDetails && (
                <View>
                  {/* Header Profile */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: theme.dark ? '#25232a' : '#F8F6FD', borderRadius: 16 }}>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: theme.dark ? '#fdf7ff' : '#2D2560' }}>
                        {selectedStudentDetails.name || selectedStudentDetails.student?.name || (selectedStudentDetails.email || selectedStudentDetails.student?.email || '').split('@')[0]}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#797582' }}>{selectedStudentDetails.email || selectedStudentDetails.student?.email}</Text>
                      <View style={{ flexDirection: 'row', marginTop: 6 }}>

                        <View style={[styles.roleBadge, { backgroundColor: (selectedStudentDetails.isActivated ?? selectedStudentDetails.student?.isActivated) ? '#E8F5E9' : '#FFEBEE' }]}>
                          <Text style={[styles.roleText, { color: (selectedStudentDetails.isActivated ?? selectedStudentDetails.student?.isActivated) ? '#2E7D32' : '#C62828' }]}>
                            {(selectedStudentDetails.isActivated ?? selectedStudentDetails.student?.isActivated) ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Quick Stats */}
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <View style={[styles.statBox, { paddingVertical: 12 }]}>
                      <Text style={[styles.statNumber, { fontSize: 18 }]}>{selectedStudentDetails.analytics?.coursesCount || 0}</Text>
                      <Text style={styles.statLabel}>Courses</Text>
                    </View>
                    <View style={[styles.statBox, { paddingVertical: 12 }]}>
                      <Text style={[styles.statNumber, { fontSize: 18 }]}>{selectedStudentDetails.analytics?.quizzesDone || 0}</Text>
                      <Text style={styles.statLabel}>Quizzes</Text>
                    </View>
                    <View style={[styles.statBox, { paddingVertical: 12 }]}>
                      <Text style={[styles.statNumber, { fontSize: 18 }]}>{selectedStudentDetails.analytics?.avgScore || 0}%</Text>
                      <Text style={styles.statLabel}>Avg Score</Text>
                    </View>
                  </View>

                  {/* Section: Academic Progress */}
                  <Text style={[styles.inputLabel, { fontSize: 15, marginBottom: 16 }]}>Enrolled Courses</Text>
                  {selectedStudentDetails.enrolledCourses?.length > 0 ? (
                    selectedStudentDetails.enrolledCourses.map((course: any, idx: number) => (
                      <View key={course.id || `course-${idx}`} style={{ marginBottom: 12, padding: 12, backgroundColor: theme.dark ? '#25232a' : '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#EDE5F8' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.dark ? '#fdf7ff' : '#2D2560' }}>{course.title}</Text>
                        <View style={{ height: 6, backgroundColor: '#EDE5F8', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                          <View style={{ width: `${course.progress}%`, height: '100%', backgroundColor: '#5D4BA3' }} />
                        </View>
                        <Text style={{ fontSize: 11, color: '#797582', marginTop: 4 }}>{course.progress}% completed</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ fontSize: 13, color: '#797582', textAlign: 'center', marginBottom: 20 }}>No active enrollments found.</Text>
                  )}

                  {/* Section: Quiz Performance */}
                  <Text style={[styles.inputLabel, { fontSize: 15, marginBottom: 16, marginTop: 12 }]}>Recent Quiz Attempts</Text>
                  {selectedStudentDetails.quizAttempts?.length > 0 ? (
                    selectedStudentDetails.quizAttempts.map((attempt: any, index: number) => (
                      <View key={attempt.id || `quiz-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EDE5F8' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.dark ? '#fdf7ff' : '#2D2560' }}>{attempt.quizTitle}</Text>
                          <Text style={{ fontSize: 11, color: '#797582' }}>{new Date(attempt.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#5D4BA3' }}>{attempt.score}%</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ fontSize: 13, color: '#797582', textAlign: 'center', marginBottom: 20 }}>No quiz attempts recorded.</Text>
                  )}

                  <View style={{ height: 40 }} />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminStudentManagementScreen;
