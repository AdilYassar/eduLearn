import { View, Text, StyleSheet, Image, Animated, PanResponder, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCallStore } from '../serviceComponent/callStore';
import { useUserStore } from '../serviceComponent/zustandStore';
import { useContainerDimensions } from '@components/meet/hooks/useContainerDimensions';
import { RTCView } from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing icons library
import { RFValue } from 'react-native-responsive-fontsize';

const UserView = ({ containerDimensions, localStream }) => {
  const { videoOn } = useCallStore();
  const { user } = useUserStore();

  const [pan, setPan] = useState(new Animated.ValueXY({ x: 0, y: 0 })); // Pan state for translation
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Store final position

  // Function to validate image URLs
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Check if it's a valid URL format
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      // If it's not a valid URL, check if it's a local asset or data URI
      return url.startsWith('data:') || url.startsWith('file:') || url.startsWith('asset:');
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      // Move the view with pan gesture
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (e, gestureState) => {
      // Update the final position after the drag ends
      setPosition({ x: position.x + gestureState.dx, y: position.y + gestureState.dy });
      // Reset pan position for smooth dragging
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  useEffect(() => {
    // Handle when the dimensions change (in case the container is resized)
    const { width, height } = containerDimensions;
    console.log("Container Dimensions:", width, height); // Debugging line
  }, [containerDimensions]);

  // Debugging to ensure localStream and user are valid
  console.log("Local Stream:", localStream);
  console.log("User:", user);
  console.log("Video On:", videoOn);
  console.log("Local Stream Tracks:", localStream?.getTracks()?.length);
  console.log("Local Stream Video Tracks:", localStream?.getVideoTracks()?.length);
  console.log("Local Stream Audio Tracks:", localStream?.getAudioTracks()?.length);

  // Check if stream is actually valid and has tracks
  const hasValidStream = localStream && 
                        localStream.getTracks && 
                        localStream.getTracks().length > 0 &&
                        localStream.getVideoTracks().length > 0;

  console.log("Has Valid Stream:", hasValidStream);
  console.log("Video On:", videoOn);
  console.log("Local Stream:", !!localStream);
  console.log("Final Condition:", videoOn && hasValidStream);
  console.log("Stream URL:", localStream?.toURL ? localStream.toURL() : 'No toURL method');

  return (
    <Animated.View
      {...panResponder.panHandlers} // Attach pan responder to the component
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }], // Apply translation based on pan
        },
      ]}
    >
      {user && (
        <>
          {videoOn && hasValidStream ? (
            <View style={styles.videoContainer}>
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.localVideo}
                mirror={true}
                objectFit="cover"
                zOrder={2}
                onError={(error) => {
                  console.error('❌ RTCView Error:', error);
                }}
                onLoad={() => {
                  console.log('✅ RTCView loaded successfully');
                }}
              />
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔍 Debug Button Pressed');
                  console.log('Video On:', videoOn);
                  console.log('Has Valid Stream:', hasValidStream);
                  console.log('Local Stream:', localStream);
                  console.log('Stream URL:', localStream?.toURL ? localStream.toURL() : 'No toURL method');
                }}
              >
                <Text style={styles.debugText}>🔍</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noVideo}>
              {user?.photo && isValidImageUrl(user.photo) ? (
                <Image 
                  source={{ uri: user.photo }} 
                  style={styles.image}
                  onError={(error) => {
                    console.warn('❌ Failed to load user photo:', user.photo, error);
                  }}
                />
              ) : (
                <Text style={styles.initial}>{user?.name?.charAt(0) || 'U'}</Text>
              )}

              {/* Add the two icons and the "You" label */}
              <View style={styles.iconsContainer}>
                <Icon name="menu" size={RFValue(30)} color="black" style={styles.icon} />
              
              </View>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>You</Text>
              </View>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '22%',
    width: '24%',
    zIndex: 99,
    elevation: 10,
    borderRadius: 20,
    position: 'absolute',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    overflow: 'hidden',
    shadowColor: 'black',
    marginLeft: 10,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  noVideo: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  localVideo: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  initial: {
    fontSize: 20,
    color: 'white',
  },
  iconsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 25, // Adjust position as needed
    zIndex: 1,
    justifyContent: 'space-between',
    width: '60%',
  },
  icon: {
    margin: 5,
  },
  nameContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    zIndex: 99,
    fontWeight: '600',
    color: 'white',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  debugButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  debugText: {
    fontSize: 24,
    color: 'white',
  },
});

export default UserView;
