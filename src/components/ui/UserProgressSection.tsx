import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
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
  
  if (userData.role !== 'Student') {
    return null;
  }

  return (
    <>
      {/* 6. USER PROGRESS SECTION */}
      <View style={styles.sectionLabelContainer}>
        <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>USER PROGRESS</Text>
      </View>
      <GlassCard
        style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 20 }]}
        opacity={0.05}
        glow={false}
      >
        {/* Title with Subtitle */}
        <View style={styles.learningStatsHeader}>
          <Text style={[styles.learningStatsTitle, { color: theme.text.primary }]}>Learning Statistics</Text>
          <Text style={[styles.learningStatsSubtitle, { color: theme.text.secondary }]}>All time</Text>
        </View>

        {/* Donut Chart + Legend */}
        <View style={styles.chartAndLegendContainer}>
          {/* Donut SVG Chart */}
          <View style={styles.donutChartContainer}>
            <Svg width="100" height="100" viewBox="0 0 100 100">
              {/* Arc segments for 4 colored segments - Adjusting dasharray based on actual data if possible, but keeping same visual for now */}
              <Circle cx="50" cy="50" r="35" fill="none" stroke="#8B5CF6" strokeWidth="8" strokeDasharray="50 360" />
              <Circle cx="50" cy="50" r="35" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray="30 360" strokeDashoffset="-50" />
              <Circle cx="50" cy="50" r="35" fill="none" stroke="#F97316" strokeWidth="8" strokeDasharray="20 360" strokeDashoffset="-80" />
              <Circle cx="50" cy="50" r="35" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="10 360" strokeDashoffset="-100" />

              {/* Center text */}
              <SvgText x="50" y="45" textAnchor="middle" fontSize="14" fill={theme.text.primary} fontWeight="700">
                {userData.enrollmentCount || 0}
              </SvgText>
              <SvgText x="50" y="60" textAnchor="middle" fontSize="12" fill={theme.text.secondary}>
                courses
              </SvgText>
            </Svg>
          </View>

          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Enrolled</Text>
                <Text style={[styles.legendValue, { color: theme.text.primary }]}>{userData.enrollmentCount || 0}</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Quizzes</Text>
                <Text style={[styles.legendValue, { color: theme.text.primary }]}>{userData.totalQuizzesTaken || 0}</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Chapters</Text>
                <Text style={[styles.legendValue, { color: theme.text.primary }]}>{userData.totalChaptersCompleted || 0}</Text>
              </View>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>Avg Score</Text>
                <Text style={[styles.legendValue, { color: theme.text.primary }]}>{userData.averageScore || 0}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Grid - 3x2 */}
        <View style={styles.statsGrid}>
          {/* Enrolled Courses */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{userData.enrollmentCount || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Enrolled</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#8B5CF6' }]} />
          </View>

          {/* Quizzes Taken */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#22C55E' }]}>{userData.totalQuizzesTaken || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Quizzes</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#22C55E' }]} />
          </View>

          {/* Chapters Done */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: 'rgba(249, 115, 22, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#F97316' }]}>{userData.totalChaptersCompleted || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Chapters</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#F97316' }]} />
          </View>

          {/* Avg Score */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{userData.averageScore || 0}%</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Avg Score</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#3B82F6' }]} />
          </View>

          {/* Learning Streak */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(236, 72, 153, 0.08)', borderColor: 'rgba(236, 72, 153, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#EC4899' }]}>{userData.learningStreak || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Streak</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#EC4899' }]} />
          </View>

          {/* Learning Days */}
          <View style={[styles.statBox, { backgroundColor: 'rgba(14, 165, 233, 0.08)', borderColor: 'rgba(14, 165, 233, 0.1)' }]}>
            <Text style={[styles.statNumber, { color: '#0EA5E9' }]}>{userData.totalLearningDays || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Days</Text>
            <View style={[styles.statBottomBar, { backgroundColor: '#0EA5E9' }]} />
          </View>
        </View>
      </GlassCard>

      {/* 7. ENROLLMENT DETAILS SECTION */}
      {enrollmentStats && (
        <>
          <View style={styles.sectionLabelContainer}>
            <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ENROLLMENT DETAILS</Text>
          </View>
          <GlassCard
            style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 20 }]}
            opacity={0.05}
            glow={false}
          >
            <View style={styles.enrollmentTopRow}>
              <View>
                <Text style={[styles.enrollmentLabel, { color: theme.text.secondary }]}>Total Enrollments</Text>
                <Text style={[styles.enrollmentNumber, { color: theme.primary }]}>
                  {enrollmentStats.totalEnrollments || 0}
                </Text>
              </View>
              <View style={styles.progressPercentageContainer}>
                <Text style={[styles.progressPercentage, { color: '#22C55E' }]}>
                  {enrollmentStats.totalEnrollments ? Math.round(((enrollmentStats.completedCourses || 0) / enrollmentStats.totalEnrollments) * 100) : 0}%
                </Text>
                <Text style={[styles.progressSubtitle, { color: theme.text.secondary }]}>overall completion</Text>
              </View>
            </View>

            <View style={[styles.enrollmentProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <View 
                style={[
                  styles.enrollmentProgressFill, 
                  { 
                    width: `${enrollmentStats.totalEnrollments ? Math.round(((enrollmentStats.completedCourses || 0) / enrollmentStats.totalEnrollments) * 100) : 0}%`, 
                    backgroundColor: theme.primary 
                  }
                ]} 
              />
            </View>

            {enrollmentStats.lastEnrollment && (
              <View style={[styles.latestEnrolledCard, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.07)' }]}>
                <Text style={[styles.latestEnrolledLabel, { color: theme.text.secondary }]}>LATEST ENROLLED</Text>
                <Text style={[styles.latestEnrolledCourse, { color: theme.text.primary }]}>
                  📚 {enrollmentStats.lastEnrollment.title || 'N/A'}
                </Text>
                {enrollmentStats.lastEnrollment.description && (
                  <Text style={[styles.latestEnrolledDesc, { color: theme.text.secondary }]}>
                    {enrollmentStats.lastEnrollment.description}
                  </Text>
                )}
              </View>
            )}
          </GlassCard>
        </>
      )}

      {/* 8. ENROLLED COURSES SECTION */}
      <View style={styles.sectionLabelContainer}>
        <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>ENROLLED COURSES</Text>
      </View>
      {userData.enrolledCourses && userData.enrolledCourses.length > 0 ? (
        userData.enrolledCourses.map((item, index) => {
          const progressColors = ['#EC4899', '#0EA5E9', '#8B5CF6', '#22C55E', '#F97316'];
          const color = progressColors[index % progressColors.length];
          const progress = item.progress || 0;

          return (
            <GlassCard
              key={item._id || index}
              style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 16 }]}
              opacity={0.05}
              glow={false}
            >
              <View style={styles.courseCardHeader}>
                <Text style={[styles.courseCardName, { color: theme.text.primary }]}>{item.title || 'Course'}</Text>
                <Text style={[styles.courseCardPercentage, { color: color }]}>{progress}%</Text>
              </View>
              <View style={[styles.courseProgressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.courseProgressFill, { width: `${progress}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.courseCardDesc, { color: theme.text.secondary }]} numberOfLines={2}>
                {item.description || 'No description available'}
              </Text>
            </GlassCard>
          );
        })
      ) : (
        <GlassCard
          style={[styles.cardWithBorder, { borderColor: 'rgba(255,255,255,0.07)', padding: 16 }]}
          opacity={0.05}
          glow={false}
        >
          <Text style={{ color: theme.text.secondary, textAlign: 'center' }}>No courses enrolled yet</Text>
        </GlassCard>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionLabelContainer: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.5,
  },
  cardWithBorder: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  learningStatsHeader: {
    marginBottom: 20,
  },
  learningStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  learningStatsSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  chartAndLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 20,
  },
  donutChartContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartLegend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  statBox: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  statBottomBar: {
    width: '70%',
    height: 2,
    borderRadius: 1,
  },
  enrollmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  enrollmentLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  enrollmentNumber: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  progressPercentageContainer: {
    alignItems: 'flex-end',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  progressSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  enrollmentProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  enrollmentProgressFill: {
    height: '100%',
  },
  latestEnrolledCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  latestEnrolledLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  latestEnrolledCourse: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  latestEnrolledDesc: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  courseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseCardName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  courseCardPercentage: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  courseProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  courseCardDesc: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
});

export default UserProgressSection;
