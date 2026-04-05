import { View, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../service/userStore';
import InquiryModal from './InquiryModal';
import { RFValue } from 'react-native-responsive-fontsize';
import { CircleUser, Menu } from 'lucide-react-native';
import { headerStyles } from '../../styles/headerStyles';
import { navigate } from '../../../../utils/Navigation.tsx';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useTheme } from '../../../../context/ThemeContext';
import { useWS } from '../../service/api/WSProvider';
import { useLiveMeetStore } from '../../service/meetStore';
import { removeHyphens } from '../../utils/Helpers';
import { checkSession } from '../../service/api/session';

const HomeHeader = () => {
  const [visible, setVisible] = useState(false);
  const [meetingCode, setMeetingCode] = useState('');
  const { user } = useUserStore();
  const { theme } = useTheme();
  const { emit } = useWS();
  const { addSessionId, removeSessionId } = useLiveMeetStore();
  const { addSession, removeSession } = useUserStore();

  useEffect(() => {
    const checkUserName = () => {
      const storedName = user?.name;
      if (!storedName) {
        setVisible(true);
      }
    };
    checkUserName();
  }, [user?.name]);

  const joinViaSessionId = async (code) => {
    const storedName = user?.name;
    if (!storedName) {
      setVisible(true);
      return;
    }

    if (!code || code.trim() === '') {
      return;
    }

    try {
      const isAvailable = await checkSession(code);
      if (isAvailable) {
        emit('prepare-session', {
          userId: user?.id,
          sessionId: removeHyphens(code),
        });
        addSession(code);
        addSessionId(code);
        setMeetingCode('');
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          navigate('PrepareMeetScreen');
        }, 100);
      } else {
        removeSession(code);
        removeSessionId(code);
        setMeetingCode('');
        Alert.alert('Session Expired', 'The session you are trying to join has expired.');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      Alert.alert('Error', 'Failed to join session. Please try again.');
      setMeetingCode('');
    }
  };

  const handleSubmit = () => {
    if (meetingCode.trim()) {
      joinViaSessionId(meetingCode);
    }
  };

  return (
    <SafeAreaView style={{ flex: 0 }} edges={['bottom', 'left', 'right']}>
      <View style={[headerStyles.container, { backgroundColor: theme.background[0] || theme.card }]}>
        <Menu size={RFValue(20)} color={theme.text.primary} />
        <TextInput
          style={[headerStyles.textContainer, {
            backgroundColor: 'transparent',
            color: theme.text.primary,
            opacity: meetingCode ? 1 : 0.6,
          }]}
          value={meetingCode}
          onChangeText={setMeetingCode}
          placeholder="Please Enter The Meeting Code..."
          placeholderTextColor={theme.text.secondary}
          returnKeyType="join"
          returnKeyLabel="Join"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity onPress={() => setVisible(true)}>
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={headerStyles.avatarIcon}
            />
          ) : (
            <CircleUser
              size={RFValue(20)}
              color={theme.text.primary}
            />
          )}
        </TouchableOpacity>
      </View>
      <InquiryModal onClose={() => setVisible(false)} visible={visible} />
    </SafeAreaView>
  );
};

export default HomeHeader;
