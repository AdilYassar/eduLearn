import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import React, { useRef } from 'react';
import { useLiveMeetStore } from '../../service/meetStore';
import { useUserStore } from '../../service/userStore';
import { RTCView } from 'react-native-webrtc';

const UserView = ({ localStream, containerDimensions }) => {
  const { width: containerWidth, height: containerHeight } = containerDimensions;
  const { videoOn } = useLiveMeetStore();
  const { user } = useUserStore();

  const pan = useRef(
    new Animated.ValueXY({
      x: containerWidth ? containerWidth - containerWidth * 0.24 - 10 : 0,
      y: containerHeight ? containerHeight - containerHeight * 0.26 - 20 : 0,
    }),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (event, gestureState) => {
        pan.flattenOffset();
        const { dx, dy } = gestureState;
        const draggedToX = pan.x._value + dx;
        const draggedToY = pan.y._value + dy;

        // Safety check to prevent NaN
        if (!containerWidth || !containerHeight) return;

        const restrictedX = Math.min(
          Math.max(draggedToX, 0),
          containerWidth - containerWidth * 0.24,
        );
        const restrictedY = Math.min(
          Math.max(draggedToY, 0),
          containerHeight - containerHeight * 0.24,
        );
        const distance = {
          topLeft: Math.sqrt(restrictedX ** 2 + restrictedY ** 2),
          topRight: Math.sqrt(
            (containerWidth - restrictedX) ** 2 + restrictedY ** 2,
          ),
          bottomLeft: Math.sqrt(
            restrictedX ** 2 + (containerHeight - restrictedY) ** 2,
          ),
          bottomRight: Math.sqrt(
            (containerWidth - restrictedX) ** 2 +
              (containerHeight - restrictedY) ** 2,
          ),
        };

        const closestCorner = Object.keys(distance).reduce((a, b) =>
          distance[a] < distance[b] ? a : b,
        );
        let finalX = 0;
        let finalY = 0;
        switch (closestCorner) {
          case 'topLeft':
            finalX = 10;
            finalY = 10;
            break;
          case 'topRight':
            finalX = containerWidth - containerWidth * 0.24 - 10;
            finalY = 10;
            break;
          case 'bottomLeft':
            finalX = 10;
            finalY = containerHeight - containerHeight * 0.26 - 20;
            break;
          case 'bottomRight':
            finalX = containerWidth - containerWidth * 0.24 - 10;
            finalY = containerHeight - containerHeight * 0.26 - 20;
            break;
        }

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
    >
      {user && (
        <>
          {localStream && videoOn ? (
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localVideo}
              mirror={true}
              objectFit="cover"
              zOrder={2}
            />
          ) : (
            <>
              {user?.photo ? (
                <View style={styles.videoContainer}>
                  <Image source={{ uri: user.photo }} style={styles.image} />
                  <Text style={styles.nameOverlay}>{user.name}</Text>
                </View>
              ) : (
                <View style={styles.noVideo}>
                  <Text style={styles.initial}> {user.name.charAt(0)}</Text>
                  <Text style={styles.nameOverlay}>{user.name}</Text>
                </View>
              )}
            </>
          )}
        </>
      )}
      {localStream && videoOn && (
        <Text style={styles.nameOnVideo}>{user.name}</Text>
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
    overflow: 'visible',
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
  nameOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  nameOnVideo: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  name: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    zIndex: 100,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
});

export default UserView;
