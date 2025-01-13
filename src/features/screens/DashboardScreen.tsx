import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '@utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@utils/Constants';
import Category from '../../components/dashboard/Category';
import Branch from '@components/dashboard/Branch';

const DashboardScreen = () => {
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) return;

      const parsedUserData = JSON.parse(storedUserData);
      setUserName(parsedUserData.name);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Welcome, {userName || 'Loading...'}
        </Text>
        <TouchableOpacity onPress={() => navigate('Profile')}>
          <Icon name="account-circle" size={30} color='black' />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Branch />
        <Category />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigate('CourseScreen')}>
          <Icon name="book" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigate('BookScreen')}>
          <Icon name="menu-book" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigate('Profile')}>
          <Icon name="person" size={25} color={Colors.primary_dark} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.teal_400,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  borderRadius: 30,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d0d4dc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: Colors.primary_dark,
    marginTop: 5,
  },
});

export default DashboardScreen;
