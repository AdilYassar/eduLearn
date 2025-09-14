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
import { peerConstraints, requestPermissions } from '../utils/Helpers';
import { useEffect, useRef, useState } from 'react';

export const useWebRTC = () => {
    const {
        participants,
        setStreamURL,
        sessionId,
        addSessionId,
        addParticipant,
        initializeCurrentUser,
        getOtherParticipants,
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

    // Remove complex permission checking - using old approach instead
    // const checkPermissions = async () => { ... }

    const startLocalStream = async () => {
        try {
            console.log('🎥 Starting local stream with audio focus...');
            
            // First try to get audio-only stream to ensure audio works
            console.log('🔊 Testing audio-only stream first...');
            try {
                const audioOnlyStream = await mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 48000,
                        channelCount: 1
                    },
                    video: false
                });
                
                const audioTracks = audioOnlyStream.getAudioTracks();
                console.log('✅ Audio-only stream successful, tracks:', audioTracks.length);
                
                if (audioTracks.length > 0) {
                    console.log('🔊 Audio track details:', {
                        id: audioTracks[0].id,
                        enabled: audioTracks[0].enabled,
                        readyState: audioTracks[0].readyState
                    });
                }
                
                // Stop the audio-only stream
                audioOnlyStream.getTracks().forEach(track => track.stop());
            } catch (audioError) {
                console.warn('⚠️ Audio-only stream failed:', audioError.message);
            }
            
            // Now try to get the full stream
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1
                },
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                }
            };
            
            console.log('🎯 Full media constraints:', constraints);
            
            const mediaStream = await mediaDevices.getUserMedia(constraints);
            
            // Verify tracks were created
            const audioTracks = mediaStream.getAudioTracks();
            const videoTracks = mediaStream.getVideoTracks();
            
            console.log('✅ Full stream started successfully');
            console.log('📊 Total tracks:', mediaStream.getTracks().length);
            console.log('🎥 Video tracks:', videoTracks.length);
            console.log('🎤 Audio tracks:', audioTracks.length);
            
            // If no audio tracks, try alternative approach
            if (audioTracks.length === 0) {
                console.warn('⚠️ No audio tracks in full stream, trying alternative approach...');
                
                try {
                    // Try with simpler audio constraints
                    const alternativeStream = await mediaDevices.getUserMedia({
                        audio: true, // Use default audio constraints
                        video: true
                    });
                    
                    const altAudioTracks = alternativeStream.getAudioTracks();
                    console.log('🔄 Alternative stream audio tracks:', altAudioTracks.length);
                    
                    if (altAudioTracks.length > 0) {
                        console.log('✅ Alternative stream successful, using it instead');
                        // Stop the first stream and use the alternative
                        mediaStream.getTracks().forEach(track => track.stop());
                        setLocalStream(alternativeStream);
                        return;
                    } else {
                        console.error('❌ Alternative stream also has no audio tracks');
                    }
                } catch (altError) {
                    console.error('❌ Alternative stream failed:', altError);
                }
            }
            
            // Verify audio track properties
            if (audioTracks.length > 0) {
                const audioTrack = audioTracks[0];
                console.log('🔊 Audio track details:', {
                    id: audioTrack.id,
                    kind: audioTrack.kind,
                    enabled: audioTrack.enabled,
                    muted: audioTrack.muted,
                    readyState: audioTrack.readyState
                });
                
                // Ensure audio track is enabled
                audioTrack.enabled = true;
                console.log('🔊 Audio track enabled set to:', audioTrack.enabled);
            } else {
                console.error('❌ CRITICAL: No audio tracks created despite audio constraints');
            }
            
            // Verify video track properties
            if (videoTracks.length > 0) {
                const videoTrack = videoTracks[0];
                console.log('🎥 Video track details:', {
                    id: videoTrack.id,
                    kind: videoTrack.kind,
                    enabled: videoTrack.enabled,
                    muted: videoTrack.muted,
                    readyState: videoTrack.readyState
                });
            }
            
            // Set the local stream
            setLocalStream(mediaStream);
            console.log('✅ Local stream state updated, new stream ID:', mediaStream.id);
            
        } catch (error) {
            console.error('❌ Error getting user media:', error);
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint
            });
            
            // Try fallback with simpler constraints
            try {
                console.log('🔄 Trying fallback with simpler constraints...');
                const fallbackStream = await mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                });
                
                const fallbackAudioTracks = fallbackStream.getAudioTracks();
                const fallbackVideoTracks = fallbackStream.getVideoTracks();
                
                console.log('✅ Fallback stream successful');
                console.log('📊 Fallback tracks:', fallbackStream.getTracks().length);
                console.log('🎤 Fallback audio tracks:', fallbackAudioTracks.length);
                console.log('🎥 Fallback video tracks:', fallbackVideoTracks.length);
                
                setLocalStream(fallbackStream);
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
            }
        }
    };

    // Manual audio test function for debugging
    const testAudioOnly = async () => {
        try {
            console.log('🔊 Testing audio-only stream manually...');
            const audioStream = await mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            
            const audioTracks = audioStream.getAudioTracks();
            console.log('✅ Manual audio test successful');
            console.log('🎤 Audio tracks created:', audioTracks.length);
            
            if (audioTracks.length > 0) {
                const track = audioTracks[0];
                console.log('🔊 Audio track details:', {
                    id: track.id,
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState
                });
                
                // Test if we can enable/disable the track
                track.enabled = false;
                console.log('🔇 Audio track disabled');
                setTimeout(() => {
                    track.enabled = true;
                    console.log('🔊 Audio track re-enabled');
                }, 1000);
            }
            
            // Stop the test stream after 3 seconds
            setTimeout(() => {
                audioStream.getTracks().forEach(track => track.stop());
                console.log('🛑 Audio test stream stopped');
            }, 3000);
            
            return audioTracks.length > 0;
        } catch (error) {
            console.error('❌ Manual audio test failed:', error);
            return false;
        }
    };

    // Manual stream start function that can be called from outside
    const restartLocalStream = async () => {
        console.log('🔄 Manually restarting local stream...');
        if (localStream) {
            stopLocalStream();
        }
        // Wait a bit before starting new stream
        setTimeout(() => {
            startLocalStream();
        }, 1000);
    };

    // Prevent local stream from being stopped unnecessarily
    const stopLocalStream = () => {
        if (localStream) {
            console.log('🛑 Stopping local stream...');
            localStream.getTracks().forEach((track) => {
                console.log('🛑 Stopping track:', track.kind, track.id);
                track.stop();
            });
            setLocalStream(null);
        }
    };

    const establishPeerConnections = async () => {
        // Only establish connections with other participants (not current user)
        const otherParticipants = participants.filter(p => p.userId !== user?.id);
        
        console.log('🔗 Establishing peer connections for participants:', otherParticipants.map(p => p.userId));
        
        for (const streamUser of otherParticipants) {
            let peerConnection = peerConnections.current.get(streamUser?.userId);
    
            // Check if the peer connection exists and if it is not closed
            if (!peerConnection || peerConnection.connectionState === 'closed') {
                console.log('🆕 Creating new peer connection for:', streamUser?.userId);
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(streamUser?.userId, peerConnection);
    
                peerConnection.ontrack = (event) => {
                    console.log('🎥 Received remote stream from:', streamUser?.userId);
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach((track) => {
                        remoteStream.addTrack(track);
                    });
                    console.log('✅ Setting stream URL for:', streamUser?.userId);
                    setStreamURL(streamUser?.userId, remoteStream);
                };
    
                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        console.log('🧊 Sending ICE candidate to:', streamUser?.userId);
                        emit('send-ice-candidate', {
                            sessionId,
                            candidate,
                            toUserId: streamUser?.userId,
                        });
                    }
                };

                peerConnection.onconnectionstatechange = () => {
                    console.log('🔗 Connection state changed for:', streamUser?.userId, 'State:', peerConnection.connectionState);
                };

                peerConnection.onsignalingstatechange = () => {
                    console.log('📡 Signaling state changed for:', streamUser?.userId, 'State:', peerConnection.signalingState);
                };
    
                // Add tracks to peer connection
                if (localStream) {
                    localStream.getTracks().forEach((track) => {
                        // Ensure audio tracks are enabled for transmission
                        if (track.kind === 'audio') {
                            track.enabled = true;
                            console.log('🔊 Audio track enabled for transmission, Track ID:', track.id);
                        }
                        if (track.kind === 'video') {
                            track.enabled = true;
                            console.log('🎥 Video track enabled for transmission, Track ID:', track.id);
                        }
                        peerConnection.addTrack(track, localStream);
                    });
                    console.log('✅ Added local tracks to peer connection for:', streamUser?.userId);
                }
            }
    
            // Wait a bit for the connection to stabilize before creating offer
            setTimeout(async () => {
                try {
                    const currentPeerConnection = peerConnections.current.get(streamUser?.userId);
                    if (currentPeerConnection && currentPeerConnection.signalingState === 'stable') {
                        console.log('�� Creating offer for:', streamUser?.userId);
                        const offerDescription = await currentPeerConnection.createOffer();
                        await currentPeerConnection.setLocalDescription(offerDescription);
                        console.log('📤 Sending offer to:', streamUser?.userId);
                        emit('send-offer', {
                            sessionId,
                            offer: offerDescription,
                            toUserId: streamUser?.userId,
                        });
                    } else {
                        console.log('⏳ Peer connection not ready for offer:', streamUser?.userId, 'State:', currentPeerConnection?.signalingState);
                    }
                } catch (error) {
                    console.error('❌ Error creating or sending offer for:', streamUser?.userId, error);
                }
            }, 1000); // Wait 1 second for connection to stabilize
        }
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

    // Complete old working approach - fetchMediaPermissions
    const fetchMediaPermissions = async () => {
        try {
            console.log('🔐 Fetching media permissions (old approach)...');
            const result = await requestPermissions();
            
            console.log('📋 Permission results received:', result);
            
            // Check if we have the expected permission structure
            const hasMicPermission = result.isMicrophoneGranted || result.isMicGranted;
            const hasCameraPermission = result.isCameraGranted;
            
            console.log('🔍 Permission check:', {
                hasMicPermission,
                hasCameraPermission,
                originalResult: result
            });
            
            if (hasCameraPermission) {
                console.log('✅ Camera permission granted, enabling video...');
                toggle('video'); // Enable video state
            }
            if (hasMicPermission) {
                console.log('✅ Microphone permission granted, enabling mic...');
                toggle('mic'); // Enable mic state
            }
            
            // Start media devices with permissions
            console.log('🚀 Starting media devices with permissions:', {
                audio: hasMicPermission,
                video: hasCameraPermission
            });
            
            showMediaDevices(hasMicPermission, hasCameraPermission);
            
            // Also try direct approach as backup
            if (hasMicPermission || hasCameraPermission) {
                console.log('🔄 Also trying direct stream start as backup...');
                setTimeout(() => {
                    startLocalStream();
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error fetching permissions:', error);
        }
    };

    // Show media devices function (from old working code)
    const showMediaDevices = (audio, video) => {
        if (audio || video) {
            console.log('🎥 Starting media devices with audio focus...');
            console.log('🎯 Audio requested:', audio, 'Video requested:', video);
            
            // Ensure audio constraints are properly set
            const audioConstraints = audio ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000,
                channelCount: 1
            } : false;
            
            const videoConstraints = video ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            } : false;
            
            console.log('🎯 Audio constraints:', audioConstraints);
            console.log('🎯 Video constraints:', videoConstraints);
            
            // Add timeout and better error handling
            const mediaPromise = mediaDevices?.getUserMedia({
                audio: audioConstraints,
                video: videoConstraints
            });
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Media request timeout')), 10000);
            });
            
            Promise.race([mediaPromise, timeoutPromise])
                .then(stream => {
                    console.log('✅ Media devices started successfully');
                    
                    const audioTracks = stream.getAudioTracks();
                    const videoTracks = stream.getVideoTracks();
                    
                    console.log('📊 Stream details:', {
                        totalTracks: stream.getTracks().length,
                        audioTracks: audioTracks.length,
                        videoTracks: videoTracks.length
                    });
                    
                    // Log audio track details if present
                    if (audioTracks.length > 0) {
                        audioTracks.forEach((track, index) => {
                            console.log(`🔊 Audio track ${index}:`, {
                                id: track.id,
                                kind: track.kind,
                                enabled: track.enabled,
                                muted: track.muted,
                                readyState: track.readyState
                            });
                        });
                    } else if (audio) {
                        console.warn('⚠️ Audio requested but no audio tracks created');
                        
                        // Try to get audio-only stream as fallback
                        console.log('🔄 Trying audio-only fallback...');
                        mediaDevices.getUserMedia({ audio: true, video: false })
                            .then(audioStream => {
                                const fallbackAudioTracks = audioStream.getAudioTracks();
                                console.log('🔄 Audio fallback tracks:', fallbackAudioTracks.length);
                                
                                if (fallbackAudioTracks.length > 0) {
                                    // Add audio track to existing stream
                                    const audioTrack = fallbackAudioTracks[0];
                                    stream.addTrack(audioTrack);
                                    console.log('✅ Added fallback audio track to stream');
                                    
                                    // Stop the audio-only stream
                                    audioStream.getTracks().forEach(track => track.stop());
                                }
                            })
                            .catch(audioError => {
                                console.error('❌ Audio fallback failed:', audioError);
                            });
                    }
                    
                    // Log video track details if present
                    if (videoTracks.length > 0) {
                        videoTracks.forEach((track, index) => {
                            console.log(`🎥 Video track ${index}:`, {
                                id: track.id,
                                kind: track.kind,
                                enabled: track.enabled,
                                muted: track.muted,
                                readyState: track.readyState
                            });
                        });
                    } else if (video) {
                        console.warn('⚠️ Video requested but no video tracks created');
                    }
                    
                    setLocalStream(stream);
                    
                    // Ensure tracks are properly enabled
                    if (audioTracks.length > 0) {
                        audioTracks.forEach(track => {
                            track.enabled = audio;
                            console.log(`🔊 Audio track ${track.id} enabled:`, track.enabled);
                        });
                    }
                    if (videoTracks.length > 0) {
                        videoTracks.forEach(track => {
                            track.enabled = video;
                            console.log(`🎥 Video track ${track.id} enabled:`, track.enabled);
                        });
                    }
                })
                .catch(err => {
                    console.log("❌ Error getting media devices:", err);
                    console.log("❌ Error details:", {
                        name: err.name,
                        message: err.message,
                        constraint: err.constraint
                    });
                    
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
                        console.log('⏰ Media request timed out, retrying...');
                        setTimeout(() => {
                            showMediaDevices(audio, video);
                        }, 1000);
                    } else {
                        // For other errors, retry after a delay
                        console.log('🔄 Unknown error, retrying in 2 seconds...');
                        setTimeout(() => {
                            showMediaDevices(audio, video);
                        }, 2000);
                    }
                });
        }
    };

    // Use the old working approach on mount
    useEffect(() => {
        fetchMediaPermissions();
        
        // Test audio after a short delay to help debug
        setTimeout(() => {
            console.log('🔊 Testing audio after mount...');
            testAudioOnly();
        }, 2000);
    }, []); // Only run once on mount

    // Separate cleanup for when component unmounts
    useEffect(() => {
        return () => {
            console.log('🧹 Component unmounting - cleaning up all resources');
            stopLocalStream(); // Use the new function
            peerConnections.current.forEach((peerConnection, userId) => {
                console.log('🔒 Closing peer connection for:', userId);
                peerConnection.close();
            });
            peerConnections.current.clear();
            pendingCandidates.current.clear();
        };
    }, []); // Empty dependency array - only runs on unmount

    useEffect(() => {
        if (localStream) {
            // Initialize current user as participant
            if (user) {
                console.log('👤 Initializing current user with video enabled');
                initializeCurrentUser(user, localStream);
            }
            
            // Join the session first
            if (sessionId && user) {
                console.log('🚀 Joining session:', sessionId);
                console.log('🔍 Debug - User data in useWebRTC:');
                console.log('  - User object:', user);
                console.log('  - User ID:', user?.id);
                console.log('  - User name:', user?.name);
                
                if (!user?.id) {
                    console.log('❌ ERROR: No user ID found in useWebRTC!');
                    return;
                }
                
                emit('join-session', {
                    sessionId,
                    userId: user.id,
                    name: user.name,
                    photo: user.photo,
                    micOn: micOn,
                    videoOn: videoOn
                });
            }
            
            // Set up event listeners only once when localStream is available
            const setupEventListeners = () => {
                on('receive-ice-candidate', handleReceiveIceCandidate);
                on('receive-offer', handleReceiveOffer);
                on('receive-answer', handleReceiveAnswer);
                on('new-participant', handleNewParticipant);
                on('participant-left', handleParticipantLeft);
                on('participant-updated', handleParticipantUpdate);
                on('session-info', handleSessionInfo);
            };
            
            setupEventListeners();

            return () => {
                console.log('🧹 Cleaning up event listeners only');
                // Don't stop local stream here - just remove event listeners
                off('receive-ice-candidate');
                off('receive-offer');
                off('receive-answer');
                off('new-participant');
                off('participant-left');
                off('participant-updated');
                off('session-info');
            };
        }
    }, [localStream]); // Only depend on localStream, not other variables that change frequently

    // Join session when sessionId changes
    useEffect(() => {
        if (sessionId && user && localStream) {
            console.log('🚀 Session ID changed, joining session:', sessionId);
            emit('join-session', {
                sessionId,
                userId: user.id,
                name: user.name,
                photo: user.photo,
                micOn: micOn,
                videoOn: videoOn
            });
        }
    }, [sessionId, user, localStream, emit, micOn, videoOn]);

    // Update current user's stream when localStream changes
    useEffect(() => {
        if (localStream && user) {
            console.log('🔄 Setting current user stream URL, stream ID:', localStream.id);
            setStreamURL(user.id, localStream);
        }
    }, [localStream, user?.id, setStreamURL]);

    // Remove complex video enabling logic - using old approach instead
    // useEffect(() => {
    //     if (localStream && !videoOn) {
    //         console.log('🎥 Enabling video since local stream is available');
    //         toggle('video');
    //     }
    // }, [localStream, videoOn]);

    // Remove complex video tracks enabling - using old approach instead
    // useEffect(() => {
    //     if (localStream) {
    //         const videoTracks = localStream.getVideoTracks();
    //         if (videoTracks.length > 0) {
    //             console.log('🎥 Enabling video tracks in local stream');
    //             videoTracks.forEach(track => {
    //                 track.enabled = true;
    //             });
    //         }
    //     }
    // }, [localStream]);

    // Monitor local stream state changes
    useEffect(() => {
        console.log('🔍 Local Stream State Changed:', {
            hasStream: !!localStream,
            streamId: localStream?.id,
            trackCount: localStream?.getTracks()?.length,
            videoTrackCount: localStream?.getVideoTracks()?.length,
            audioTrackCount: localStream?.getAudioTracks()?.length
        });
    }, [localStream]);

    // Update current user's stream when localStream changes

    const handleNewParticipant = (participant) => {
        if (participant?.userId !== user?.id) {
            console.log('🆕 Adding new participant:', participant);
            addParticipant(participant);
            
            // Establish peer connection for new participant
            if (localStream) {
                console.log('🔗 Establishing peer connection for new participant:', participant.userId);
                establishPeerConnections();
            }
        }
    };

    const handleReceiveOffer = async ({ offer, fromUserId }) => {
        if (fromUserId === user?.id) return;

        try {
            let peerConnection = peerConnections.current.get(fromUserId);
            if (!peerConnection || peerConnection.connectionState === 'closed') {
                console.log('🆕 Creating peer connection for incoming offer from:', fromUserId);
                peerConnection = new RTCPeerConnection(peerConstraints);
                peerConnections.current.set(fromUserId, peerConnection);

                peerConnection.ontrack = (event) => {
                    console.log('🎥 Received remote stream from offer sender:', fromUserId);
                    const remoteStream = new MediaStream();
                    event.streams[0].getTracks().forEach((track) => {
                        remoteStream.addTrack(track);
                    });
                    console.log('✅ Setting stream URL for offer sender:', fromUserId);
                    setStreamURL(fromUserId, remoteStream);
                };

                peerConnection.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        console.log('🧊 Sending ICE candidate to offer sender:', fromUserId);
                        emit('send-ice-candidate', {
                            sessionId,
                            candidate,
                            toUserId: fromUserId,
                        });
                    }
                };

                peerConnection.onconnectionstatechange = () => {
                    console.log('🔗 Connection state changed for offer sender:', fromUserId, 'State:', peerConnection.connectionState);
                };

                peerConnection.onsignalingstatechange = () => {
                    console.log('📡 Signaling state changed for offer sender:', fromUserId, 'State:', peerConnection.signalingState);
                };

                if (pendingCandidates.current.has(fromUserId)) {
                    console.log('🧊 Processing pending ICE candidates for:', fromUserId);
                    const candidates = pendingCandidates.current.get(fromUserId);
                    for (const candidate of candidates) {
                        try {
                            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                            console.log('✅ Added pending ICE candidate for:', fromUserId);
                        } catch (error) {
                            console.error('❌ Error adding pending ICE candidate for:', fromUserId, error);
                        }
                    }
                    pendingCandidates.current.delete(fromUserId);
                }

                localStream?.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            // Set the remote description from the offer
            console.log('📥 Setting remote description from offer for:', fromUserId);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Create and send answer
            console.log('📤 Creating answer for offer from:', fromUserId);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            console.log('📤 Sending answer to offer sender:', fromUserId);
            emit('send-answer', {
                sessionId,
                answer,
                toUserId: fromUserId,
            });
        } catch (error) {
            console.error('❌ Error handling offer from:', fromUserId, error);
        }
    };

    const handleReceiveAnswer = async ({ answer, fromUserId }) => { // Fixed parameter names
        if (fromUserId === user?.id) return; // Fixed logic

        try {
            const peerConnection = peerConnections.current.get(fromUserId);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleReceiveIceCandidate = async ({ candidate, fromUserId }) => {
        if (fromUserId === user?.id) return;

        try {
            const peerConnection = peerConnections.current.get(fromUserId);
            if (peerConnection && peerConnection.connectionState !== 'closed') {
                console.log('✅ Adding ICE candidate for:', fromUserId, 'Connection state:', peerConnection.connectionState);
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('✅ ICE candidate added successfully for:', fromUserId);
            } else {
                console.log('⏳ Queueing ICE candidate for:', fromUserId, 'Peer connection ready:', !!peerConnection, 'Connection state:', peerConnection?.connectionState);
                if (!pendingCandidates.current.has(fromUserId)) {
                    pendingCandidates.current.set(fromUserId, []);
                }
                pendingCandidates.current.get(fromUserId).push(candidate);
            }
        } catch (error) {
            console.error('❌ Error handling ICE candidate from:', fromUserId, error);
        }
    };

    const handleParticipantLeft = (userId) => {
        console.log('👋 Participant left:', userId);
        removeParticipant(userId);
        const peerConnection = peerConnections.current.get(userId);
        if (peerConnection) {
            console.log('🔒 Closing peer connection for left participant:', userId);
            peerConnection.close();
            peerConnections.current.delete(userId);
        }
    };

    const handleParticipantUpdate = (updatedParticipant) => {
        console.log('🔄 Participant updated:', updatedParticipant);
        updateParticipant(updatedParticipant);
    };

    const handleSessionInfo = (info) => {
        console.log('💡 Session Info received:', info);
        if (info.participants && Array.isArray(info.participants)) {
            console.log('👥 Server participants:', info.participants);
            // You can update your store with server participant info if needed
        }
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track) => {
                track.enabled = !micOn;
            });
            toggle('mic');
            
            // Update current user's participant state
            if (user) {
                updateParticipant({
                    userId: user.id,
                    micOn: !micOn,
                    videoOn: videoOn
                });
            }
            
            emit('toggle-mic', { sessionId, userId: user?.id, micOn: !micOn }); // Fixed parameters
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track) => {
                track.enabled = !videoOn;
            });
            toggle('video');
            
            // Update current user's participant state
            if (user) {
                updateParticipant({
                    userId: user.id,
                    micOn: micOn,
                    videoOn: !videoOn
                });
            }
            
            emit('toggle-video', { sessionId, userId: user?.id, videoOn: !videoOn }); // Fixed parameters
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

    // Monitor local stream health
    useEffect(() => {
        if (localStream) {
            const interval = setInterval(() => {
                const videoTracks = localStream.getVideoTracks();
                const audioTracks = localStream.getAudioTracks();
                
                console.log('🔍 Local stream health check:');
                console.log('  🎥 Video tracks:', videoTracks.length);
                console.log('  🎤 Audio tracks:', audioTracks.length);
                
                // Check if tracks are still active
                const hasActiveTracks = videoTracks.some(track => track.readyState === 'live') || 
                                       audioTracks.some(track => track.readyState === 'live');
                
                if (!hasActiveTracks && videoTracks.length > 0) {
                    console.log('⚠️ Local stream tracks are not active, attempting recovery...');
                    // Try to restart the stream
                    setTimeout(() => {
                        if (!localStream || localStream.getTracks().every(track => track.readyState !== 'live')) {
                            console.log('🔄 Restarting local stream...');
                            startLocalStream();
                        }
                    }, 1000);
                }
                
                videoTracks.forEach((track, index) => {
                    console.log(`  🎥 Video track ${index}:`, {
                        id: track.id,
                        enabled: track.enabled,
                        readyState: track.readyState,
                        muted: track.muted
                    });
                });
                
                audioTracks.forEach((track, index) => {
                    console.log(`  🎤 Audio track ${index}:`, {
                        id: track.id,
                        enabled: track.enabled,
                        readyState: track.readyState,
                        muted: track.muted
                    });
                });
            }, 10000); // Check every 10 seconds

            return () => clearInterval(interval);
        }
    }, [localStream]);

    // Monitor peer connection states
    useEffect(() => {
        const interval = setInterval(() => {
            peerConnections.current.forEach((peerConnection, userId) => {
                if (peerConnection.connectionState === 'closed' || peerConnection.connectionState === 'failed') {
                    console.log('⚠️ Peer connection in bad state for:', userId, 'State:', peerConnection.connectionState);
                    // Remove failed connections
                    peerConnections.current.delete(userId);
                }
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('🔍 useWebRTC Debug - Participants:', participants);
        console.log('🔍 useWebRTC Debug - Other participants:', getOtherParticipants ? getOtherParticipants() : []);
        console.log('🔍 useWebRTC Debug - Session ID:', sessionId);
        console.log('🔍 useWebRTC Debug - Local Stream:', localStream ? 'Active' : 'Inactive');
        console.log('🔍 useWebRTC Debug - Peer Connections:', peerConnections.current.size);
        
        // Enhanced local stream debugging
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            const audioTracks = localStream.getAudioTracks();
            console.log('🔍 Local Stream Details:');
            console.log('  🎥 Video tracks:', videoTracks.length);
            console.log('  🎤 Audio tracks:', audioTracks.length);
            console.log('  📱 Stream ID:', localStream.id);
            console.log('  🔄 Stream active:', !localStream.ended);
            
            videoTracks.forEach((track, index) => {
                console.log(`  🎥 Video track ${index}:`, {
                    id: track.id,
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState,
                    muted: track.muted
                });
            });
            
            audioTracks.forEach((track, index) => {
                console.log(`  🎤 Audio track ${index}:`, {
                    id: track.id,
                    kind: track.kind,
                    enabled: track.enabled,
                    readyState: track.readyState,
                    muted: track.muted
                });
            });
        } else {
            console.log('🔍 Local Stream: NULL - Stream not started yet');
        }
        
        // Log peer connection states
        peerConnections.current.forEach((peerConnection, userId) => {
            console.log('🔗 Peer connection for:', userId, 'State:', peerConnection.connectionState, 'Signaling:', peerConnection.signalingState);
        });
    }, [participants, getOtherParticipants, sessionId, localStream]);

    // Log when new participants are added
    useEffect(() => {
        if (participants.length > 0) {
            console.log('👥 Participants updated:', participants.map(p => ({ id: p.userId, name: p.name, hasStream: !!p.streamURL })));
        }
    }, [participants]);

    // Function to monitor audio levels
    const monitorAudioLevels = () => {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                if (track.enabled) {
                    console.log('🔊 Audio track active:', track.id, 'Muted:', track.muted, 'Ready state:', track.readyState);
                }
            });
        }
    };

    // Monitor audio levels periodically
    useEffect(() => {
        if (localStream) {
            const interval = setInterval(monitorAudioLevels, 5000); // Check every 5 seconds
            return () => clearInterval(interval);
        }
    }, [localStream]);

    return {
        localStream,
        participants,
        getOtherParticipants,
        toggleMic,
        toggleVideo,
        switchCamera,
        sessionId, // Add sessionId for debugging
        restartLocalStream, // Add the new function to the return object
        testAudioOnly, // Add the new function to the return object
    };
};
