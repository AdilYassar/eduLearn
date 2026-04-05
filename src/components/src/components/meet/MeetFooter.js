import { View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@utils/Constants';
import { useLiveMeetStore } from '../../service/meetStore';
import { useUserStore } from '../../service/userStore';
import {footerStyles} from '../../styles/footerStyles';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageCircle, 
  Users,
  Copy,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ParticipantsModal from './ParticipantsModal';
import ShareUtils from '../../../../utils/ShareUtils';

const MeetFooter = ({ toggleMic, toggleVideo, participants = [], onChatPress }) => {
  const navigation = useNavigation();
  const [showParticipants, setShowParticipants] = useState(false);
  
  const { user } = useUserStore();
  const { sessionId, micOn, videoOn } = useLiveMeetStore();
  
  // Helper functions for icon styles and colors
  const getIconStyle = (isActive) => ({
    backgroundColor: isActive ? 'transparent' : Colors.teal_200,
    borderRadius: 50,
    padding: 12,
  });

  const getIconColor = (isActive) => (isActive ? 'white' : 'red');

  const handleChat = () => {
    if (onChatPress) {
      onChatPress();
    }
  };

  const handleCopyMeetingId = async () => {
    const success = await ShareUtils.copyToClipboard(sessionId, 'Meeting ID copied!');
    if (success) {
      console.log('Meeting ID copied to clipboard');
    }
  };

  const handleParticipants = () => {
    setShowParticipants(true);
  };

  const closeParticipantsModal = () => {
    setShowParticipants(false);
  };

  // Combine current user with participants
  const allParticipants = [
    {
      userId: user?.id || 'current-user',
      name: user?.name || 'You',
      photo: user?.photo,
      micOn,
      videoOn,
      isHost: true, // Assuming current user is host
    },
    ...participants
  ];

  return (
    <>
      <LinearGradient
        colors={['rgba(60,60,60,0.9)', 'rgba(40,40,40,0.95)', 'rgba(30,30,30,1)']}
        style={footerStyles.footerContainer}
      >
      <View style={footerStyles.iconContainer}>
        {/* Chat / Copy Meeting ID */}
        <TouchableOpacity
          style={footerStyles.iconButton}
          onPress={handleChat}
          onLongPress={handleCopyMeetingId}
        >
          <MessageCircle size={20} color="white" />
        </TouchableOpacity>

        {/* Toggle Microphone */}
        <TouchableOpacity
          style={getIconStyle(micOn)}
          onPress={toggleMic}
        >
          {micOn ? (
            <Mic size={24} color={getIconColor(micOn)} />
          ) : (
            <MicOff size={24} color={getIconColor(micOn)} />
          )}
        </TouchableOpacity>

        {/* Toggle Video */}
        <TouchableOpacity
          style={getIconStyle(videoOn)}
          onPress={toggleVideo}
        >
          {videoOn ? (
            <Video size={24} color={getIconColor(videoOn)} />
          ) : (
            <VideoOff size={24} color={getIconColor(videoOn)} />
          )}
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          style={footerStyles.callEndButton}
          onPress={() => navigation.goBack()}
        >
          <PhoneOff size={24} color="white" />
        </TouchableOpacity>

        {/* Participants */}
        <TouchableOpacity
          style={footerStyles.iconButton}
          onPress={handleParticipants}
        >
          <Users size={20} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
    
    <ParticipantsModal
      visible={showParticipants}
      onClose={closeParticipantsModal}
      participants={allParticipants}
    />
    </>
  );
};

export default MeetFooter;
