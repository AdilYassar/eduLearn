import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@utils/Constants';
import { footerStyles } from '@components/meet/styles/footerStyles';

import { goBack } from '@utils/Navigation';
import { useCallStore } from '../serviceComponent/callStore';
import  Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CallFooter = ({ toggleMic, toggleVideo }) => {
  // Helper functions for icon styles and colors
  const getIconStyle = (isActive) => ({
    backgroundColor: isActive ? 'transparent' : Colors.teal_200,
    borderRadius: 50,
    padding: 12,
  });

  const {micOn, videoOn} = useCallStore(); // Assuming `useWebRTC` is a custom hook that returns the current state of the microphone and video

  const getIconColor = (isActive) => (isActive ? 'white' : 'black');

  return (
    <LinearGradient
      colors={[Colors.teal_700, Colors.teal_600,Colors.teal_500, Colors.teal_200, 'transparent']}
      style={footerStyles.footerContainer}
    >
      <View style={footerStyles.iconContainer}>
        {/* Toggle Microphone */}
        <TouchableOpacity
          style={getIconStyle(micOn)}
          onPress={toggleMic}
        >
          <Icon
            name={micOn ? 'microphone' : 'microphone-off'}
            size={30}
            color={getIconColor(micOn)}
          />
        </TouchableOpacity>

        {/* Toggle Video */}
        <TouchableOpacity
          style={getIconStyle(videoOn)}
          onPress={toggleVideo}
        >
          <Icon
            name={videoOn ? 'video' : 'video-off'}
            size={30}
            color={getIconColor(videoOn)}
          />
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity
          style={getIconStyle(true)} // Always red for the "end call" button
          onPress={() => goBack()} // Assuming `goBack` is used for navigation
        >
          <Icon
            name="phone-hangup"
            size={30}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default CallFooter;
