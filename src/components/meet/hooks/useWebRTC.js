/* eslint-disable react-hooks/exhaustive-deps */
import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    mediaDevices,
    MediaStream,
} from 'react-native-webrtc';

import { useWS } from '../components/serviceComponent/api/WSProvider';
import { useCallStore } from '../components/serviceComponent/callStore';
import { useUserStore } from '../components/serviceComponent/zustandStore';
import { peerConstraints } from '../utils/Helpers';
import { useEffect, useRef, useState } from 'react';

export const useWebRTC = () => {
    const {
        participants,
        setStreamURL,
        sessionId,
        addSessionId,
        addParticipant,
        micOn,
        clear,
        videoOn,
        toggle,
        removeParticipant,
        updateParticipant,
    } = useCallStore();

    const { user } = useUserStore();
    const [localStream, setLocalStream] = useState(null);
    const { emit, on, off } = useWS();
    const peerConnections = useRef(new Map());
    const pendingCandidates = useRef(new Map());

    const startLocalStream = async () => {
        try {
            const mediaStream = await mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setLocalStream(mediaStream);
        } catch (error) {
            console.error('Error getting user media:', error);
        }
    };

    const establishPeerConnections = async () => {
        participants?.forEach(async (streamUser) => {
            let peerConnection = peerConnections.current.get(streamUser?.id);
    
            // Check if the peer connection exists and if it is not closed
            if (!peerConnection || peerConnection.signalingState === 'closed') {
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(streamUser?.id, peerConnection);
    
                peerConnection.ontrack = (event) => {
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach((track) => {
                        remoteStream.addTrack(track);
                    });
                    console.log('Received remote stream:', remoteStream.toURL());
                    setStreamURL(streamUser?.id, remoteStream);
                };
    
                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        emit('send-ice-candidate', {
                            sessionId,
                            sender: user?.id,
                            receiver: streamUser?.userId,
                            candidate,
                        });
                    }
                };
    
                // Add tracks to peer connection
                localStream?.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }
    
            try {
                // Create and send offer only if peerConnection is in a valid state
                if (peerConnection.signalingState === 'stable' || peerConnection.signalingState === 'have-local-pranswer') {
                    const offerDescription = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offerDescription);
                    emit('send-offer', {
                        sessionId,
                        sender: user?.id,
                        receiver: streamUser?.userId,
                        offer: offerDescription,
                    });
                } else {
                    console.error('PeerConnection is in an invalid state:', peerConnection.signalingState);
                }
            } catch (error) {
                console.error('Error creating or sending offer:', error);
            }
        });
    };
    

    const joiningStream = async () => {
        if (participants?.length > 0) {
            await establishPeerConnections();
        }
    };

    useEffect(() => {
        if (localStream) {
            joiningStream();
        }
    }, [localStream]);

    useEffect(() => {
        startLocalStream();
        return () => {
            localStream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    useEffect(() => {
        if (localStream) {
            on('receive-ice-candidate', handleReceiveIceCandidate);
            on('receive-offer', handleReceiveOffer);
            on('receive-answer', handleReceiveAnswer);
            on('new-participant', handleNewParticipant);
            on('participant-left', handleParticipantLeft);
            on('participant-update', handleParticipantUpdate);

            return () => {
                localStream.getTracks().forEach((track) => track.stop());
                peerConnections.current.forEach((peerConnection) => peerConnection.close());
                peerConnections.current.clear();
                addSessionId(null);
                clear();
                emit('hang-up', { sessionId, userId: user?.id });
                off('receive-ice-candidate');
                off('receive-offer');
                off('receive-answer');
                off('new-participant');
                off('participant-left');
                off('participant-update');
            };
        }
    }, [localStream, on, off, clear, sessionId, user?.id]);

    const handleNewParticipant = (participant) => {
        if (participant?.userId !== user?.id) {
            addParticipant(participant);
        }
    };

    const handleReceiveOffer = async ({ sender, receiver, offer }) => {
        if (receiver !== user?.id) return;

        try {
            let peerConnection = peerConnections.current.get(sender);
            if (!peerConnection) {
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(sender, peerConnection);

                peerConnection.ontrack = (event) => {
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach((track) => {
                        remoteStream.addTrack(track);
                    });
                    console.log('Received remote stream:', remoteStream.toURL());
                    setStreamURL(sender, remoteStream);
                };

                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        emit('send-ice-candidate', {
                            sessionId,
                            sender: receiver,
                            receiver: sender,
                            candidate,
                        });
                    }
                };

                if (pendingCandidates.current.has(sender)) {
                    pendingCandidates.current.get(sender).forEach((candidate) => {
                        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    });
                    pendingCandidates.current.delete(sender);
                }

                localStream?.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            emit('send-answer', {
                sessionId,
                sender: receiver,
                receiver: sender,
                answer,
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const handleReceiveAnswer = async ({ sender, receiver, answer }) => {
        if (receiver !== user?.id) return;

        try {
            const peerConnection = peerConnections.current.get(sender);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleReceiveIceCandidate = async ({ sender, receiver, candidate }) => {
        if (receiver !== user?.id) return;

        try {
            const peerConnection = peerConnections.current.get(sender);
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                if (!pendingCandidates.current.has(sender)) {
                    pendingCandidates.current.set(sender, []);
                }
                pendingCandidates.current.get(sender).push(candidate);
            }
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const handleParticipantLeft = (userId) => {
        removeParticipant(userId);
        const peerConnection = peerConnections.current.get(userId);
        if (peerConnection) {
            peerConnection.close();
            peerConnections.current.delete(userId);
        }
    };

    const handleParticipantUpdate = (updatedParticipant) => {
        updateParticipant(updatedParticipant);
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !micOn;
            });
            toggle('mic');
            emit('toggle-mic', { sessionId, userId: user?.id });
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = !videoOn;
            });
            toggle('video');
            emit('toggle-video', { sessionId, userId: user?.id });
        }
    };

    const switchCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                if (track._switchCamera) {
                    track._switchCamera();
                }
            });
        }
    };

    return {
        localStream,
        participants,
        toggleMic,
        toggleVideo,
        switchCamera,
    };
};
