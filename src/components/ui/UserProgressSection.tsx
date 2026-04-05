import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ThemedText as Text, GlassCard } from './ThemedComponents';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  
  // Custom neon chart colors that pop on dark mode
  const statColors = {
    color1: '#5B4CDB',
    color2: '#4DBAB8',
    color3: '#F5A962',
    color4: '#E8C368',
    color5: '#F4988C',
    color6: '#D95F9F',
  };

  if (userData.role !== 'Student') {
    return null;
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionHeaderTitle, { color: theme.text.primary }]}>📊 User Progress</Text>

      {/* Learning Statistics for Students */}
      <GlassCard style={[styles.statisticsCard, { borderColor: theme.primary + '40' }]} opacity={0.03} glow={true}>
        <Text style={[styles.statisticsTitle, { color: theme.primary }]}>Learning Statistics</Text>

        <View style={styles.chartContainer}>
          <Svg width="150" height="150" viewBox="0 0 150 150">
            <G rotation="0" origin="75, 75">
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color1} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="0"
              />
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color2} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="-62.8"
              />
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color3} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="-125.6"
              />
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color4} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="-188.4"
              />
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color5} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="-251.2"
              />
              <Circle
                cx="75" cy="75" r="60"
                stroke={statColors.color6} strokeWidth="20" fill="none"
                strokeDasharray="62.8 314.8" strokeDashoffset="-314"
              />
            </G>
          </Svg>
        </View>

        <View style={styles.statsGrid}>
          {/* Row 1 */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color1 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Enrolled{'\n'}Courses</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.enrollmentCount || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color1 }]} />
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color2 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Quizzes{'\n'}Taken</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.totalQuizzesTaken || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color2 }]} />
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color3 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Chapters{'\n'}Completed</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.totalChaptersCompleted || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color3 }]} />
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color4 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Average{'\n'}Score</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.averageScore || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color4 }]} />
              </View>
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color5 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Learning{'\n'}Streak</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.learningStreak || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color5 }]} />
              </View>
            </View>

            <View style={[styles.statItem, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={styles.statHeader}>
                <View style={[styles.colorIndicator, { backgroundColor: statColors.color6 }]} />
                <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Learning{'\n'}Days</Text>
              </View>
              <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>{String(userData.totalLearningDays || 0)}</Text>
                <View style={[styles.statUnderline, { backgroundColor: statColors.color6 }]} />
              </View>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Enrollment Statistics from API */}
      {enrollmentStats && (
        <GlassCard style={[styles.enrollmentCard, { borderColor: 'rgba(76, 175, 80, 0.4)' }]} opacity={0.03}>
          <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Enrollment Details</Text>

          <View style={styles.enrollmentStatRow}>
            <View style={styles.enrollmentStatLeft}>
              <Text style={[styles.enrollmentLabel, { color: theme.text.secondary }]}>Total Enrollments</Text>
              <Text style={styles.enrollmentValue}>{String(enrollmentStats.totalEnrollments || 0)}</Text>
            </View>
            <View style={styles.enrollmentProgressContainer}>
              <View style={[styles.enrollmentProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
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

          {enrollmentStats.lastEnrollment && (
            <View style={[styles.lastEnrollmentBox, { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderLeftColor: '#4CAF50' }]}>
              <Text style={[styles.lastEnrollmentLabel, { color: theme.text.secondary }]}>Latest Enrolled Course</Text>
              <Text style={[styles.lastEnrollmentTitle, { color: theme.text.primary }]}>
                📚 {enrollmentStats.lastEnrollment.title || 'N/A'}
              </Text>
              {enrollmentStats.lastEnrollment.description && (
                <Text style={[styles.lastEnrollmentDescription, { color: theme.text.secondary }]}>
                  {enrollmentStats.lastEnrollment.description}
                </Text>
              )}
            </View>
          )}
        </GlassCard>
      )}

      {/* Enrolled Courses */}
      <GlassCard style={[styles.enrolledCoursesCard, { borderColor: 'rgba(255, 152, 0, 0.4)' }]} opacity={0.03} glow={true}>
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>Enrolled Courses</Text>
        {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
          userData.enrolledCourses.map((item, index) => {
            const progressColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
            const progressPercentage = item.progress || Math.floor(Math.random() * 100);

            return (
              <View key={String(item._id || item.courseId || index)} style={[styles.courseProgressItem, { backgroundColor: 'rgba(255,255,255,0.03)', borderLeftColor: '#FF9800' }]}>
                <View style={styles.courseProgressHeader}>
                  <Text style={[styles.courseProgressTitle, { color: theme.text.primary }]}>
                    {item.title || `Course ${index + 1}`}
                  </Text>
                  <Text style={styles.courseProgressPercentage}>{progressPercentage}%</Text>
                </View>

                <View style={styles.courseProgressBarContainer}>
                  <View style={[styles.courseProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
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
                  <Text style={[styles.courseProgressDescription, { color: theme.text.secondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {item.enrolledAt && (
                  <Text style={[styles.courseProgressDate, { color: theme.text.secondary }]}>
                    Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.noCoursesContainer}>
            <Text style={[styles.noCoursesText, { color: theme.text.primary }]}>No courses enrolled yet</Text>
            <Text style={[styles.noCoursesSubtext, { color: theme.text.secondary }]}>Start your learning journey today!</Text>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 24,
    fontFamily: 'Inter-Bold',
  },
  statisticsCard: {
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
     alignItems: 'center', // ← add this
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
      alignItems: 'center', // ← add this
  width: '100%',        // ← add this so rows still stretch full width
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    flex: 1,
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
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  statValueContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  statUnderline: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  enrollmentCard: {
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  lastEnrollmentLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  lastEnrollmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Inter-Bold',
  },
  lastEnrollmentDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  enrolledCoursesCard: {
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  courseProgressItem: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
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
    borderRadius: 5,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  courseProgressDescription: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  courseProgressDate: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
  noCoursesContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noCoursesText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  noCoursesSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default UserProgressSection;
