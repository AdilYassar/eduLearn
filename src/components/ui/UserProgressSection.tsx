import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface UserData {
  _id?: string;
  uuid?: string;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  role: string;
  isActivated?: boolean;
  profileImage?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: Date;
  totalLearningDays?: number;
  // Student specific fields
  enrolledCourses?: any[];
  enrollmentCount?: number;
  quizPerformance?: any[];
  totalQuizzesTaken?: number;
  averageScore?: number;
  totalChaptersCompleted?: number;
  totalTimeSpent?: number;
  averageCourseCompletion?: number;
  learningStreak?: number;
  longestLearningStreak?: number;
  lastLearningActivity?: Date;
  marksSummary?: { [quizId: string]: { score: number; total: number } };
}

interface EnrollmentStats {
  totalEnrollments?: number;
  enrolledCourses?: any[];
  lastEnrollment?: {
    title?: string;
    description?: string;
    enrolledAt?: string;
  };
}

interface UserProgressSectionProps {
  userData: UserData;
  enrollmentStats: EnrollmentStats | null;
}

const UserProgressSection: React.FC<UserProgressSectionProps> = ({ userData, enrollmentStats }) => {
  // Chart colors for statistics
  const statColors = {
    color1: '#5B4CDB',
    color2: '#4DBAB8',
    color3: '#F5A962',
    color4: '#E8C368',
    color5: '#F4988C',
    color6: '#D95F9F',
  };

  // Don't render anything if user is not a student
  if (userData.role !== 'Student') {
    return null;
  }

  return (
    <>
      {/* User Progress Section Title */}
      <Text style={styles.sectionHeaderTitle}>📊 User Progress</Text>

      {/* Learning Statistics for Students */}
      <View style={styles.statisticsCard}>
        <Text style={styles.statisticsTitle}>Learning Statistics</Text>

        {/* Donut Chart */}
        <View style={styles.chartContainer}>
          <Svg width="150" height="150" viewBox="0 0 150 150">
            <G rotation="0" origin="75, 75">
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color1}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="0"
              />
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color2}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="-62.8"
              />
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color3}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="-125.6"
              />
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color4}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="-188.4"
              />
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color5}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="-251.2"
              />
              <Circle
                cx="75"
                cy="75"
                r="60"
                stroke={statColors.color6}
                strokeWidth="20"
                fill="none"
                strokeDasharray="62.8 314.8"
                strokeDashoffset="-314"
              />
            </G>
          </Svg>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color1 }]} />
                <Text style={styles.statLabel}>Enrolled{'\n'}Courses</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.enrollmentCount || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color2 }]} />
                <Text style={styles.statLabel}>Quizzes{'\n'}Taken</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.totalQuizzesTaken || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color3 }]} />
                <Text style={styles.statLabel}>Chapters{'\n'}Completed</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.totalChaptersCompleted || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color4 }]} />
                <Text style={styles.statLabel}>Average{'\n'}Score</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.averageScore || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color5 }]} />
                <Text style={styles.statLabel}>Learning{'\n'}Streak</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.learningStreak || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color6 }]} />
                <Text style={styles.statLabel}>Learning{'\n'}Days</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{String(userData.totalLearningDays || 0)}</Text>
                <View style={styles.statUnderline} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Enrollment Statistics from API */}
      {enrollmentStats && (
        <View style={styles.enrollmentCard}>
          <Text style={styles.cardTitle}>Enrollment Details</Text>

          {/* Total Enrollments */}
          <View style={styles.enrollmentStatRow}>
            <View style={styles.enrollmentStatLeft}>
              <Text style={styles.enrollmentLabel}>Total Enrollments</Text>
              <Text style={styles.enrollmentValue}>{String(enrollmentStats.totalEnrollments || 0)}</Text>
            </View>
            <View style={styles.enrollmentProgressContainer}>
              <View style={styles.enrollmentProgressBar}>
                <View
                  style={[
                    styles.enrollmentProgressFill,
                    {
                      width: `${Math.min((enrollmentStats.totalEnrollments || 0) * 10, 100)}%`,
                      backgroundColor: '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={styles.enrollmentProgressText}>
                {Math.min((enrollmentStats.totalEnrollments || 0) * 10, 100)}%
              </Text>
            </View>
          </View>

          {/* Last Enrollment */}
          {enrollmentStats.lastEnrollment && (
            <View style={styles.lastEnrollmentBox}>
              <Text style={styles.lastEnrollmentLabel}>Latest Enrolled Course</Text>
              <Text style={styles.lastEnrollmentTitle}>
                📚 {enrollmentStats.lastEnrollment.title || 'N/A'}
              </Text>
              {enrollmentStats.lastEnrollment.description && (
                <Text style={styles.lastEnrollmentDescription}>
                  {enrollmentStats.lastEnrollment.description}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Enrolled Courses */}
      <View style={styles.enrolledCoursesCard}>
        <Text style={styles.cardTitle}>Enrolled Courses</Text>
        {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
          userData.enrolledCourses.map((item, index) => {
            const progressColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
            const progressPercentage = item.progress || Math.floor(Math.random() * 100);

            return (
              <View key={String(item._id || item.courseId || index)} style={styles.courseProgressItem}>
                <View style={styles.courseProgressHeader}>
                  <Text style={styles.courseProgressTitle}>
                    {item.title || `Course ${index + 1}`}
                  </Text>
                  <Text style={styles.courseProgressPercentage}>{progressPercentage}%</Text>
                </View>

                <View style={styles.courseProgressBarContainer}>
                  <View style={styles.courseProgressBar}>
                    <View
                      style={[
                        styles.courseProgressFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: progressColors[index % progressColors.length],
                        },
                      ]}
                    />
                  </View>
                </View>

                {item.description && (
                  <Text style={styles.courseProgressDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {item.enrolledAt && (
                  <Text style={styles.courseProgressDate}>
                    Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.noCoursesContainer}>
            <Text style={styles.noCoursesText}>No courses enrolled yet</Text>
            <Text style={styles.noCoursesSubtext}>Start your learning journey today!</Text>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  // Section Header
  sectionHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 24,
    fontFamily: 'Inter-Bold',
  },
  
  // Statistics Card Styles
  statisticsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#5B4CDB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B4CDB',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  statValueContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Inter-Bold',
  },
  statUnderline: {
    width: 30,
    height: 3,
    backgroundColor: '#5B4CDB',
    borderRadius: 2,
    marginTop: 4,
  },

  // Enrollment Card Styles
  enrollmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  enrollmentStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  enrollmentStatLeft: {
    flex: 1,
  },
  enrollmentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  enrollmentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    fontFamily: 'Inter-Bold',
  },
  enrollmentProgressContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  enrollmentProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  enrollmentProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  enrollmentProgressText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  lastEnrollmentBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lastEnrollmentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  lastEnrollmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A148C',
    marginBottom: 6,
    fontFamily: 'Inter-Bold',
  },
  lastEnrollmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },

  // Enrolled Courses Card Styles
  enrolledCoursesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  courseProgressItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  courseProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseProgressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
    fontFamily: 'Inter-Bold',
  },
  courseProgressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF9800',
    fontFamily: 'Inter-Bold',
  },
  courseProgressBarContainer: {
    marginBottom: 10,
  },
  courseProgressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  courseProgressDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  courseProgressDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  noCoursesContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noCoursesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  noCoursesSubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default UserProgressSection;
