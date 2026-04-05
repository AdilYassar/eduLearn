import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useLiveMeetStore } from '../../service/meetStore';
import LinearGradient from 'react-native-linear-gradient';
import { addHyphens } from '../../utils/Helpers';
import { SwitchCamera, Volume2, Share } from 'lucide-react-native';
import VolumeControlModal from '../../../ui/VolumeControlModal';
import ShareModal from '../../../ui/ShareModal';




const MeetHeader = ({ switchCamera }) => {
  const { sessionId } = useLiveMeetStore();
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const meetingData = {
    meetingId: sessionId,
    meetingTitle: 'EduLearn Meeting',
    meetingLink: `https://edulearn.app/join/${sessionId}`,
    startTime: new Date().toLocaleTimeString(),
  };

  const handleVolumePress = () => {
    setShowVolumeModal(true);
  };

  const handleSharePress = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <LinearGradient
        style={styles.container}
        colors={['rgba(0,0,0,0.8)', 'transparent']}
      >
        <SafeAreaView />
        <View style={styles.header}>
          <Text style={styles.meetCode}>
            {addHyphens(sessionId)}
          </Text>
          <View style={styles.icons}>
            <TouchableOpacity onPress={switchCamera}>
              <SwitchCamera color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleVolumePress} style={styles.iconSpacing}>
              <Volume2 color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSharePress} style={styles.iconSpacing}>
              <Share color="#fff" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <VolumeControlModal
        visible={showVolumeModal}
        onClose={() => setShowVolumeModal(false)}
      />

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        meetingData={meetingData}
      />
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
  },
  meetCode: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 10,
  },
});

export default MeetHeader;