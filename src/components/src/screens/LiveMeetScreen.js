import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useContainerDimensions } from '../hooks/useContainerDimensions'
import { useWebRTC } from '../hooks/useWebRTC'
import MeetHeader from '../components/meet/MeetHeader'
import UserView from '../components/meet/UserView'
import { SafeAreaView } from 'react-native-safe-area-context'
import People from '../components/meet/People'
import NoUserInvite from '../components/meet/NoUserInvite'
import MeetFooter from '../components/meet/MeetFooter'
import ChatModal from '../../../components/ui/ChatModal'
import { useTheme } from '../../../context/ThemeContext';
import { ThemedContainer } from '../../../components/ui/ThemedComponents';



const LiveMeetScreen = () => {

  const {containerDimensions, onContainerLayout} = useContainerDimensions();
  const {participants, localStream,toggleMic, toggleVideo,switchCamera} = useWebRTC();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <ThemedContainer style = {[styles.container, { backgroundColor: theme.background[0] || '#000' }]}>
    <SafeAreaView />
    <MeetHeader switchCamera={switchCamera} />
    <View style = {styles.peopleContainer} onLayout={onContainerLayout}>
    {containerDimensions && localStream && (
      <UserView
      localStream = {localStream}
      containerDimensions = {containerDimensions}
  
      />
    )}

    {
      participants.length >0 ? (
        <People
        people={participants}
        containerDimensions={containerDimensions}
        />

      ):(
        <NoUserInvite />
      )
    }
    </View>


    <MeetFooter 
      toggleMic={toggleMic} 
      toggleVideo={toggleVideo} 
      participants={participants}
      onChatPress={() => setIsChatVisible(true)}
    />

    <ChatModal visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </ThemedContainer>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  peopleContainer: {
    flex: 1,
  }
})
export default LiveMeetScreen