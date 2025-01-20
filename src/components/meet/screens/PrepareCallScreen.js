/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useWS } from '../components/serviceComponent/api/WSProvider'
import { useCallStore } from '../components/serviceComponent/callStore'
import {RTCView,mediaDevices } from 'react-native-webrtc'
import { prepareStyles } from '../styles/prepareStyles'
import { useUserStore } from '../components/serviceComponent/zustandStore'


const PrepareCallScreen = () => {
  const {emit, on, off} = useWS()
  const {addParticipant, sessionId, addSessionId,toggle,micOn, videoOn} = useCallStore()
  const {user} = useUserStore()
  const [localStream, setLocalStream] = useState(null)
  const [participants, setParticipants] = useState([])



  useEffect(()=>{
    const handleParticipantUpdate = updatedParticipants =>{
      setParticipants(updatedParticipants)
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
      }).catch(err => {
        console.log("Error gettting media devices",err)
      })
    }
  }

  return (
    <View>
      <Text>PrepareCallScreen</Text>
    </View>
  )
}

export default PrepareCallScreen