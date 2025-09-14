/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text, Alert, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
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
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const maxRetries = 3
  const isRequestingRef = useRef(false)

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);


  useEffect(()=>{
    const handleParticipantUpdate = updatedParticipants =>{
      setParticipants(updatedParticipants?.participants)
    }
    on('session-info', handleParticipantUpdate)
    
    return ()=>{
      console.log('🧹 Cleaning up PrepareCallScreen...');
      if(localStream){
        console.log('🛑 Stopping local stream tracks...');
        localStream.getTracks().forEach(track => {
          console.log('🛑 Stopping track:', track.kind, track.id);
          track.stop();
        });
        // Don't call release() as it might not be available
        setLocalStream(null);
      }
      // Reset flags
      isRequestingRef.current = false;
      retryCountRef.current = 0;
      off('session-info', handleParticipantUpdate)
    }
  },[sessionId, localStream, on, off])



  const showMediaDevices = (audio, video) => {
    if(audio || video){
      console.log('🎥 Starting media devices...');
      
      // Prevent multiple simultaneous requests
      if (localStream) {
        console.log('🔄 Stream already exists, skipping request');
        return;
      }
      
      // Prevent multiple simultaneous requests
      if (isRequestingRef.current) {
        console.log('🔄 Media request already in progress, skipping...');
        return;
      }
      
      // Check retry limit
      if (retryCountRef.current >= maxRetries) {
        console.log('🚫 Max retries reached, stopping attempts');
        return;
      }
      
      isRequestingRef.current = true;
      
      // Add timeout and better error handling
      const mediaPromise = mediaDevices?.getUserMedia({
        audio,
        video
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Media request timeout')), 10000);
      });
      
      Promise.race([mediaPromise, timeoutPromise])
        .then(stream => {
          // Check if component is still mounted before setting state
          if (!mountedRef.current) {
            console.log('🔄 Component unmounted, cleaning up stream...');
            stream.getTracks().forEach(track => track.stop());
            isRequestingRef.current = false;
            return;
          }
          
          console.log('✅ Media devices started successfully');
          setLocalStream(stream);
          retryCountRef.current = 0; // Reset retry counter on success
          isRequestingRef.current = false;
          
          // Log all tracks for debugging
          console.log('📊 Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled })));
          
          const audioTrack = stream.getAudioTracks()[0];
          const videoTrack = stream.getVideoTracks()[0];
          
          if(audioTrack){
            console.log('🎤 Audio track found, enabling:', audio);
            audioTrack.enabled = audio;
            console.log('🎤 Audio track enabled:', audioTrack.enabled);
          } else {
            console.log('❌ No audio track found in stream');
          }
          
          if(videoTrack){
            console.log('🎥 Video track found, enabling:', video);
            videoTrack.enabled = video;
            console.log('🎥 Video track enabled:', videoTrack.enabled);
          } else {
            console.log('❌ No video track found in stream');
          }
          
          // Double-check the final state
          setTimeout(() => {
            if (localStream) {
              const finalAudioTracks = localStream.getAudioTracks();
              const finalVideoTracks = localStream.getVideoTracks();
              console.log('🔍 Final track status:');
              console.log('  - Audio tracks:', finalAudioTracks.length);
              console.log('  - Video tracks:', finalVideoTracks.length);
              finalAudioTracks.forEach((track, i) => {
                console.log(`  - Audio track ${i}: enabled=${track.enabled}, muted=${track.muted}`);
              });
            }
          }, 1000);
        })
        .catch(err => {
          console.log("❌ Error getting media devices:", err);
          isRequestingRef.current = false;
          
          // Handle specific error types
          if (err.name === 'AbortError') {
            console.log('🔄 AbortError detected, this usually means the request was cancelled');
            // Don't retry immediately for AbortError as it might be due to component unmount
            return; // Exit early, don't retry
          } else if (err.name === 'NotAllowedError') {
            console.log('🚫 Permission denied for media devices');
            return; // Don't retry permission errors
          } else if (err.name === 'NotFoundError') {
            console.log('🔍 No media devices found');
            return; // Don't retry if no devices found
          } else if (err.message === 'Media request timeout') {
            retryCountRef.current++;
            console.log(`⏰ Media request timed out, retry ${retryCountRef.current}/${maxRetries}...`);
            if (retryCountRef.current < maxRetries) {
              setTimeout(() => {
                showMediaDevices(audio, video);
              }, 1000);
            }
          } else {
            // For other errors, retry after a delay
            retryCountRef.current++;
            console.log(`🔄 Unknown error, retry ${retryCountRef.current}/${maxRetries} in 2 seconds...`);
            if (retryCountRef.current < maxRetries) {
              setTimeout(() => {
                showMediaDevices(audio, video);
              }, 2000);
            }
          }
        });
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
      console.log('🔐 Fetching media permissions...');
      const result = await requestPermissions()
      console.log('📋 Permission results:', result);
      
      // Reset retry counter when starting fresh
      retryCountRef.current = 0;
      
      // Store the permission results
      const hasCamera = result.isCameraGranted;
      const hasMic = result.isMicrophoneGranted;
      
      console.log('🎥 Camera permission:', hasCamera);
      console.log('🎤 Microphone permission:', hasMic);
      
      // Only enable features if permissions are granted
      if(hasCamera){
        console.log('✅ Camera permission granted, enabling video...');
        toggleLocal('video');
      } else {
        console.log('❌ Camera permission denied');
      }
      
      if(hasMic){
        console.log('✅ Microphone permission granted, enabling mic...');
        toggleLocal('mic');
      } else {
        console.log('❌ Microphone permission denied');
      }
      
      // Always try to start media devices with the permissions we have
      console.log('🚀 Starting media devices with permissions - Audio:', hasMic, 'Video:', hasCamera);
      showMediaDevices(hasMic, hasCamera);
    }

  // Manual retry function
  const retryMediaDevices = () => {
    console.log('🔄 Manual retry requested...');
    retryCountRef.current = 0; // Reset retry counter
    isRequestingRef.current = false; // Reset request flag
    
    if (localStream) {
      // Stop existing stream first
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    // Wait a bit then retry
    setTimeout(() => {
      showMediaDevices(micOn, videoOn);
    }, 500);
  }

  // Debug audio status
  const debugAudioStatus = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      const videoTracks = localStream.getVideoTracks();
      
      console.log('🔍 Audio Debug Info:');
      console.log('  - Audio tracks count:', audioTracks.length);
      console.log('  - Video tracks count:', videoTracks.length);
      
      audioTracks.forEach((track, index) => {
        console.log(`  - Audio track ${index}:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind
        });
      });
      
      videoTracks.forEach((track, index) => {
        console.log(`  - Video track ${index}:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          kind: track.kind
        });
      });
    } else {
      console.log('🔍 No local stream available');
    }
  }

  // Check and request microphone permission specifically
  const checkMicrophonePermission = async () => {
    console.log('🎤 Checking microphone permission specifically...');
    try {
      const result = await requestPermissions();
      console.log('🎤 Microphone permission result:', result.isMicrophoneGranted);
      
      if (result.isMicrophoneGranted) {
        console.log('✅ Microphone permission granted, restarting media devices...');
        // Restart media devices with microphone enabled
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
        setTimeout(() => {
          showMediaDevices(true, videoOn);
        }, 500);
      } else {
        console.log('❌ Microphone permission still denied');
        // Show alert to user with more specific instructions
        Alert.alert(
          'Microphone Permission Required',
          'To enable audio in calls, please:\n\n1. Go to your device Settings\n2. Apps & notifications > EduLearn\n3. Permissions > Microphone\n4. Turn ON microphone access\n\nThen return and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: () => {
              setTimeout(() => {
                checkMicrophonePermission();
              }, 1000);
            }}
          ]
        );
      }
    } catch (error) {
      console.log('❌ Error checking microphone permission:', error);
    }
  }

  // Force restart with audio enabled
  const forceRestartWithAudio = async () => {
    console.log('🔄 Force restarting with audio enabled...');
    
    // Stop current stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Wait a bit then restart
    setTimeout(async () => {
      try {
        // Request permissions again
        const result = await requestPermissions();
        console.log('🔄 Permission check result:', result);
        
        // Force audio to be true
        const hasAudio = result.isMicrophoneGranted;
        const hasVideo = result.isCameraGranted;
        
        console.log('🎤 Force starting with audio:', hasAudio, 'video:', hasVideo);
        showMediaDevices(hasAudio, hasVideo);
      } catch (error) {
        console.log('❌ Error in force restart:', error);
      }
    }, 1000);
  }

  useEffect(()=>{
    fetchMediaPermissions()
  },[])


  const handleStartCall = async () => {
    try {
      // Debug: Check what's in the user store
      console.log('🔍 Debug - User data before joining session:');
      console.log('  - User object:', user);
      console.log('  - User ID:', user?.id);
      console.log('  - User name:', user?.name);
      console.log('  - User photo:', user?.photo);
      
      if (!user?.id) {
        console.log('❌ ERROR: No user ID found! User must be set in InquiryModal first.');
        Alert.alert(
          'User Not Set',
          'Please set your name and photo in the profile section before joining a call.',
          [{ text: 'OK' }]
        );
        return;
      }
      
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
      {!localStream && (
        <TouchableOpacity
        onPress={retryMediaDevices}
        style={[prepareStyles.iconButton, { backgroundColor: '#ff6b6b' }]}
        >
        <Icon name='refresh' size={RFValue(20)} color='#fff' />
        </TouchableOpacity>
      )}
      <TouchableOpacity
      onPress={debugAudioStatus}
      style={[prepareStyles.iconButton, { backgroundColor: '#4ecdc4' }]}
      >
      <Icon name='bug-report' size={RFValue(20)} color='#fff' />
      </TouchableOpacity>
      <TouchableOpacity
      onPress={checkMicrophonePermission}
      style={[prepareStyles.iconButton, { backgroundColor: '#ff9ff3' }]}
      >
      <Icon name='mic' size={RFValue(20)} color='#fff' />
      </TouchableOpacity>
      <TouchableOpacity
      onPress={forceRestartWithAudio}
      style={[prepareStyles.iconButton, { backgroundColor: '#ffa726' }]}
      >
      <Icon name='refresh' size={RFValue(20)} color='#fff' />
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