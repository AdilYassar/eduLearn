/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text, Alert, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useWS } from '../components/serviceComponent/api/WSProvider'
import { useCallStore } from '../components/serviceComponent/callStore'
import {RTCView,mediaDevices } from 'react-native-webrtc'
import { prepareStyles } from '../styles/prepareStyles'
import { useUserStore } from '../components/serviceComponent/zustandStore'
import { addHyphens, requestPermissions } from '../utils/Helpers'
import { goBack, replace } from '@utils/Navigation'
import  Icon  from 'react-native-vector-icons/MaterialIcons'
import { RFValue } from 'react-native-responsive-fontsize'


const PrepareCallScreen = () => {
  const {emit, on, off} = useWS()
  const {addParticipant, sessionId, addSessionId,toggle,micOn, videoOn} = useCallStore()
  const {user} = useUserStore()
  const [localStream, setLocalStream] = useState(null)
  const [participants, setParticipants] = useState([])



  useEffect(()=>{
    const handleParticipantUpdate = updatedParticipants =>{
      setParticipants(updatedParticipants?.participants)
    }
    on('session-info', handleParticipantUpdate)
    return ()=>{
      if(localStream){
       
        localStream.getTracks().forEach(track => track.stop())
        localStream.release()
      }
      setLocalStream(null)
      off('session-info', handleParticipantUpdate)
    }
  },[sessionId,emit, on, off])



  const showMediaDevices = (audio, video) => {
    if(audio || video){
      mediaDevices?.getUserMedia({
        audio,
        video
      }).then(stream => {
        setLocalStream(stream)
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]
        if(audioTrack){
          audioTrack.enabled = audio
        }
        if(videoTrack){
          videoTrack.enabled = video
        }



      }).catch(err => {
        console.log("Error gettting media devices",err)
      })
    }
  }

  const toggleMicState = (newState) => {  

    if(localStream){
      const audioTrack = localStream.getAudioTracks()[0]
      if(audioTrack){
        audioTrack.enabled = newState;
      }
      
    }
  }
  const toggleVideoState = (newState) => {  

    if(localStream){
      const videoTrack = localStream.getVideoTracks()[0]
      if(videoTrack){
        videoTrack.enabled = newState;
      }
      
    }
  } 

  const toggleLocal = (type) => {
    if(type==='mic'){
      const newMicState = !micOn
      toggleMicState(newMicState)
      toggle('mic')
    }
    if(type==='video'){
      const newVideoState = !videoOn
      toggleVideoState(newVideoState)
      toggle('video')
    }
  }

    const fetchMediaPermissions = async () => {
      const result = await requestPermissions()
      if(result.isCameraGranted){
        toggleLocal('video');
      }
      if(result.isMicGranted){
        toggleLocal('mic');
      }
      showMediaDevices(result.isMicGranted, result.isCameraGranted)
    }

  useEffect(()=>{
    fetchMediaPermissions()
  },[])


  const handleStartCall = async () => {
    try {
      emit('join-session', {
        name:user?.name,
        photo:user?.photo,
        userId:user?.id,
        sessionId:sessionId,
        micOn,
        videoOn

      })
      participants.forEach(i=>addParticipant(i))
      addSessionId(sessionId)
      replace('LiveCallScreen')      
    } catch (error) {
      console.log("Error starting call",error)
      
    }
  }

  const renderParticipantText = () => {
    if(participants.length === 0){
      return "No fellows in the call"
    }
    const names = participants?.slice(0,2)?.map(p=>p.name)?.join(', ')
    const count = participants.lenght > 2 ? ` and ${participants.length - 2} others` : ''
    return `${names} ${count} in the call`
  
  
  }

  return (
    <View style = {prepareStyles.container}>
    <SafeAreaView />
    <View style = {prepareStyles.headerContainer}>
    <Icon  name='arrow-back-ios-new' size={RFValue(23)} onPress={()=>{
      goBack()
      addSessionId(null)
    }}/>
    <Icon name='menu' size={RFValue(23)} onPress={()=>console.log('options button pressed')} />
    </View>
    <ScrollView contentContainerStyle={{flex:1}}>
    <View style={prepareStyles.videoContainer}>
    <Text style={prepareStyles.meetingCode}>
      {addHyphens(sessionId)}
    </Text>
    <View style={prepareStyles.camera}>
    {localStream && videoOn ? (

      <RTCView
      streamURL={localStream?.toURL()}
      mirror={true}
      objectFit='cover'
      style={prepareStyles.localVideo}
       />
    ):(
      <Image
      source={{uri:user?.photo}}
      style={prepareStyles.image}

       />
    )
    
    }

    <View style={prepareStyles.toggleContainer}>
      <TouchableOpacity
      onPress={()=>toggleLocal('mic')}
      style={prepareStyles.iconButton}
      >
      {
        micOn ? (
          <Icon name='mic' size={RFValue(20)} color='#fff' />
        ):(
          <Icon name='mic-off' size={RFValue(20)} color='#fff' />
        )
      }     
      </TouchableOpacity>
      <TouchableOpacity
      onPress={()=>toggleLocal('video')}
      style={prepareStyles.iconButton}
      >
      {
        videoOn ? (
          <Icon name='videocam' size={RFValue(20)} color='#fff' />
        ):(
          <Icon name='videocam-off' size={RFValue(20)} color='#fff' />
        )
      }
      </TouchableOpacity>
    </View>

    </View>
    <Text style={prepareStyles.peopleText}>
      {renderParticipantText()}
    </Text>

    </View>
    <View style = {prepareStyles.infoContainer}>
      <View style = {prepareStyles.flexRowBetween}>
        <Icon name='info' size={RFValue(20)} />
        <Text style = {prepareStyles.joiningText}>
          Joining information of the call
        </Text>
        <Icon name='share' size={RFValue(20)}/>
      </View>
      <View style={{marginLeft:38}}>
      
        <Text  >Calling link</Text>
        <Text> 
        call.google.com/{addHyphens(sessionId)}
        </Text>
      </View>
      <View style={prepareStyles.flexRow}>
        <Icon name='verified-user' size={RFValue(20)} />
        <Text> Secured Through Encryption</Text>
      </View>
    </View>

    </ScrollView>
    <View style = {prepareStyles.joinContainer}>
      <TouchableOpacity
      onPress={handleStartCall}
      style = {prepareStyles.joinButton}
      >
      <Text style={prepareStyles.joinButtonText}>
        Join  the call as {user?.name}
      </Text>

      </TouchableOpacity>
     
    </View>
    </View>
  )
}

export default PrepareCallScreen