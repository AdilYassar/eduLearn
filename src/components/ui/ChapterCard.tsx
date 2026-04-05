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
import { Circle, Clock, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

// Updated color scheme to match the UI images
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from './ThemedComponents';

// Status mapping for chapters
const STATUS_MAP = {
  not_started: { display: 'Not Started', icon: 'circle', color: '#6B7280' },
  in_progress: { display: 'In Progress', icon: 'clock', color: '#3B82F6' },
  completed: { display: 'Completed', icon: 'check-circle', color: '#10B981' },
};

// Helper component to render status icon
const StatusIcon = ({ iconName, color, size = 14 }: { iconName: string; color: string; size?: number }) => {
  switch (iconName) {
    case 'circle':
      return <Circle size={size} color={color} strokeWidth={2.5} />;
    case 'clock':
      return <Clock size={size} color={color} strokeWidth={2.5} />;
    case 'check-circle':
      return <CheckCircle size={size} color={color} strokeWidth={2.5} />;
    default:
      return <Circle size={size} color={color} strokeWidth={2.5} />;
  }
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
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

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

  const handleCardPress = () => {
    setShowPreviewModal(true);
  };

  const handleNavigateToDescription = () => {
    setShowPreviewModal(false);
    onChapterPress?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleCardPress}
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
              {expanded ? (
                <ChevronUp size={24} color={theme.text.secondary} strokeWidth={2} />
              ) : (
                <ChevronDown size={24} color={theme.text.secondary} strokeWidth={2} />
              )}
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
                    <View style={styles.statusIcon}>
                      <StatusIcon iconName={statusInfo.icon} color={statusInfo.color} size={14} />
                    </View>
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

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPreviewModal(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.previewModal, { backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff' }]}>
                {/* Modal Header */}
                <View style={styles.previewHeader}>
                  <View style={styles.previewBadge}>
                    <Text style={[styles.previewBadgeText, { color: theme.text.primary }]}>
                      Chapter {chapterNumber}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowPreviewModal(false)}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.text.secondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
                  {/* Title */}
                  <Text style={[styles.previewTitle, { color: theme.text.primary }]}>
                    {title}
                  </Text>

                  {/* Content Preview */}
                  <View style={styles.previewContentBox}>
                    <Text style={[styles.previewLabel, { color: theme.primary }]}>Content Overview</Text>
                    <Text style={[styles.previewDescription, { color: theme.text.primary }]}>
                      Learn about {title.toLowerCase()}, covering key topics, detailed explanations, and practical applications. Complete all lessons and exercises in this chapter to master the concepts.
                    </Text>
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.previewActions}>
                  {status === 'not_started' && (
                    <View style={styles.warningBox}>
                      <Text style={[styles.warningText, { color: theme.text.primary }]}>
                        📌 Start this chapter first. Complete any remaining previous chapters before moving ahead.
                      </Text>
                    </View>
                  )}
                  {status === 'completed' && (
                    <View style={styles.completedBox}>
                      <Text style={[styles.completedText, { color: '#10B981' }]}>
                        ✓ You've already completed this chapter! Move on to the next one for more learning.
                      </Text>
                    </View>
                  )}
                  {status === 'in_progress' && (
                    <View style={styles.buttonRowContainer}>
                      <TouchableOpacity
                        style={[styles.previewButton, styles.cancelPreviewButton, { borderColor: 'rgba(255,255,255,0.1)', flex: 1 }]}
                        onPress={() => setShowPreviewModal(false)}
                      >
                        <Text style={[styles.cancelPreviewButtonText, { color: theme.text.secondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.previewButton, styles.continueButton, { backgroundColor: theme.primary, flex: 1, marginLeft: 10 }]}
                        onPress={handleNavigateToDescription}
                      >
                        <Text style={styles.continueButtonText}>Continue →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    gap: 16,
  },
  indicator: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  indicatorLabel: {
    fontSize: RFValue(7.5),
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: RFValue(10),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  statusIcon: {
    marginRight: 2,
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
  previewModal: {
    borderRadius: 24,
    padding: 24,
    width: width * 0.88,
    maxHeight: '75%',
    marginHorizontal: 'auto',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  previewBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  closeButtonText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
  },
  previewContent: {
    maxHeight: '60%',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    fontFamily: 'Manrope-Bold',
    marginBottom: 16,
  },
  previewContentBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  previewLabel: {
    fontSize: RFValue(11),
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: RFValue(13),
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    opacity: 0.85,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: RFValue(9),
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueText: {
    fontSize: RFValue(12),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  previewActions: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 14,
  },
  buttonRowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  cancelPreviewButton: {
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cancelPreviewButtonText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  continueButton: {
    backgroundColor: '#10B981',
  },
  continueButtonText: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    width: '100%',
  },
  warningText: {
    fontSize: RFValue(11),
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    fontWeight: '500',
  },
  completedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    width: '100%',
  },
  completedText: {
    fontSize: RFValue(11),
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#3B82F6',
  },
});

export default ChapterCard;
