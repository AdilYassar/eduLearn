/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Image,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLiveMeetStore } from '../service/meetStore';
import { useWS } from '../service/api/WSProvider';
import { prepareStyles } from '../styles/prepareStyles';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import { useUserStore } from '../service/userStore';
import { addHyphens, requestPermissions } from '../utils/Helpers';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Ellipsis,
  EllipsisVertical,
  Info,
  Mic,
  MicOff,
  Share,
  UserCircle,
  Video,
  VideoOff,
} from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { joinStyles } from '../styles/joinStyles';
import { replace } from '../../../utils/Navigation';
import { useLegalModals } from '../hooks/useLegalModals';
import LegalModal from '../components/ui/LegalModal';
import ShareModal from '../../ui/ShareModal';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  DataProcessingContent 
} from '../components/ui/LegalContents';
const PrepareMeetScreen = () => {
  const { emit, on, off } = useWS();
  const { addParticipant, sessionId, addSessionId, toggle, micOn, videoOn } =
    useLiveMeetStore();
  const { user } = useUserStore();
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  // Legal modals hook
  const {
    privacyModalVisible,
    termsModalVisible,
    dataProcessingModalVisible,
    closePrivacyModal,
    closeTermsModal,
    closeDataProcessingModal,
    openPrivacyModal,
    openTermsModal,
    openDataProcessingModal,
  } = useLegalModals();

  useEffect(() => {
    const handleParticipantUpdate = updatedParticipants => {
      // Ensure updatedParticipants is always an array
      // const safeParticipants = Array.isArray(updatedParticipants) ? updatedParticipants : [];
      setParticipants(updatedParticipants?.participants);
    };
    on('session-info', handleParticipantUpdate);
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream.release();
      }
      setLocalStream(null);
      off('session-info', handleParticipantUpdate);
    };
  }, [sessionId, emit, on, off]);

  const showMediaDevices = (audio, video) => {
    mediaDevices
      ?.getUserMedia({
        audio,
        video,
      })
      .then(stream => {
        setLocalStream(stream);
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = audio;
        }
        if (videoTrack) {
          videoTrack.enabled = video;
        }
      })
      .catch(err => {
        console.log('Error accessing media devices.', err);
        Alert.alert(
          'Error',
          'Could not access media devices. Please check permissions.',
        );
      });
  };

  const toggleMicState = newState => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newState;
      }
    }
  };

  const toggleVideoState = newState => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newState;
      }
    }
  };

  const toggleLocal = type => {
    if (type === 'mic') {
      const newMicState = !micOn;
      toggleMicState(newMicState);
      toggle('mic');
    }
    if (type === 'video') {
      const newVideoState = !videoOn;
      toggleVideoState(newVideoState);
      toggle('video');
    }
  };

  const fetchMediaPermissions = async () => {
    const result = await requestPermissions();
    if (result.isCameraGranted) {
      toggleLocal('video');
    }
    if (result.isMicrophoneGranted) {
      toggleLocal('mic');
    }

    showMediaDevices(result.isMicrophoneGranted, result.isCameraGranted);
  };

  useEffect(() => {
    fetchMediaPermissions();
  }, []);

  const handleStartCall = async () => {
    try {
      emit('join-session', {
        name: user?.name,
        photo: user?.photo,
        userId: user?.id,
        sessionId: sessionId,
        micOn,
        videoOn,
      });
      participants.forEach(i => addParticipant(i));
      addSessionId(sessionId);
      replace('LiveMeetScreen');
    } catch (error) {
      console.log('Error starting call:', error);
      Alert.alert('Error', 'Could not start the call. Please try again.');
    }
  };

  const renderParticipantText = () => {
    // Debug logging
    console.log('Participants state:', participants, 'Type:', typeof participants, 'IsArray:', Array.isArray(participants));
    
    // Early return for null, undefined, or non-array participants
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return 'No participants yet';
    }

    try {
      const names = participants
        .slice(0, 2)
        .map(p => p?.name || 'Unknown')
        .filter(name => name !== 'Unknown')
        .join(', ');
      
      if (!names) {
        return 'No participants yet';
      }
      
      const count =
        participants.length > 2 ? ` and ${participants.length - 2} more` : '';
      return `${names}${count} are in the call`;
    } catch (error) {
      console.log('Error in renderParticipantText:', error);
      return 'No participants yet';
    }
  };
  return (
    <View style={prepareStyles.container}>
      <SafeAreaView />
      <View style={prepareStyles.headerContainer}>
        <ChevronLeft
          size={RFValue(18)}
          color={'#000'}
          onPress={() => {
            replace('HomeScreen');
            addSessionId(null);
          }}
        />

        <EllipsisVertical size={RFValue(18)} color={'#000'} />
      </View>
      <ScrollView contentContainerStyle={prepareStyles.scrollContainer}>
        <View style={prepareStyles.videoContainer}>
          <Text style={prepareStyles.meetingCode}>{addHyphens(sessionId)}</Text>
          <View style={prepareStyles.camera}>
            {localStream && videoOn ? (
              <RTCView
                streamURL={localStream?.toURL()}
                style={prepareStyles.localVideo}
                mirror={true}
                objectFit="cover"
              />
            ) : (
              <View style={prepareStyles.avatarContainer}>
                {user?.photo ? (
                  <Image 
                    source={{ uri: user.photo }} 
                    style={prepareStyles.userPhoto}
                  />
                ) : (
                  <View style={prepareStyles.avatar}>
                    <Text style={prepareStyles.avatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <View style={prepareStyles.toggleContainer}>
              <TouchableOpacity
                onPress={() => toggleLocal('mic')}
                style={prepareStyles.iconButton}
              >
                {micOn ? (
                  <Mic size={RFValue(20)} color={'#000'} />
                ) : (
                  <MicOff
                    size={RFValue(20)}
                    color={'#000'}
                    style={{ opacity: 1 }}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleLocal('video')}
                style={prepareStyles.iconButton}
              >
                {videoOn ? (
                  <Video size={RFValue(20)} color={'#000'} />
                ) : (
                  <VideoOff
                    size={RFValue(20)}
                    color={'#888'}
                    style={{ opacity: 0.5 }}
                  />
                )}
              
      
              </TouchableOpacity>
              
            </View>
          </View>
              <Text style={prepareStyles.peopleText}>
            {renderParticipantText()}
          </Text>

          {/* Join Meeting Button - Better positioned */}
          <TouchableOpacity
            style={prepareStyles.joinButtonMain}
            onPress={handleStartCall}
          >
            <Text style={prepareStyles.joinButtonMainText}>Join Meeting</Text>
          </TouchableOpacity>
        </View>
        
   
     

        <View style={prepareStyles.infoContainer}>
          <View style={prepareStyles.flexRowBetween}>
            <Info size={RFValue(18)} color={'#000'} />
            <Text style={joinStyles.Info}>Meeting ID: {addHyphens(sessionId)}</Text>
            <TouchableOpacity onPress={() => setShareModalVisible(true)}>
              <Share size={RFValue(18)} color={'#000'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginLeft: RFValue(10) }}>
          <Text style={prepareStyles.linkHeader}>Share this link to invite others...</Text>
          <Text style={prepareStyles.linkText}>https://eduLearn.edu/join/{sessionId}</Text>
        </View>

        {/* Compliance and Legal Information */}
        <Text style={prepareStyles.complianceHeader}>Legal & Compliance Notice</Text>
        
        <Text style={prepareStyles.complianceText}>
          • End-to-end encryption ensures secure communication channels
        </Text>
        <Text style={prepareStyles.complianceText}>
          • Participation constitutes acceptance of Terms of Service and Privacy Policy
        </Text>
        <Text style={prepareStyles.complianceText}>
          • Recording capabilities may be enabled - all participants will receive notification
        </Text>
        <Text style={prepareStyles.complianceText}>
          • Device permissions for camera and microphone access are mandatory
        </Text>
        <Text style={prepareStyles.complianceText}>
          • Data processing adheres to GDPR, CCPA, and applicable privacy regulations
        </Text>
        <Text style={prepareStyles.complianceText}>
          • Unauthorized recording, distribution, or sharing of meeting content is strictly prohibited
        </Text>
        
        <View style={prepareStyles.legalLinks}>
          <TouchableOpacity onPress={openPrivacyModal}>
            <Text style={prepareStyles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={prepareStyles.complianceText}> | </Text>
          <TouchableOpacity onPress={openTermsModal}>
            <Text style={prepareStyles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={prepareStyles.complianceText}> | </Text>
          <TouchableOpacity onPress={openDataProcessingModal}>
            <Text style={prepareStyles.linkText}>Data Processing Agreement</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={prepareStyles.disclaimerText}>
          By proceeding with this meeting, you acknowledge full understanding and acceptance of all organizational policies, legal obligations, and data handling procedures. You confirm authorization to participate in this session.
        </Text>
      </ScrollView>

      {/* Legal Modals */}
      <LegalModal
        visible={privacyModalVisible}
        title="Privacy Policy"
        content={<PrivacyPolicyContent />}
        onAccept={closePrivacyModal}
      />
      
      <LegalModal
        visible={termsModalVisible}
        title="Terms of Service"
        content={<TermsOfServiceContent />}
        onAccept={closeTermsModal}
      />
      
      <LegalModal
        visible={dataProcessingModalVisible}
        title="Data Processing Agreement"
        content={<DataProcessingContent />}
        onAccept={closeDataProcessingModal}
      />
      
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        meetingData={{
          meetingId: sessionId,
          meetingLink: `https://eduLearn.edu/join/${sessionId}`,
          startTime: new Date().toLocaleTimeString()
        }}
      />
    </View>
  );
};

export default PrepareMeetScreen;
