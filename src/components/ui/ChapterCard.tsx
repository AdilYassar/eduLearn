import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

// Updated color scheme to match the UI images
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from './ThemedComponents';

// Status mapping for chapters
const STATUS_MAP = {
  not_started: { display: 'Not Started', icon: 'radio-button-unchecked', color: '#6B7280' },
  in_progress: { display: 'In Progress', icon: 'play-circle-filled', color: '#3B82F6' },
  completed: { display: 'Completed', icon: 'check-circle', color: '#10B981' },
};

export type ChapterCardProps = {
  _id: string;
  title: string;
  content: string;
  _course: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
  chapterNumber: number;
  expanded?: boolean;
  showStatusModal?: boolean;
  onChapterPress?: () => void;
  onStatusUpdate?: (status: 'not_started' | 'in_progress' | 'completed') => void;
  onExpandToggle?: () => void;
  isUpdating?: boolean;
};

const ChapterCard: React.FC<ChapterCardProps> = ({
  _id,
  title,
  content,
  _course,
  status = 'not_started',
  progress = 0,
  timeSpent = 0,
  startedAt: _startedAt,
  completedAt: _completedAt,
  lastAccessedAt: _lastAccessedAt,
  chapterNumber,
  expanded = false,
  showStatusModal = false,
  onChapterPress,
  onStatusUpdate,
  onExpandToggle,
  isUpdating: _isUpdating = false,
}) => {
  const { theme } = useTheme();

  // Get status info
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.not_started;

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'not_started': return 'in_progress';
      case 'in_progress': return 'completed';
      case 'completed': return 'not_started';
      default: return 'in_progress';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onChapterPress}
        activeOpacity={0.9}
      >
        <GlassCard 
            style={styles.card} 
            opacity={0.05}
            glow={status === 'completed'}
            glowColor={STATUS_MAP.completed.color}
        >
          {/* Main Content */}
          <View style={styles.contentContainer}>
            <View style={styles.leftContent}>
              {/* Chapter Number Badge */}
              <View style={[styles.chapterBadge, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.chapterNumber, { color: theme.text.primary }]}>{chapterNumber}</Text>
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <Text style={[styles.chapterTitle, { color: theme.text.primary }]}>
                  {title}
                </Text>
                <Text 
                    numberOfLines={1}
                    style={[styles.chapterDescription, { color: theme.text.secondary }]}
                >
                  {content || "Explore neural module insights..."}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.expandButton}
              onPress={onExpandToggle}
            >
              <Icon
                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color={theme.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Expanded Content */}
          {expanded && (
            <View style={[styles.expandedContent, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[styles.expandedText, { color: theme.text.primary }]}>
                {content || "Detailed neural data for this chapter is being synchronized with your dashboard."}
              </Text>

              {/* Status, Progress and Time Indicators */}
              <View style={styles.indicatorsContainer}>
                <TouchableOpacity
                  style={styles.indicator}
                  onPress={() => onStatusUpdate?.(getNextStatus(status) as any)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.indicatorLabel, { color: statusInfo.color }]}>STATUS</Text>
                  <View style={styles.statusRow}>
                    <Icon name={statusInfo.icon} size={14} color={statusInfo.color} style={styles.statusIcon} />
                    <Text style={[styles.indicatorValue, { color: statusInfo.color }]}>{statusInfo.display}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.indicator}>
                  <Text style={[styles.indicatorLabel, { color: theme.primary }]}>PROGRESS</Text>
                  <Text style={[styles.indicatorValue, { color: theme.text.primary }]}>{progress}%</Text>
                </View>

                <View style={styles.indicator}>
                  <Text style={[styles.indicatorLabel, { color: '#F59E0B' }]}>TIME</Text>
                  <Text style={[styles.indicatorValue, { color: theme.text.primary }]}>{formatTimeSpent(timeSpent)}</Text>
                </View>
              </View>
            </View>
          )}
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 0,
    marginVertical: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  chapterBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumber: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  textContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: RFValue(15),
    fontWeight: 'bold',
    fontFamily: 'Manrope-Bold',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: RFValue(11),
    fontFamily: 'Inter-Medium',
    opacity: 0.7,
  },
  expandButton: {
    padding: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  expandedText: {
    fontSize: RFValue(13),
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.9,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicator: {
    flex: 1,
  },
  indicatorLabel: {
    fontSize: RFValue(9),
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  indicatorValue: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusOptionsContainer: {
    maxHeight: 300,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  selectedStatusOption: {
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1.5,
    borderColor: '#2DD4BF',
  },
  statusOptionText: {
    fontSize: RFValue(14),
    fontWeight: '600',
  },
  selectedStatusOptionText: {
    color: '#2DD4BF',
  },
  modalButtons: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelButtonText: {
    fontSize: RFValue(14),
    fontWeight: '600',
  },
});

export default ChapterCard;
