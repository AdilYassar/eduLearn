import { View, Text, Image } from 'react-native';
import React from 'react';
import { RTCView } from 'react-native-webrtc';
import { peopleStyles } from '../../styles/peopleStyles';
import { MicOff } from 'lucide-react-native';

const People = ({ people, containerDimensions }) => {
  const maxVisibleUsers = 8;
  const visiblePeople = people.slice(0, maxVisibleUsers);
  const othersCount = people.length > maxVisibleUsers ? people.length - maxVisibleUsers : 0;
  
  const gridStyles = containerDimensions 
    ? getGridStyles(visiblePeople.length, containerDimensions.width, containerDimensions.height)
    : {};

  return (
    <View style={peopleStyles.container}>
      {visiblePeople?.map((person, index) => {
        return (
          <View
            key={person.userId || index}
            style={[
              peopleStyles.card,
              person?.speaking ? { borderWidth: 3 } : null,
              gridStyles.item
            ]}
          >
            {person.videoOn && person.streamURL ? (
              <RTCView
                mirror={false}
                objectFit='cover'
                streamURL={person?.streamURL.toURL()}
                style={peopleStyles.rtcVideo}
              />
            ) : (
              <View style={peopleStyles.noVideo}>
                {person?.photo ? (
                  <Image source={{ uri: person.photo }} style={peopleStyles.image} />
                ) : (
                  <Text style={peopleStyles.initial}>
                    {person?.name?.charAt(0) || '?'}
                  </Text>
                )}
              </View>
            )}

            {/* Name Overlay */}
            <Text style={peopleStyles.name}>{person?.name || 'Guest'}</Text>

            {/* Muted Indicator */}
            {!person?.micOn && (
              <View style={peopleStyles.muted}>
                <MicOff size={16} color="white" />
              </View>
            )}
          </View>
        );
      })}

      {/* Show "+X more" indicator if there are more than 8 people */}
      {othersCount > 0 && (
        <View style={peopleStyles.others}>
          <Text style={peopleStyles.othersText}>+{othersCount} more</Text>
        </View>
      )}
    </View>
  );
};

// Function to calculate grid styles dynamically based on participant count (Google Meet style)
const getGridStyles = (count, containerWidth, containerHeight) => {
  if (!containerWidth || !containerHeight) return {};

  let columns = 1;
  let rows = 1;

  // Determine grid layout based on participant count
  if (count === 1) {
    columns = 1;
    rows = 1;
  } else if (count === 2) {
    columns = 2;
    rows = 1;
  } else if (count <= 4) {
    columns = 2;
    rows = 2;
  } else if (count <= 6) {
    columns = 3;
    rows = 2;
  } else if (count <= 8) {
    columns = 4;
    rows = 2;
  }

  // Calculate item dimensions with padding
  const padding = 10;
  const itemWidth = (containerWidth / columns) - padding;
  const itemHeight = (containerHeight / rows) - padding;

  return {
    item: {
      width: itemWidth,
      height: itemHeight,
      margin: padding / 2,
    },
  };
};

export default People;