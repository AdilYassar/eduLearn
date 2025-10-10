import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
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
import {checkSession} from '../service/api/session'






const HomeScreen = () => {
  const { emit } = useWS();
  const { user, sessions, addSession, removeSession } = useUserStore();
  const {addSessionId, removeSessionId} = useLiveMeetStore();

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
      <View style={homeStyles.sessionContainer}>
      <Calendar size={RFValue(20)} color={'black'} />
      <View style = {homeStyles.sessionTextContainer}>
        <Text style={homeStyles.sessionTitle}>
          {addHyphens(item)}
        </Text>
      </View>
      <TouchableOpacity
      style={homeStyles.joinButton}
      onPress={()=>joinViaSessionId(item)}
      >
      <Text style={homeStyles.joinButtonText}> Join</Text>
      </TouchableOpacity>
      </View>
    )
  }




  return (
    <View style={homeStyles.container}>
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
            <Text style={{ textAlign: 'center', marginTop: 10 }}>
              No ongoing meetings
            </Text>
          </>
        }
      />

      <TouchableOpacity
        style={homeStyles.absoluteButton}
        onPress={handleNavigation}
      >
        <Video size={RFValue(20)} color={'white'} />
        <Text style={homeStyles.buttonText}>Join a Meeting</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
