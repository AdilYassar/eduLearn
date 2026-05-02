import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Volume2, VolumeX, Phone, Speaker, X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { VolumeManager } from 'react-native-volume-manager';
import { RFValue } from 'react-native-responsive-fontsize';

const VolumeControlModal = ({ visible, onClose }) => {
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioRoute, setAudioRoute] = useState('speaker');

  useEffect(() => {
    if (visible) {
      VolumeManager.getVolume().then((volume) => {
        // volume can be an object {volume: number} or a number depending on platform
        const vol = typeof volume === 'number' ? volume : volume.volume;
        setCurrentVolume(vol);
        setIsMuted(vol === 0);
      });
    }
  }, [visible]);

  const handleVolumeChange = async (newVolume) => {
    try {
      await VolumeManager.setVolume(newVolume);
      setCurrentVolume(newVolume);
      setIsMuted(newVolume === 0);
    } catch (error) {
      Alert.alert('Error', 'Failed to change volume');
    }
  };

  const toggleMute = async () => {
    try {
      if (isMuted) {
        await VolumeManager.setVolume(0.5);
        setCurrentVolume(0.5);
        setIsMuted(false);
      } else {
        await VolumeManager.setVolume(0);
        setCurrentVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle mute');
    }
  };

  const switchAudioRoute = (route) => {
    setAudioRoute(route);
    Alert.alert('Audio Route', `Switched to ${route}`);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Volume2 size={22} color="#007AFF" />
              <Text style={styles.title}>Audio Controls</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Mute Toggle */}
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            <View style={styles.muteIconContainer}>
              {isMuted ? (
                <VolumeX size={24} color="#ff4444" />
              ) : (
                <Volume2 size={24} color="#4CAF50" />
              )}
            </View>
            <Text style={styles.muteText}>
              {isMuted ? 'Unmute Device' : 'Mute Device'}
            </Text>
          </TouchableOpacity>

          {/* Volume Control */}
          <View style={styles.volumeSection}>
            <Text style={styles.sectionTitle}>Volume Level</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={currentVolume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#e8e8e8"
              thumbTintColor="#007AFF"
            />
            <Text style={styles.volumeText}>
              {Math.round(currentVolume * 100)}%
            </Text>
          </View>

          {/* Audio Route Selection */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>Audio Output</Text>
            <View style={styles.routeButtons}>
              <TouchableOpacity
                style={[
                  styles.routeButton,
                  audioRoute === 'speaker' && styles.routeButtonActive,
                ]}
                onPress={() => switchAudioRoute('speaker')}
              >
                <Speaker size={24} color={audioRoute === 'speaker' ? '#fff' : '#007AFF'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.routeButton,
                  audioRoute === 'earpiece' && styles.routeButtonActive,
                ]}
                onPress={() => switchAudioRoute('earpiece')}
              >
                <Phone size={24} color={audioRoute === 'earpiece' ? '#fff' : '#007AFF'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: RFValue(4),
    paddingBottom: RFValue(20),
    maxHeight: '70%',
    minHeight: '45%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: RFValue(8),
    marginBottom: RFValue(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(20),
    paddingHorizontal: RFValue(16),
    paddingTop: RFValue(4),
  },
  headerLeft: {
    width: 30,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: RFValue(8),
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  muteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    marginHorizontal: RFValue(16),
    padding: RFValue(16),
    borderRadius: 12,
    marginBottom: RFValue(24),
    borderWidth: 1,
    borderColor: '#e8e8ff',
  },
  muteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RFValue(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  muteText: {
    fontSize: RFValue(16),
    color: '#1a1a1a',
    fontWeight: '600',
  },
  volumeSection: {
    marginHorizontal: RFValue(16),
    marginBottom: RFValue(24),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: RFValue(16),
  },
  volumeText: {
    textAlign: 'center',
    fontSize: RFValue(16),
    color: '#007AFF',
    fontWeight: '700',
    marginTop: RFValue(8),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  routeSection: {
    marginHorizontal: RFValue(16),
  },
  routeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  routeButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#e8e8ff',
  },
  routeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
});

export default VolumeControlModal;
