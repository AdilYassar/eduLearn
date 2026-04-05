import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AlertCircle, CheckCircle, InfoIcon } from 'lucide-react-native';
import CustomText from './CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface CustomAlertPopupProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  type?: AlertType;
}

const { width } = Dimensions.get('window');

const CustomAlertPopup: React.FC<CustomAlertPopupProps> = ({
  visible,
  onClose,
  title = 'Alert',
  message = 'An alert message',
  buttonText = 'OK',
  type = 'info',
}) => {
  const { theme } = useTheme();

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          Icon: AlertCircle,
          color: '#EF4444',
        };
      case 'success':
        return {
          Icon: CheckCircle,
          color: '#10B981',
        };
      case 'warning':
        return {
          Icon: AlertCircle,
          color: '#F59E0B',
        };
      case 'info':
      default:
        return {
          Icon: InfoIcon,
          color: '#3B82F6',
        };
    }
  };

  const { Icon, color } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.popupContainer,
            { backgroundColor: theme.surface },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon size={40} color={color} strokeWidth={2} />
          </View>

          {/* Title */}
          <CustomText
            variant="h1"
            size={RFValue(16)}
            fontFamily="Inter-Bold"
            style={[styles.title, { color: theme.text.primary }]}
          >
            {title}
          </CustomText>

          {/* Message */}
          <CustomText
            variant="h3"
            size={RFValue(12)}
            fontFamily="Inter-Regular"
            style={[styles.message, { color: theme.text.secondary }]}
          >
            {message}
          </CustomText>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
            onPress={onClose}
          >
            <CustomText
              variant="h3"
              size={RFValue(12)}
              fontFamily="Inter-Bold"
              style={[styles.buttonText, { color: '#FFFFFF' }]}
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    minWidth: width * 0.75,
    maxWidth: width * 0.85,
  },
  iconContainer: {
    marginBottom: 14,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default CustomAlertPopup;
