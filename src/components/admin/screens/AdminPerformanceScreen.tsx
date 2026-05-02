import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { getQuizSubmissions, getAnalytics } from '../../../redux/reducers/adminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import {
  Zap,
  BarChart3,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface Props {
  navigation: any;
}

const AdminPerformanceScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { quizSubmissions, analytics, isLoading, error } = useSelector(
    (state: RootState) => state.admin
  );
  const [refreshing, setRefreshing] = useState(false);

  const isDark = theme.dark;

  const fetchData = async () => {
    await Promise.all([
      dispatch(getAnalytics()),
      dispatch(getQuizSubmissions({ page: 1, limit: 10 })),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // ─── Palette ────────────────────────────────────────────────────────────────
  const C = {
    primary: '#5D4BA3',
    primary2: '#9179D1',
    primary3: '#C5B5ED',
    cardBg: isDark ? '#252329' : '#FFFFFF',
    pageBg: isDark ? '#1C1B21' : '#F8F6FD',
    border: isDark ? '#3A3740' : '#EDE5F8',
    chipBg: isDark ? '#312F36' : '#EDE5F8',
    textPrimary: isDark ? '#FDF7FF' : '#2D2560',
    textSecondary: isDark ? '#CAC4D3' : '#7B6EC4',
    textMuted: isDark ? '#79747E' : '#A8A4E8',
    pass: '#10B981',
    fail: '#EF4444',
    passBg: isDark ? '#0D2E22' : '#D1FAE5',
    failBg: isDark ? '#2E1010' : '#FEE2E2',
  };

  // ─── Chart config ────────────────────────────────────────────────────────────
  const chartConfig = {
    backgroundColor: C.cardBg,
    backgroundGradientFrom: C.cardBg,
    backgroundGradientTo: C.cardBg,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(93, 75, 163, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(202, 196, 211, ${opacity})`
        : `rgba(123, 110, 196, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2', stroke: '#5D4BA3' },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)',
      strokeWidth: 1,
    },
  };

  // ─── Submission row ──────────────────────────────────────────────────────────
  const renderSubmissionItem = ({ item }: { item: any }) => {
    const score = item.score || 0;
    const totalQuestions = item.totalQuestions || 1;
    const percentage = item.percentage
      ? Math.round(item.percentage)
      : Math.round((score / totalQuestions) * 100);
    const isPass = item.status?.toLowerCase() === 'pass';

    return (
      <View style={[styles.subRow, { backgroundColor: C.cardBg, borderColor: C.border }]}>
        {/* Left icon */}
        <View style={[styles.subIcon, { backgroundColor: isPass ? '#EDE5F8' : C.failBg }]}>
          <Award size={18} color={isPass ? C.primary : C.fail} />
        </View>

        {/* Info */}
        <View style={styles.subInfo}>
          <Text style={[styles.subName, { color: C.textPrimary }]} numberOfLines={1}>
            {item.user?.name || item.user?.email || 'Unknown Student'}
          </Text>
          <Text style={[styles.subQuiz, { color: C.textMuted }]} numberOfLines={1}>
            {item.quiz?.title
              ? item.quiz.title.length > 28
                ? item.quiz.title.substring(0, 28) + '…'
                : item.quiz.title
              : 'General Assessment'}
          </Text>
        </View>

        {/* Score pill */}
        <View style={[styles.subPill, { backgroundColor: isPass ? C.passBg : C.failBg }]}>
          <View style={[styles.subPillDot, { backgroundColor: isPass ? C.pass : C.fail }]} />
          <Text style={[styles.subPillText, { color: isPass ? C.pass : C.fail }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    );
  };

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.pageBg,
    },

    // ── scroll ──
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32,
    },

    // ── error ──
    errorWrap: { marginBottom: 16 },

    // ── section header ──
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: C.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    sectionBadge: {
      fontSize: 11,
      fontWeight: '600',
      color: C.primary,
      backgroundColor: C.chipBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 99,
      overflow: 'hidden',
    },

    // ── chart card ──
    chartCard: {
      backgroundColor: C.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: C.border,
      padding: 18,
      marginBottom: 16,
      overflow: 'hidden',
    },
    chartTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    chartIconWrap: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor: C.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: C.textPrimary,
      flex: 1,
    },

    // ── legend ──
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 14,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 2,
    },
    legendText: {
      fontSize: 11,
      fontWeight: '600',
      color: C.textSecondary,
    },

    // ── divider ──
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginVertical: 20,
    },

    // ── submission rows ──
    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
      marginBottom: 10,
      gap: 12,
    },
    subIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subInfo: { flex: 1, minWidth: 0 },
    subName: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    subQuiz: {
      fontSize: 11,
      fontWeight: '500',
    },
    subPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 99,
    },
    subPillDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    subPillText: {
      fontSize: 12,
      fontWeight: '800',
    },

    // ── loader ──
    loader: { marginVertical: 48 },

    // ── empty ──
    emptyWrap: { marginTop: 16 },
  });

  const chartWidth = screenWidth - 68;

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Performance"
        subtitle="Live Analytical Metrics"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {/* ── Error ── */}
        {error && (
          <View style={styles.errorWrap}>
            <AdminErrorBanner message={error} />
          </View>
        )}

        {/* ── Loading skeleton ── */}
        {isLoading && !analytics && (
          <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
        )}

        {analytics && (
          <>
            {/* ══════════════════════════════════════════
                LINE CHART — Registration Trend
            ══════════════════════════════════════════ */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Registration Trend</Text>
              <Text style={styles.sectionBadge}>Last 6 months</Text>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartTitleRow}>
                <View style={styles.chartIconWrap}>
                  <TrendingUp size={15} color={C.primary} />
                </View>
                <Text style={styles.chartTitle}>Student Sign-ups</Text>
              </View>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.primary }]} />
                  <Text style={styles.legendText}>New registrations</Text>
                </View>
              </View>
              <LineChart
                data={{
                  labels: analytics.registrationTrend.labels,
                  datasets: [{ data: analytics.registrationTrend.data }],
                }}
                width={chartWidth}
                height={200}
                chartConfig={chartConfig}
                bezier
                withInnerLines
                withOuterLines={false}
                withShadow={false}
                style={{ borderRadius: 16, marginLeft: -10 }}
              />
            </View>

            {/* ══════════════════════════════════════════
                PIE CHART — Content Distribution
            ══════════════════════════════════════════ */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Content Mix</Text>
              <Text style={styles.sectionBadge}>Platform-wide</Text>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartTitleRow}>
                <View style={styles.chartIconWrap}>
                  <BarChart3 size={15} color={C.primary} />
                </View>
                <Text style={styles.chartTitle}>Content Distribution</Text>
              </View>
              <View style={styles.legend}>
                {[C.primary, C.primary2, C.primary3].map((col, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: col }]} />
                    <Text style={styles.legendText}>
                      {analytics.contentDistribution[i]?.label}
                    </Text>
                  </View>
                ))}
              </View>
              <PieChart
                data={analytics.contentDistribution.map((item, index) => ({
                  name: item.label,
                  population: item.value,
                  color: [C.primary, C.primary2, C.primary3][index] ?? '#888',
                  legendFontColor: C.textSecondary,
                  legendFontSize: 12,
                }))}
                width={chartWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* ══════════════════════════════════════════
                BAR CHART — Quiz Performance
            ══════════════════════════════════════════ */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quiz Performance</Text>
              <Text style={styles.sectionBadge}>All time</Text>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartTitleRow}>
                <View style={styles.chartIconWrap}>
                  <Zap size={15} color={C.primary} />
                </View>
                <Text style={styles.chartTitle}>Pass vs Fail</Text>
              </View>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.primary }]} />
                  <Text style={styles.legendText}>
                    Pass — {analytics.quizPerformance.data[0]}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.fail }]} />
                  <Text style={styles.legendText}>
                    Fail — {analytics.quizPerformance.data[1]}
                  </Text>
                </View>
              </View>
              <BarChart
                data={{
                  labels: analytics.quizPerformance.labels.map(
                    l => l.charAt(0).toUpperCase() + l.slice(1)
                  ),
                  datasets: [{ data: analytics.quizPerformance.data }],
                }}
                width={chartWidth}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  // Pass bar = purple, Fail bar = red via fillShadowGradient trick
                  fillShadowGradient: C.primary,
                  fillShadowGradientOpacity: 1,
                }}
                showValuesOnTopOfBars
                withInnerLines
                fromZero
                style={{ borderRadius: 16, marginLeft: -10 }}
              />
            </View>
          </>
        )}

        {/* ══════════════════════════════════════════
            RECENT SUBMISSIONS LIST
        ══════════════════════════════════════════ */}
        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Evaluations</Text>
          {quizSubmissions && quizSubmissions.length > 0 && (
            <Text style={styles.sectionBadge}>
              {quizSubmissions.slice(0, 5).length} entries
            </Text>
          )}
        </View>

        {quizSubmissions && quizSubmissions.length > 0 ? (
          <FlatList
            data={quizSubmissions.slice(0, 5)}
            renderItem={renderSubmissionItem}
            keyExtractor={item => item._id || item.id}
            scrollEnabled={false}
          />
        ) : (
          !isLoading && (
            <View style={styles.emptyWrap}>
              <AdminEmptyState
                title="Awaiting Evaluations"
                description="Recent quiz submissions will be indexed here for analysis."
                icon={<BarChart3 size={56} color={C.primary} />}
              />
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminPerformanceScreen;