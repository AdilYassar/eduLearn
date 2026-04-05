import { View, Text, TouchableOpacity, FlatList, Image, Alert, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { homeStyles } from '../styles/homeStyles';
import HomeHeader from '../components/home/HomeHeader';
import { navigate } from '../../../utils/Navigation';
import { useUserStore } from '../service/userStore';
import { Calendar, Video } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import InquiryModal from '../components/home/InquiryModal';
import { useWS } from '../service/api/WSProvider';
import { useLiveMeetStore } from '../service/meetStore';
import { addHyphens, removeHyphens } from '../utils/Helpers';
import {checkSession} from '../service/api/session';
import { useTheme } from '../../../context/ThemeContext';
import { ThemedContainer, ThemedText, GlassCard } from '../../../components/ui/ThemedComponents';
import BottomNavigationBar from '../../../components/ui/BottomNavigationBar';






const HomeScreen = () => {
  const { emit } = useWS();
  const { user, sessions, addSession, removeSession } = useUserStore();
  const {addSessionId, removeSessionId} = useLiveMeetStore();
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);

  const handleNavigation = () => {
    const storedName = user?.name;
    if (!storedName) {
      setVisible(true);
      return;
    } else {
      navigate('JoinMeetScreen');
    }
  };


  const joinViaSessionId = async(id) => {
    const storedName = user?.name;
    if (!storedName) {
      setVisible(true);
      return;
  }

  const isAvailable = await checkSession(id)
  if(isAvailable){
    emit('prepare-session',{
      userId:user?.id,
      sessionId:removeHyphens(id)
    })
    addSession(id)
    addSessionId(id);
    navigate('PrepareMeetScreen');
  }else{
    removeSession(id);
    removeSessionId(id);
    Alert.alert('Session Expired','The session you are trying to join has expired.');
  }

}


  const renderSessions = ({ item }) => {
    return (
      <GlassCard style={homeStyles.sessionContainer} opacity={0.08}>
      <Calendar size={RFValue(20)} color={theme.text.primary} />
      <View style = {homeStyles.sessionTextContainer}>
        <ThemedText style={homeStyles.sessionTitle}>
          {addHyphens(item)}
        </ThemedText>
      </View>
      <TouchableOpacity
      style={[homeStyles.joinButton, { 
        backgroundColor: theme.primary, 
        borderWidth: 0,
      }]}
      onPress={()=>joinViaSessionId(item)}
      >
      <ThemedText style={[homeStyles.joinButtonText, { fontWeight: '600' }]}> Join</ThemedText>
      </TouchableOpacity>
      </GlassCard>
    )
  }




  return (
    <ThemedContainer style={styles.container}>
      <View style={styles.contentWrapper}>
        <HomeHeader />
        <FlatList
          data={sessions}
          renderItem={renderSessions}
          key={item => item}
          contentContainerStyle={{ padding: 10 }}
          ListEmptyComponent={
            <>
              <Image
                source={require('../assets/bg.png')}
                style={{ width: 100, height: 100, alignSelf: 'center' }}
              />
              <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                No ongoing meetings
              </ThemedText>
            </>
          }
        />

        <TouchableOpacity
          style={[homeStyles.absoluteButton, { 
            backgroundColor: theme.primary, 
            borderWidth: 0,
            position: 'absolute',
            bottom: 120,
            zIndex: 40,
          }]}
          onPress={handleNavigation}
        >
          <Video size={RFValue(20)} color={theme.lightest || '#FFFFFF'} />
          <ThemedText style={[homeStyles.buttonText, { fontWeight: '600' }]}>Join a Meeting</ThemedText>
        </TouchableOpacity>

        {/* Bottom Navigation Bar */}
        <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="HomeScreen" />
      </View>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
});

export default HomeScreen;
