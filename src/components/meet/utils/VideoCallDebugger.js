import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useCallStore } from '../components/serviceComponent/callStore';
import { useWS } from '../components/serviceComponent/api/WSProvider';
import { useWebRTC } from '../hooks/useWebRTC';

const VideoCallDebugger = () => {
  const { participants, sessionId, micOn, videoOn } = useCallStore();
  const { emit, on } = useWS();
  const { forceReconnection, monitorPeerConnections, startLocalStream, localStream, forceRestartLocalStream } = useWebRTC();
  const [logs, setLogs] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-20)); // Keep last 20 logs
  };

  const handleForceReconnection = (userId) => {
    addLog(`🔄 Manual reconnection triggered for: ${userId}`);
    forceReconnection(userId);
  };

  const handleMonitorConnections = () => {
    addLog('🔍 Manual connection monitoring triggered');
    monitorPeerConnections();
  };

  const handleManualStreamStart = async () => {
    addLog('🎥 Manual stream start triggered');
    try {
      const stream = await startLocalStream();
      if (stream) {
        addLog('✅ Manual stream start completed');
        addLog(`📊 Stream has ${stream.getTracks().length} tracks`);
        addLog(`🎵 Audio tracks: ${stream.getAudioTracks().length}`);
        addLog(`📹 Video tracks: ${stream.getVideoTracks().length}`);
        
        // Check if tracks are actually working
        stream.getTracks().forEach((track, index) => {
          addLog(`🎵 Track ${index}: ${track.kind} - ${track.readyState} - ${track.enabled ? 'Enabled' : 'Disabled'}`);
        });
      } else {
        addLog('⚠️ Stream start returned no stream');
      }
    } catch (error) {
      addLog(`❌ Manual stream start failed: ${error.message}`);
      
      // Provide helpful error messages
      if (error.message.includes('Camera permission')) {
        addLog('💡 Try the "Request Permissions" button first');
        addLog('💡 Check device settings > Apps > Your App > Permissions');
      } else if (error.message.includes('getUserMedia')) {
        addLog('💡 This device may not support WebRTC');
        addLog('💡 Try updating your browser/app');
      } else if (error.message.includes('constraint')) {
        addLog('💡 Camera may be in use by another app');
        addLog('💡 Close other camera apps and try again');
      } else if (error.message.includes('Permission check failed')) {
        addLog('💡 Permission system error - try restarting the app');
      } else {
        addLog('💡 Unknown error - check console for more details');
      }
      
      // Log the full error for debugging
      console.error('Full stream start error:', error);
    }
  };

  const handleRequestPermissions = async () => {
    addLog('🔐 Requesting camera and microphone permissions...');
    try {
      const { requestCameraPermission, requestMicrophonePermission } = await import('../utils/Helpers');
      
      const cameraGranted = await requestCameraPermission();
      const micGranted = await requestMicrophonePermission();
      
      addLog(`🔐 Camera permission: ${cameraGranted ? '✅ Granted' : '❌ Denied'}`);
      addLog(`🔐 Microphone permission: ${micGranted ? '✅ Granted' : '❌ Denied'}`);
      
      if (cameraGranted && micGranted) {
        addLog('🎥 All permissions granted! Try starting stream now.');
      } else {
        addLog('⚠️ Some permissions denied. Check device settings.');
      }
    } catch (error) {
      addLog(`❌ Permission request failed: ${error.message}`);
    }
  };

  const handleCheckCameraStatus = async () => {
    addLog('📷 Checking camera hardware status...');
    try {
      // Try to get a simple video stream to test camera
      const { mediaDevices } = await import('react-native-webrtc');
      
      if (!mediaDevices || !mediaDevices.getUserMedia) {
        addLog('❌ WebRTC mediaDevices not available');
        return;
      }
      
      addLog('🔍 Testing camera with minimal constraints...');
      const testStream = await mediaDevices.getUserMedia({ video: true, audio: false });
      
      if (testStream && testStream.getVideoTracks().length > 0) {
        addLog('✅ Camera hardware working! Video track created.');
        addLog(`📹 Video track: ${testStream.getVideoTracks()[0].readyState}`);
        
        // Stop the test stream
        testStream.getTracks().forEach(track => track.stop());
        addLog('🛑 Test stream stopped');
      } else {
        addLog('⚠️ Camera test created stream but no video tracks');
      }
    } catch (error) {
      addLog(`❌ Camera test failed: ${error.message}`);
      if (error.message.includes('permission')) {
        addLog('💡 Camera permission issue - try Request Permissions first');
      } else if (error.message.includes('constraint')) {
        addLog('💡 Camera constraint issue - camera may be in use');
      } else {
        addLog('💡 Hardware issue - camera may be broken or in use by another app');
      }
    }
  };

  const handleForceRestart = async () => {
    addLog('🔄 Force restarting local stream...');
    try {
      await forceRestartLocalStream();
      addLog('✅ Force restart completed successfully!');
    } catch (error) {
      addLog(`❌ Force restart failed: ${error.message}`);
    }
  };

  // Add local stream status logging
  useEffect(() => {
    if (localStream) {
      addLog(`🎥 Local stream active - Tracks: ${localStream.getTracks().length}`);
      addLog(`🎵 Audio tracks: ${localStream.getAudioTracks().length}, Video tracks: ${localStream.getVideoTracks().length}`);
    } else {
      addLog('❌ No local stream available');
    }
  }, [localStream]);

  useEffect(() => {
    // Check socket connection
    const checkConnection = () => {
      emit('ping', { test: true });
      addLog('🏓 Ping sent to check connection');
    };

    // Listen for socket events
    on('connect', () => {
      setSocketConnected(true);
      addLog('✅ Socket connected');
    });

    on('disconnect', () => {
      setSocketConnected(false);
      addLog('❌ Socket disconnected');
    });

    on('pong', () => {
      addLog('🏓 Pong received - connection working');
    });

    // Backend-specific events
    on('session-info', (data) => {
      addLog(`📊 Session info received: ${data.participants?.length || 0} participants`);
    });

    on('current-room-info', (data) => {
      addLog(`🏠 Room info: ${data.participants?.length || 0} participants, ${data.chat?.length || 0} messages`);
    });

    on('new-participant', (participant) => {
      addLog(`👤 New participant: ${participant.name} (${participant.userId})`);
    });

    on('participant-left', (participant) => {
      addLog(`👋 Participant left: ${participant.name || participant.userId}`);
    });

    on('participant-updated', (participant) => {
      addLog(`🔄 Participant updated: ${participant.name} - Mic: ${participant.micOn ? 'ON' : 'OFF'}, Video: ${participant.videoOn ? 'ON' : 'OFF'}`);
    });

    on('receive-offer', ({ offer, fromUserId }) => {
      addLog(`📞 Received offer from: ${fromUserId}`);
    });

    on('receive-answer', ({ answer, fromUserId }) => {
      addLog(`📞 Received answer from: ${fromUserId}`);
    });

    on('receive-ice-candidate', ({ candidate, fromUserId }) => {
      addLog(`🧊 Received ICE candidate from: ${fromUserId}`);
    });

    on('new-message', (message) => {
      addLog(`💬 New message from ${message.name}: ${message.message}`);
    });

    on('call-ended', () => {
      addLog('📞 Call ended by participant');
    });

    on('error', (error) => {
      addLog(`❌ Error: ${error.message}`);
    });

    checkConnection();

    return () => {
      // Cleanup listeners
    };
  }, [emit, on]);

  useEffect(() => {
    addLog(`📊 Participants count: ${participants.length}`);
    participants.forEach(p => {
      const hasStream = p.streamURL && typeof p.streamURL.toURL === 'function';
      const streamURL = hasStream ? p.streamURL.toURL() : null;
      addLog(`👤 Participant: ${p.name} - Video: ${p.videoOn ? '✅' : '❌'} - Audio: ${p.micOn ? '✅' : '❌'} - Stream: ${hasStream ? '✅' : '❌'} - URL: ${streamURL ? 'Yes' : 'No'}`);
    });
  }, [participants]);

  useEffect(() => {
    addLog(`🎙️ Mic: ${micOn ? 'ON' : 'OFF'} - 📹 Video: ${videoOn ? 'ON' : 'OFF'}`);
  }, [micOn, videoOn]);

  useEffect(() => {
    addLog(`🔑 Session ID: ${sessionId || 'None'}`);
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        🔍 Video Call Debug Console
      </Text>
      <Text style={styles.status}>
        Socket: {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </Text>
      <Text style={styles.status}>
        Session: {sessionId ? `🟢 ${sessionId}` : '🔴 No Session'}
      </Text>
      <Text style={styles.status}>
        Participants: {participants.length}
      </Text>
      <Text style={styles.status}>
        Local Stream: {localStream ? '🟢 Active' : '🔴 Inactive'}
      </Text>
      {localStream && (
        <Text style={styles.status}>
          Stream Tracks: {localStream.getTracks().length} (Audio: {localStream.getAudioTracks().length}, Video: {localStream.getVideoTracks().length})
        </Text>
      )}
      {!localStream && (
        <Text style={styles.status}>
          ⚠️ No local stream - video call cannot work without local stream
        </Text>
      )}
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleMonitorConnections}>
          <Text style={styles.buttonText}>Monitor</Text>
        </TouchableOpacity>
        {participants.map(p => p.userId !== 'self' && (
          <TouchableOpacity 
            key={p.userId} 
            style={styles.button} 
            onPress={() => handleForceReconnection(p.userId)}
          >
            <Text style={styles.buttonText}>Reconnect {p.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={handleManualStreamStart}>
          <Text style={styles.buttonText}>Start Local Stream</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRequestPermissions}>
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCheckCameraStatus}>
          <Text style={styles.buttonText}>Check Camera Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleForceRestart}>
          <Text style={styles.buttonText}>Force Restart Stream</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    width: 300,
    height: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1000,
  },
  header: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  logContainer: {
    flex: 1,
    marginTop: 10,
  },
  logText: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default VideoCallDebugger;
