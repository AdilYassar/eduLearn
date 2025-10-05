import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { UserCog } from 'lucide-react-native';
import { navigate } from '@utils/Navigation';
import { Colors } from '@utils/Constants';

const { width } = Dimensions.get('window');

interface Mood {
  id: string;
  image: any;
  label: string;
  bgColor: string[];
  componentBgColor: string[];
}

interface MoodSelectorProps {
  userName?: string;
  onMoodChange: (bgColor: string[], componentBgColor: string[]) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ userName, onMoodChange }) => {
  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [scaleAnim] = useState(new Animated.Value(1));

  console.log('🎭 MoodSelector: Received userName prop:', userName);

  const moods: Mood[] = [
    {
      id: 'sad',
      image: require('@assets/emojis_images/left_most.png'),
      label: 'Sad',
      bgColor: ['#E8E3F3', '#F5F3FA'], // Light lavender
      componentBgColor: ['#E8E3F3', '#F5F3FA'],
    },
    {
      id: 'neutral',
      image: require('@assets/emojis_images/next-to-the-left-most.png'),
      label: 'Neutral',
      bgColor: ['#F0F0F0', '#FAFAFA'], // Light gray
      componentBgColor: ['#F0F0F0', '#FAFAFA'],
    },
    {
      id: 'happy',
      image: require('@assets/emojis_images/center-most.png'),
      label: 'Happy',
      bgColor: ['#E8F5E9', '#F1F8F2'], // Light mint green
      componentBgColor: ['#E8F5E9', '#F1F8F2'],
    },
    {
      id: 'angry',
      image: require('@assets/emojis_images/right-to-the-center-most.png'),
      label: 'Angry',
      bgColor: ['#FFEBEE', '#FFF5F5'], // Light pink
      componentBgColor: ['#FFEBEE', '#FFF5F5'],
    },
    {
      id: 'crying',
      image: require('@assets/emojis_images/right-most.png'),
      label: 'Crying',
      bgColor: ['#E3F2FD', '#F0F7FF'], // Light blue
      componentBgColor: ['#E3F2FD', '#F0F7FF'],
    },
  ];

  // Set default happy mood on mount
  useEffect(() => {
    const happyMood = moods.find(mood => mood.id === 'happy');
    if (happyMood) {
      onMoodChange(happyMood.bgColor, happyMood.componentBgColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleMoodPress = (mood: Mood) => {
    setSelectedMood(mood.id);
    onMoodChange(mood.bgColor, mood.componentBgColor);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

const getCircularPosition = (index: number, totalItems: number) => {
    // Distribute emojis evenly across the width
    const padding = 30;
    const availableWidth = width - (padding * 2);
    const spacing = availableWidth / (totalItems - 1);
    const x = padding + (spacing * index) - 27.5; // Center the emoji (55/2)
    
    // Create gentle arc - center emoji slightly higher
    const middle = (totalItems - 1) / 2;
    const distanceFromMiddle = Math.abs(index - middle);
    const maxHeight = 50; // Reduced height difference for flatter arc
    const y = distanceFromMiddle * (maxHeight / middle);
    
    // Subtle rotation based on position
    const rotation = (index - middle) * 8; // 8 degrees per position from center
    
    return { x, y, rotation };
  };

  const renderMoodItem = (item: Mood, index: number) => {
    const isSelected = selectedMood === item.id;
    const { x, y, rotation } = getCircularPosition(index, moods.length);

    return (
      <View
        key={item.id}
        style={[
          styles.moodItemContainer,
          {
            position: 'absolute',
            left: x,
            top: y,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMoodPress(item)}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.moodButton,
              {
                transform: [
                  { rotate: `${rotation}deg` },
                  ...(isSelected ? [{ scale: scaleAnim }] : [{ scale: 1 }]),
                ],
              },
            ]}
          >
            <Image source={item.image} style={styles.emojiImage} resizeMode="cover" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Hello {userName || 'Emaan'} 👋</Text>
          <Text style={styles.subtitle}>Tell us about your mood?</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigate('Profile')}
          style={styles.profileButton}
        >
          <UserCog size={28} color='#000' strokeWidth={2} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.circularContainer}>
        {moods.map((mood, index) => renderMoodItem(mood, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  profileButton: {
    marginLeft: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  circularContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  moodItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
  },
  moodButton: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
      
  },
  emojiImage: {
    width: '100%',
    marginBottom: 10,
    height: '100%',
  },
});

export default MoodSelector;
