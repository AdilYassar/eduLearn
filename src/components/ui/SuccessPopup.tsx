import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomText from './CustomText';
import { RFValue } from 'react-native-responsive-fontsize';

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

const { width } = Dimensions.get('window');

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  visible,
  onClose,
  title = 'Success!',
  message = 'Operation completed successfully.',
  buttonText = 'OK',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Icon name="check-circle" size={64} color="#4CAF50" />
          </View>

          {/* Title */}
          <CustomText
            variant="h1"
            size={RFValue(24)}
            fontFamily="Inter-Bold"
            style={styles.title}
          >
            {title}
          </CustomText>

          {/* Message */}
          <CustomText
            variant="h3"
            size={RFValue(16)}
            fontFamily="Inter-Regular"
            style={styles.message}
          >
            {message}
          </CustomText>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <CustomText
              variant="h3"
              size={RFValue(16)}
              fontFamily="Inter-Bold"
              style={styles.buttonText}
            >
              {buttonText}
            </CustomText>
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
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    minWidth: width * 0.85,
    maxWidth: width * 0.9,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#CAC4FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#CAC4FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#2C2C2C',
  },
});

export default SuccessPopup;

