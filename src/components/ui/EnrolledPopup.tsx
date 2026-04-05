import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

interface EnrolledPopupProps {
  visible: boolean;
  onClose: () => void;
  onViewCourse?: () => void;
  courseTitle: string;
  justEnrolled?: boolean;
}

const { width } = Dimensions.get('window');

const EnrolledPopup: React.FC<EnrolledPopupProps> = ({
  visible,
  onClose,
  onViewCourse,
  courseTitle,
  justEnrolled = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <Text style={styles.title}>{courseTitle}</Text>

          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/getStarted/astronot.png')}
              style={styles.astronautImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity 
            style={styles.enrolledButton} 
            onPress={onViewCourse}
            disabled={!onViewCourse}>
            <Text style={styles.enrolledButtonText}>
              {justEnrolled ? 'Enrolled!' : 'View Course'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
    minWidth: width * 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 30,
  },
  astronautImage: {
    width: 120,
    height: 120,
  },
  enrolledButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrolledButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default EnrolledPopup;
