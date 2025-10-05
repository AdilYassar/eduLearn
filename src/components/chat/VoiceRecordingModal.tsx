import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import { XMarkIcon, ArrowUpIcon } from 'react-native-heroicons/solid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceRecordingModalProps {
  isVisible: boolean;
  onClose: () => void;
  isListening: boolean;
  recognizedText?: string;
  recordingDuration?: number;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isVisible,
  onClose,
  isListening,
  recognizedText = '',
  recordingDuration = 0,
}) => {
  // Animation for the waveform bars
  const animatedValues = useRef(
    Array.from({ length: 40 }, () => new Animated.Value(0.3))
  ).current;

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isListening) {
      // Animate waveform bars when listening
      const animations = animatedValues.map((value) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: Math.random() * 0.5 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        )
      );

      // Stagger the animations
      Animated.stagger(50, animations).start();
    } else {
      // Reset to default height when not listening
      animatedValues.forEach((value) => {
        Animated.timing(value, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
    >
      <LinearGradient
        colors={['#2563EB', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.modalContent}
      >
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeButtonCircle}>
            <XMarkIcon size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Up Arrow Button */}
        <TouchableOpacity style={styles.upArrowButton} onPress={onClose}>
          <View style={styles.upArrowCircle}>
            <ArrowUpIcon size={24} color="#2563EB" />
          </View>
        </TouchableOpacity>

        {/* Waveform Visualization */}
        <View style={styles.waveformContainer}>
          {animatedValues.map((animValue, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  transform: [
                    {
                      scaleY: animValue,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Duration Display */}
        <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>

        {/* Recognized Text Display */}
        {recognizedText ? (
          <View style={styles.recognizedTextContainer}>
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          </View>
        ) : (
          <Text style={styles.listeningText}>
            {isListening ? 'Listening...' : 'Tap to start recording'}
          </Text>
        )}
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    alignItems: 'center',
    minHeight: 180,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upArrowButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  upArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: 15,
    marginBottom: 12,
  },
  waveformBar: {
    width: 2,
    height: 40,
    backgroundColor: '#fff',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  durationText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    fontFamily: 'Inter-SemiBold',
  },
  recognizedTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    minWidth: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
  },
  recognizedText: {
    fontSize: RFValue(13),
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  listeningText: {
    fontSize: RFValue(13),
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 10,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular',
  },
});

export default VoiceRecordingModal;
