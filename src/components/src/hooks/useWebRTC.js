/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React,{useState,useEffect,useRef} from "react";
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    MediaStream,
    mediaDevices
} from '@livekit/react-native-webrtc';
import { useWS } from "../service/api/WSProvider";
import { useUserStore } from "../service/userStore";
import { useLiveMeetStore } from "../service/meetStore";
import { Alert } from "react-native";
import { removeHyphens } from "../utils/Helpers";
import { peerConstraints } from "../utils/Helpers";


export const useWebRTC = () => {
    const{
        participants,
        setStreamURL,
        sessionId,
        addSessionId,
        addParticipant,
        micOn,
        videoOn,
        toggle,
        removeParticipant,
        updateParticipant,
        clear,
        addMessage
    } = useLiveMeetStore();

    const {user} = useUserStore();
    const [localStream,setLocalStream] = useState(null);
    const {emit,on,off} = useWS();
    const peerConnections = useRef(new Map());
    const pendingCandidates = useRef(new Map()); 
    
    const startLocalStream = async ()=>{
        try {
            const mediaStream = await mediaDevices.getUserMedia({
                audio:true,
                video:true
            });
            setLocalStream(mediaStream);
        } catch (error) {
            console.log('Error accessing media devices.',error);
            Alert.alert('Error','Could not access camera and microphone. Please check permissions.');
        }
    }

    useEffect(() => {
        const handleReceiveChat = ({ userId, name, message }) => {
            addMessage({ userId, name, message, timestamp: new Date() });
        };
        on('receive-chat', handleReceiveChat);
        return () => off('receive-chat', handleReceiveChat);
    }, [on, off, addMessage]);


    const establishPeerConnections = async()=>{
        participants?.forEach(async streamUser =>{
            if(!peerConnections.current.has(streamUser?.userId)){
                const peerConnection =  new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(streamUser?.userId,peerConnection);
                
                peerConnection.ontrack = event =>{
                    const remoteStream = new MediaStream();
                    event.streams[0]?.getTracks().forEach(track =>{
                        remoteStream.addTrack(track);
                    })
                    console.log('receiving remote stream', remoteStream.toURL());
                    
                    setStreamURL(streamUser?.userId,remoteStream)
                }

                peerConnection.onicecandidate = ({candidate})=>{
                    if(candidate){
                        emit('send-ice-candidate',{
                            sessionId,
                            sender:user?.id,
                            receiver:streamUser?.userId,
                            candidate
                        });
                    }
                };

                localStream?.getTracks().forEach(track =>{
                    peerConnection.addTrack(track,localStream);
                });

                try {
                    const offerDescription = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offerDescription);
                    emit('send-offer',{
                        sessionId,
                        sender:user?.id,
                        receiver:streamUser?.userId,
                        offer:offerDescription
                    });
                } catch (error) {
                    console.error('Error creating offer.',error);
                }
            }
        });
    };

    const joiningStream = async ()=>{
        await establishPeerConnections();

    }



    useEffect(()=>{
        if(localStream){
            joiningStream();
        }
    },[localStream])



    useEffect(()=>{
        startLocalStream();
        if(localStream){
            return ()=>{
                localStream.getTracks()?.forEach(track => track.stop());
            }
        }
    },[])



    useEffect(()=>{
        if(localStream){
            on('receive-ice-candidate',handleReceiveIceCandidate);
            on('receive-offer',handleReceiveOffer);
            on('receive-answer',handleReceiveAnswer);
            on('new-participant',handleNewParticipant);
            on('participant-left',handleParticipantLeft);
            on('participant-update',handleParticipantUpdate);


            return()=>{
                localStream?.getTracks().forEach(track => track.stop());
                peerConnections.current.forEach(pc => pc.close());
                peerConnections.current.clear();
                addSessionId(null);
                clear();
                emit('hang-up');
                off('receive-ice-candidate');
                off('receive-offer');
                off('receive-answer');
                off('new-participant');
                off('participant-left');
                off('participant-update');

            }
        }

    },[localStream])



    const handleNewParticipant = participant =>{
        if(participant?.userId === user?.id)    return;
        addParticipant(participant);
    }


    const handleReceiveOffer =  async({sender, receiver,offer})=>{
        if(receiver !== user?.id) return;

        try {
            let peerConnection = peerConnections.current.get(sender)


            if(!peerConnection){
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(sender,peerConnection);
                peerConnection.ontrack = event =>{
                    const remoteStream = new MediaStream();
                    event.streams[0]?.getTracks().forEach(track =>{
                        remoteStream.addTrack(track);
                        console.log('recieving remote streem', remoteStream.toURL());
                    });
                    setStreamURL(sender,remoteStream)
                }

                peerConnection.onicecandidate = ({candidate})=>{
                    if(candidate){
                        emit('send-ice-candidate',{
                            sessionId,
                            sender:receiver,
                            receiver:sender,
                            candidate
                        })
                    }
                }
                if(pendingCandidates.current.has(sender)){
                    pendingCandidates.current.get(sender).forEach(candidate =>{
                        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    })
                    pendingCandidates.current.delete(sender);
                }
                if(localStream){
                    localStream.getTracks().forEach(track =>{
                        peerConnection.addTrack(track,localStream);
                    })
                }
            }


            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            emit('send-answer',{
                sessionId,
                sender:receiver,
                receiver:sender,
                answer
            })
        } catch (error) {
            console.error('Error handling received offer.',error);
        }
    }

  const handleReceiveAnswer = async ({sender,receiver,answer})=>{
    if(receiver !== user?.id) return;
    const peerConnection = peerConnections.current.get(sender)
    if(peerConnection){
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    }
  }


  const handleReceiveIceCandidate = async({sender,receiver,candidate})=>{
    if(receiver !== user?.id) return;
    const peerConnection = peerConnections.current.get(sender);
    if(peerConnection){
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

    }else{
        if(!pendingCandidates.current.has(sender)){
            pendingCandidates.current.set(sender,[]);

        }
        pendingCandidates.current.get(sender).push(candidate);
    }


  }

  const handleParticipantLeft = ({userId})=>{
    removeParticipant(userId);
    const pc = peerConnections.current.get(userId);
    if(pc){
        pc.close();
        peerConnections.current.delete(userId);
    }
  }


  const handleParticipantUpdate = updatedParticipant =>{
    updateParticipant(updatedParticipant);

     
  }

  const toggleMic = () =>{
    if(localStream){
        localStream.getAudioTracks().forEach(track =>{
            micOn?(track.enabled = false):(track.enabled = true); 
        });
    }

    toggle('mic');
    emit('toggle-mute',{sessionId,userId:user?.id,})
  };

    const toggleVideo = () =>{
         if(localStream){
        localStream.getVideoTracks().forEach(track =>{
            videoOn?(track.enabled = false):(track.enabled = true); 
        });
    }

    toggle('video');
    emit('toggle-video',{sessionId,userId:user?.id,})
    }


    const switchCamera = () =>{
        if(localStream){
           localStream.getVideoTracks().forEach(track =>{
            track._switchCamera();
           })
        }
    };











































    return{
        localStream,
        participants,
        toggleMic,
        toggleVideo,
        switchCamera,

    }
}