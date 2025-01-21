import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@utils/Constants'
import { useContainerDimensions } from '../hooks/useContainerDimensions'
import { useWebRTC } from '../hooks/useWebRTC'
import CallHeader from '../components/ui/CallHeader'
import UserView from '../components/ui/UserView'
import NoUserInvite from '../components/ui/NoUserInvite'
import People from '../components/ui/People'
import CallFooter from '../components/ui/CallFooter'

const LiveCallScreen = () => {

  const {containerDimensions, onContainerLayout} = useContainerDimensions()
  const {participants, localStream, toggleMic, toggleVideo, switchCamera} =  useWebRTC();

  return (
    <View style = {styles.container}>
  <CallHeader switchCamera={switchCamera}  />
  <View style={styles.peopleContainer} onLayout={onContainerLayout}>

 
    {
      containerDimensions && localStream && (
        <UserView
        localStream={localStream}
        containerDimensions={containerDimensions}
         />
      )
    }


    {
      participants.length > 1 ? (
        <People
        people = {participants}
        containerDimensions={containerDimensions}
        
         />
      ) : (
        <NoUserInvite />



      )
    }

    </View>
    <CallFooter toggleMic={toggleMic} toggleVideo={toggleVideo} />



    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:Colors.teal_300,

  },
  peopleContainer:{
    flex:1
  }
})

export default LiveCallScreen