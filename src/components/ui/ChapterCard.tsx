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
const CHAPTER_COLORS = {
  fill: '#F3F0FF', // Light purple/pink background like in the images
  stroke: '#8B5CF6', // Purple border
  text: '#000000', // Black text
  accent: '#8B5CF6', // Purple accent
  badgeBackground: '#FFFFFF', // White badge background
  badgeBorder: '#E5E7EB', // Light gray badge border
  progressBlue: '#3B82F6', // Blue for progress
  timeOrange: '#F59E0B', // Orange for time spent
};

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

  // Get colors based on status
  const fillColor = CHAPTER_COLORS.fill;
  const textColor = CHAPTER_COLORS.text;

  // Get status info
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.not_started;

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Get next status for cycling
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'not_started':
        return 'in_progress';
      case 'in_progress':
        return 'completed';
      case 'completed':
        return 'not_started';
      default:
        return 'in_progress';
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: fillColor }]}
        onPress={onChapterPress}
        activeOpacity={0.8}
      >
        {/* Main Content - Badge, Title and Description in one row */}
        <View style={styles.contentContainer}>
          <View style={styles.leftContent}>
            {/* Chapter Number Badge */}
            <View style={[styles.chapterBadge, { borderColor: CHAPTER_COLORS.badgeBorder }]}>
              <Text style={styles.chapterNumber}>{chapterNumber}</Text>
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={[styles.chapterTitle, { color: textColor }]}>
                {title}
              </Text>
              <Text style={[styles.chapterDescription, { color: textColor }]}>
                {content || "In this chapter you'll learn about the power of atom"}
              </Text>
            </View>
          </View>

          {/* Expand/Collapse Button */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={onExpandToggle}
          >
            <Icon
              name={expanded ? 'expand-less' : 'expand-more'}
              size={20}
              color="#000000"
            />
          </TouchableOpacity>
        </View>

        {/* Expanded Content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={[styles.expandedText, { color: textColor }]}>
              {content || "You want the modal form fields fully reordered in the HTML itself according to the sequence we discussed, with 'Points' renamed to 'Marks'."}
            </Text>

            {/* Status, Progress and Time Indicators */}
            <View style={styles.indicatorsContainer}>
              <TouchableOpacity
                style={styles.indicator}
                onPress={() => onStatusUpdate?.(getNextStatus(status) as 'not_started' | 'in_progress' | 'completed')}
                activeOpacity={0.7}
              >
                <Text style={[styles.indicatorLabel, { color: statusInfo.color }]}>
                  Status
                </Text>
                <View style={styles.statusRow}>
                  <Icon
                    name={statusInfo.icon}
                    size={16}
                    color={statusInfo.color}
                    style={styles.statusIcon}
                  />
                  <Text style={[styles.indicatorValue, { color: statusInfo.color }]}>
                    {statusInfo.display}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.indicator}>
                <Text style={[styles.indicatorLabel, { color: CHAPTER_COLORS.progressBlue }]}>
                  Progress
                </Text>
                <Text style={[styles.indicatorValue, { color: CHAPTER_COLORS.progressBlue }]}>
                  {progress}%
                </Text>
              </View>

              <View style={styles.indicator}>
                <Text style={[styles.indicatorLabel, { color: CHAPTER_COLORS.timeOrange }]}>
                  Time Spent
                </Text>
                <Text style={[styles.indicatorValue, { color: CHAPTER_COLORS.timeOrange }]}>
                  {formatTimeSpent(timeSpent)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Status Update Modal UI */}
      {showStatusModal && (
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="fade"
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Update Chapter Status</Text>

                  <ScrollView style={styles.statusOptionsContainer}>
                    {[
                      { key: 'not_started', label: 'Not Started' },
                      { key: 'in_progress', label: 'In Progress' },
                      { key: 'completed', label: 'Completed' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.statusOption,
                          status === option.key && styles.selectedStatusOption,
                        ]}
                        onPress={() => onStatusUpdate?.(option.key as 'not_started' | 'in_progress' | 'completed')}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          status === option.key && styles.selectedStatusOptionText,
                        ]}>
                          {option.label}
                        </Text>
                        {status === option.key && (
                          <Icon name="check" size={20} color="#8B5CF6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    marginBottom: 16,
    marginHorizontal: 4,
  },

  // Card styles
  card: {
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Content container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  chapterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CHAPTER_COLORS.badgeBackground,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
    color: '#000000',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 2,
    marginTop: 2,
  },
  chapterTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
    lineHeight: 18,
  },
  chapterDescription: {
    fontSize: RFValue(12),
    color: '#666666',
    lineHeight: 16,
  },

  // Expand button
  expandButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandedText: {
    fontSize: RFValue(14),
    color: '#000000',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Progress and time indicators
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  indicator: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 4,
    borderRadius: 6,
  },
  indicatorLabel: {
    fontSize: RFValue(12),
    fontWeight: '600',
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: RFValue(14),
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusOptionsContainer: {
    maxHeight: 300,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedStatusOption: {
    backgroundColor: '#F3F0FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  statusOptionText: {
    fontSize: RFValue(16),
    fontWeight: '500',
    color: '#000000',
  },
  selectedStatusOptionText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: RFValue(16),
    fontWeight: '500',
    color: '#666666',
  },
});

export default ChapterCard;
