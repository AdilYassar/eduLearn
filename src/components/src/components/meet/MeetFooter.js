import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@utils/Constants';
import { useLiveMeetStore } from '../../service/meetStore';
import {footerStyles} from '../../styles/footerStyles';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const MeetFooter = ({ toggleMic, toggleVideo }) => {
  const navigation = useNavigation();
  
  // Helper functions for icon styles and colors
  const getIconStyle = (isActive) => ({
    backgroundColor: isActive ? 'transparent' : Colors.teal_200,
    borderRadius: 50,
    padding: 12,
  });

  const {micOn, videoOn} = useLiveMeetStore();

  const getIconColor = (isActive) => (isActive ? 'white' : 'red');

  return (
    <LinearGradient
      colors={[ 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.9)']}
      style={footerStyles.footerContainer}
    >
      <View style={footerStyles.iconContainer}>
        {/* Toggle Microphone */}
        <TouchableOpacity
          style={getIconStyle(micOn)}
          onPress={toggleMic}
        >
          {micOn ? (
            <Mic size={30} color={getIconColor(micOn)} />
          ) : (
            <MicOff size={30} color={getIconColor(micOn)} />
          )}
        </TouchableOpacity>

        {/* Toggle Video */}
        <TouchableOpacity
          style={getIconStyle(videoOn)}
          onPress={toggleVideo}
        >
          {videoOn ? (
            <Video size={30} color={getIconColor(videoOn)} />
          ) : (
            <VideoOff size={30} color={getIconColor(videoOn)} />
          )}
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          style={[getIconStyle(false), { backgroundColor: '#EF4444' }]}
          onPress={() => navigation.goBack()}
        >
          <PhoneOff size={30} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default MeetFooter;
