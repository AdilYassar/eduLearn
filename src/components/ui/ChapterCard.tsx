import { Colors } from '@utils/Constants';
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

const { width } = Dimensions.get('window');

// Orange color scheme for chapters
const ORANGE_COLORS = {
//   fill: '#FFE4CC', // Light orange background
//   stroke: '#FF9500', // Orange border
//   text: '#000000', // Black text
//   accent: '#FF9500', // Orange accent
  fill: Colors.teal_200, // Light orange background
  stroke: Colors.primary_dark, // Orange border
  text: '#000000', // Black text
  accent: Colors.secondary_dark, // Orange accent
};

// Status mapping for chapters
const STATUS_MAP = {
  not_started: { display: 'Not Started', icon: 'radio-button-unchecked' },
  in_progress: { display: 'In Progress', icon: 'play-circle-filled' },
  completed: { display: 'Completed', icon: 'check-circle' },
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
  startedAt,
  completedAt,
  lastAccessedAt,
  chapterNumber,
  expanded = false,
  showStatusModal = false,
  onChapterPress,
  onStatusUpdate,
  onExpandToggle,
  isUpdating = false,
}) => {

  // Get colors based on status
  const fillColor = ORANGE_COLORS.fill;
  const strokeColor = ORANGE_COLORS.stroke;
  const textColor = ORANGE_COLORS.text;

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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Not set';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Status element UI structure
  const renderStatusElement = () => {
    return (
      <TouchableOpacity
        style={[
          styles.statusImageContainer,
          { backgroundColor: fillColor, borderColor: strokeColor },
        ]}
        onPress={() => onStatusUpdate?.(getNextStatus(status) as 'not_started' | 'in_progress' | 'completed')}
        disabled={isUpdating}
      >
        <Icon
          name={statusInfo.icon}
          size={32}
          color={strokeColor}
        />
        <Text style={[styles.statusText, { color: textColor }]}>
          {isUpdating ? 'Updating...' : statusInfo.display}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.ChapterCardContainer}>
      <View style={[styles.ChapterCard, { backgroundColor: fillColor }]}>
        {/* Semi-circle notches */}
        <View style={styles.topNotch} />
        <View style={styles.bottomNotch} />
        
        {/* First dashed line - from top to main content */}
        <View style={styles.dashedLineTop}>
          {Array(40).fill(0).map((_, index) => (
            <View key={index} style={styles.dashedLine} />
          ))}
        </View>
        
        {/* Main content section */}
        <View style={styles.mainContentSection}>
          <TouchableOpacity
            style={styles.ChapterContentWithPadding}
            onPress={onChapterPress}
          >
            <View style={styles.ChapterHeader}>
              <Text
                style={[styles.ChapterTitle, { color: textColor }]}
              >
                Chapter {chapterNumber}: {title}
              </Text>
            </View>
            
            <View style={styles.ChapterInfoRow}>
              <View style={styles.progressContainer}>
                <Icon
                  name="book"
                  size={18}
                  color={strokeColor}
                />
                <Text style={[styles.progressText, { color: textColor }]}>
                  {progress}%
                </Text>
              </View>
              
              <View style={[styles.typeContainer, { backgroundColor: `${strokeColor}20` }]}>
                <Text style={[styles.typeText, { color: textColor }]}>
                  Chapter
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Status element */}
          {renderStatusElement()}
          
          {/* Circular expand button */}
          <View style={styles.circleButtonContainer}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={onExpandToggle}
            >
              <Icon
                name={expanded ? 'expand-less' : 'expand-more'}
                size={16}
                color="#666666"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Second dashed line - from main content to expanded content */}
        {expanded && (
          <View style={styles.dashedLineBottom}>
            {Array(40).fill(0).map((_, index) => (
              <View key={index} style={styles.dashedLine} />
            ))}
          </View>
        )}
        
        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContentSection}>
            <View style={styles.expandedContent}>
              {/* Description */}
              {content && (
                <View style={styles.descriptionSection}>
                  <Text style={[styles.descriptionTitle, { color: textColor }]}>
                    Content
                  </Text>
                  <Text style={[styles.descriptionText, { color: textColor }]}>
                    {content}
                  </Text>
                </View>
              )}
              
              {/* Info section (progress & time spent) */}
              <View style={styles.infoSection}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: textColor }]}>Progress</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {progress}%
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: textColor }]}>Time Spent</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {formatTimeSpent(timeSpent)}
                  </Text>
                </View>
              </View>
              
              {/* Start date info */}
              {startedAt && (
                <View style={styles.timeSection}>
                  <Text style={[styles.timeLabel, { color: textColor }]}>Started At</Text>
                  <Text style={[styles.timeValue, { color: textColor }]}>
                    {formatDate(startedAt)}
                  </Text>
                </View>
              )}
              
              {/* Completion date info */}
              {completedAt && (
                <View style={styles.frequencySection}>
                  <Text style={[styles.frequencyLabel, { color: textColor }]}>Completed At</Text>
                  <Text style={[styles.frequencyValue, { color: textColor }]}>
                    {formatDate(completedAt)}
                  </Text>
                </View>
              )}
              
              {/* Last accessed info */}
              {lastAccessedAt && (
                <View style={styles.createdBySection}>
                  <Text style={[styles.createdByLabel, { color: textColor }]}>Last Accessed</Text>
                  <Text style={[styles.createdByValue, { color: textColor }]}>
                    {formatDate(lastAccessedAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
      
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
                          <Icon name="check" size={20} color="#FF9500" />
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
  // Chapter Card Container Styles
  ChapterCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'visible',
    position: 'relative',
  },
  ChapterCard: {
    borderRadius: 20,
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContentSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 15,
    minHeight: 100,
    position: 'relative',
  },
  expandedContentSection: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    position: 'relative',
  },
  ChapterContent: {
    flex: 1,
    paddingRight: 90,
    minHeight: 60,
  },
  ChapterContentWithPadding: {
    flex: 1,
    paddingRight: 90,
    minHeight: 60,
  },
  ChapterHeader: {
    marginBottom: 8,
    flexShrink: 1,
    minHeight: 22,
  },
  ChapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flexWrap: 'wrap',
    lineHeight: 22,
    textAlign: 'left',
  },
  ChapterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  // Chapter Info Display
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  progressText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  
  // Notches - Semi-circle cutouts
  topNotch: {
    position: 'absolute',
    right: 90,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  bottomNotch: {
    position: 'absolute',
    right: 90,
    bottom: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  
  // Dashed Line - Split into two parts
  dashedLineTop: {
    position: 'absolute',
    top: 10,
    bottom: 100,
    right: 100,
    width: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dashedLineBottom: {
    position: 'absolute',
    top: 120,
    bottom: 10,
    right: 100,
    width: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dashedLine: {
    height: 4,
    width: 1,
    backgroundColor: '#FFFFFF',
    marginVertical: 3,
  },
  
  // Status element
  statusImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#606263FF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderBottomWidth: 3,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    width: 50,
  },
  
  // Circular button styles
  circleButtonContainer: {
    marginTop: 20,
    position: 'absolute',
    bottom: 10,
    right: 170,
    zIndex: 10,
  },
  circleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#AAAAAA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Expanded content styles
  expandedContent: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Info section (progress & time spent)
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Description section
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 20,
  },
  
  // Time section
  timeSection: {
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Frequency section
  frequencySection: {
    marginBottom: 12,
  },
  frequencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  frequencyValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  
  // Created by section
  createdBySection: {
    marginBottom: 12,
  },
  createdByLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  createdByValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
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
    fontSize: 18,
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
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  selectedStatusOptionText: {
    color: '#FF9500',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
});

export default ChapterCard;
