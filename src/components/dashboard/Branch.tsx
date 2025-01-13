/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const Branch = () => {
  const [branches, setBranches] = useState([]); // State to hold branch data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [numColumns, setNumColumns] = useState(3);  // Setting columns for the grid layout

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('https://3506-101-53-234-27.ngrok-free.app/api/branches'); // Replace with your API endpoint for branches
        const data = await response.json();
        if (data.branches) {
          setBranches(data.branches);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  interface BranchItem {
    _id: string;
    name: string;
    image: string;
  }

  const scaleValue = useSharedValue(1);

  const onPressIn = () => {
    scaleValue.value = withSpring(1.1);
  };

  const onPressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const renderBranch = ({ item }: { item: BranchItem }) => (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.branchCard, animatedStyle]}>
      <TouchableOpacity
        style={styles.branchButton}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <LinearGradient
          colors={[Colors.teal_300, Colors.teal_500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <Image source={{ uri: item.image }} style={styles.branchImage} />
          <Text style={styles.branchName}>{item.name}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Main Domains We Specialize in</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary_dark} />
      ) : (
        <FlatList
          data={branches} // List of branches
          renderItem={renderBranch}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}  // Display in a grid with the defined number of columns
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

export default Branch;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: RFValue(10),
  },
  headerText: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: Colors.primary_dark,
    marginBottom: RFValue(15),
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: RFValue(10),
  },
  branchCard: {
    width: '30%',  // Adjusting the width to fit 3 items in each row (33.33% per item)
    backgroundColor: Colors.teal_300,
    borderRadius: RFValue(10),
    padding: RFValue(10),
    marginBottom: RFValue(25),
    marginRight: RFValue(15),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    aspectRatio: 1,  // Ensuring square shape for branch cards
  },
  branchButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(10),
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(10),
  },
  branchImage: {
    // width: RFValue(60),  // Adjusting image size for 35% branch width
    // height: RFValue(60),
    // borderRadius: RFValue(10),
    // marginBottom: RFValue(5),
  },
  branchName: {
    fontSize: RFValue(9),  // Smaller font size for branch names in smaller containers
    fontWeight: '500',
    color: 'Black',
    textAlign: 'center',
  },
});
