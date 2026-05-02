import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Option {
  text: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: 'default' | 'destructive';
}

interface CustomBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  options: Option[];
}

export const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  options,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
        {/* Handle bar */}
        <View style={[styles.handle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />

        {/* Header */}
        {(title || onClose) && (
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>{title || 'Options'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                index === options.length - 1 && styles.lastOption,
                { borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
              ]}
              onPress={() => {
                onClose();
                setTimeout(option.onPress, 300); // Small delay to allow modal to close
              }}
            >
              <View style={styles.optionLeft}>
                {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}
                <Text
                  style={[
                    styles.optionText,
                    { color: option.style === 'destructive' ? '#ef4444' : theme.text.primary }
                  ]}
                >
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
