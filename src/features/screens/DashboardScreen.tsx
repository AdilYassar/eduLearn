import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons'; // Use MaterialIcons for vector icons
import { navigate } from '@utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>(''); // Local state to hold user name

  // Retrieve user data from AsyncStorage when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Retrieve user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem('userData');
      console.log('Stored user data:', storedUserData);

      if (!storedUserData) {
        console.error('User data not found');
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      setUserName(parsedUserData.name); // Set the user name from stored data
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {userName || 'Loading...'}</Text> {/* Display 'Loading...' if the name is not yet fetched */}
        <TouchableOpacity onPress={() => navigate('Profile')}>
          <Icon name="account-circle" size={30} color="#004d40" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        {/* Add your dashboard content here */}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('CourseScreen')}
        >
          <Icon name="book" size={25} color="#004d40" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('QuizScreen')}
        >
          <Icon name="menu-book" size={25} color="#004d40" />
          <Text style={styles.navText}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('Profile')}
        >
          <Icon name="person" size={25} color="#004d40" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d4dc',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d40',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d0d4dc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#004d40',
    marginTop: 5,
  },
});

export default DashboardScreen;
