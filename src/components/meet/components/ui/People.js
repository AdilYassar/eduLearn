/* eslint-disable no-undef */
import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { RTCView } from 'react-native-webrtc';
import { peopleStyles } from '@components/meet/styles/peopleStyles';

const People = ({ people, containerDimensions }) => {
  const maxVisibleUsers = 8; // Maximize to 8 users for layout
  const visiblePeople = people.slice(0, maxVisibleUsers);

  const gridStyles = containerDimensions
    ? getGridStyles(containerDimensions.width, containerDimensions.height, visiblePeople.length)
    : {};

  return (
    <View style={[peopleStyles.container, gridStyles.container]}>
      {visiblePeople.map((person, index) => (
        <View
          key={index}
          style={[
            gridStyles.item, // Dynamic grid item styles
        //    person ?.speaking ? { borderColor: 'red', borderWidth: 2 } : null, // Highlight if speaking
          ]}
        >
          {person?.videoOn && person.streamUrl?.toURL() ? (
            <RTCView
              streamURL={person.streamUrl.toURL()}
              style={styles.video}
              objectFit="cover"
              mirror={true}
            />
          ) : (
            <View style={styles.noVideo}>
              {person?.photo ? (
                <Image source={{ uri: person.photo }} style={styles.image} />
              ) : (
                <Text style={styles.initial}>{person?.name?.charAt(0)}</Text>
              )}
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{person?.name}</Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default People;

// Function to calculate grid styles dynamically based on participant count
const getGridStyles = (containerWidth, containerHeight, count) => {
  if (!containerWidth || !containerHeight) return {};

  // Calculate rows and columns based on the number of participants
  const columns = count === 1 ? 1 : count <= 4 ? 2 : 3; // 1 column for 1 person, 2 for 2-4, 3 for 5-8
  const rows = Math.ceil(count / columns);

  const itemWidth = containerWidth / columns;
  const itemHeight = containerHeight / rows;

  return {
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    item: {
      width: itemWidth,
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
  };
};

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  noVideo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initial: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameContainer: {
    marginTop: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 3,
    borderRadius: 5,
  },
  name: {
    fontSize: 12,
    color: '#fff',
  },
});
