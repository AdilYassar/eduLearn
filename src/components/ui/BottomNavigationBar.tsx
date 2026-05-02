import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { House, BookOpen, Book, Calendar, Video } from 'lucide-react-native';
import { Colors } from '../../utils/Constants';
import { navigate } from '../../utils/Navigation';
import { useTheme } from '../../context/ThemeContext';

interface BottomNavigationBarProps {
  backgroundColor?: string;
  currentScreen?: string;
}

const BottomNavigationBar = ({ backgroundColor = '#2A2A2A', currentScreen = '' }: BottomNavigationBarProps) => {
  const { theme } = useTheme();
  const iconColor = theme.text.primary;

  return (
    <View style={styles.bottomNavContainer}>
      {/* Home Icon - Separate Container */}
      <TouchableOpacity
        style={[styles.homeContainer, { backgroundColor }]}
        onPress={() => navigate('DashboardScreen')}
      >
        <View style={styles.homeIconWrapper}>
          <House
            size={24}
            color={iconColor}
            fill={currentScreen === 'DashboardScreen' ? theme.text.secondary : "transparent"}
          />
        </View>
      </TouchableOpacity>

      {/* Other Icons - Grouped Container */}
      <View style={[styles.otherIconsContainer, { backgroundColor }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('CourseScreen')}
        >
          <BookOpen 
            size={24} 
            color={iconColor}
            fill={currentScreen === 'CourseScreen' ? theme.text.secondary : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('BookScreen')}
        >
          <Book 
            size={24} 
            color={iconColor}
            fill={currentScreen === 'BookScreen' ? theme.text.secondary : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('TimelineScreen')}
        >
          <Calendar 
            size={24} 
            color={iconColor}
            fill={currentScreen === 'TimelineScreen' ? theme.text.secondary : "transparent"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigate('HomeScreen')}
        >
          <View style={styles.plusIconWrapper}>
            <Video 
              size={24} 
              color={iconColor}
              fill={currentScreen === 'HomeScreen' ? theme.text.secondary : "transparent"}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
    gap: 15,
  },
  homeContainer: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  homeIconWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otherIconsContainer: {
    flex: 1,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  plusIconWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNavigationBar;
