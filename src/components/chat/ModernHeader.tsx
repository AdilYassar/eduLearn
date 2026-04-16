import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
} from 'react-native';
import { Menu, ChevronDown, Trash2, Phone, ArrowLeft } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { clearAllChats, setSelectedDate, selectSelectedDate, selectChatsByDate } from '../../redux/reducers/chatSlice';
import SideDrawer from './SideDrawer';
import DatePickerDropdown from './DatePickerDropdown';
import { GlassCard, ThemedText } from '../ui/ThemedComponents';
import Animated, { FadeInDown, useAnimatedStyle, interpolate, Extrapolate, useSharedValue, Easing, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Chat {
  id: string;
  summary: string;
  messages: any[];
}

interface ModernHeaderProps {
  currentChatId: string;
  chats: Chat[];
  setCurrentChatId: (id: string) => void;
  userName?: string;
  showGradient?: boolean;
  onCallPress?: () => void;
  onBackPress?: () => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  currentChatId,
  chats,
  setCurrentChatId,
  userName = 'Learner',
  onCallPress,
  onBackPress,
}) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const selectedDate = useSelector(selectSelectedDate);
  const chatsByDate = useSelector(selectChatsByDate);
  const chevronRotation = useSharedValue(0);

  // Auto-open drawer when date is selected with multiple chats
  useEffect(() => {
    if (selectedDate && chatsByDate && chatsByDate.length > 1) {
      setVisible(true);
    }
  }, [selectedDate, chatsByDate]);

  // Update chevron rotation when calendar visibility changes
  useEffect(() => {
    chevronRotation.value = withTiming(calendarVisible ? 1 : 0, {
      duration: 300,
      easing: Easing.ease,
    });
  }, [calendarVisible]);

  // Animated style for chevron rotation
  const chevronAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      chevronRotation.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const getCurrentDate = () => {
    if (selectedDate) {
      return new Date(selectedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleClearAll = () => {
    dispatch(clearAllChats());
  };

  const handleDateSelect = (date: string) => {
    dispatch(setSelectedDate(date));
    setCalendarVisible(false);
    
    // After setting the selected date, check if there are chats for this date
    // This will be handled in the useEffect below
  };

  // Handle chat selection when date is selected
  useEffect(() => {
    if (selectedDate && chatsByDate) {
      if (chatsByDate.length === 1) {
        // If only one chat, open it directly
        setCurrentChatId(chatsByDate[0].id);
      } else if (chatsByDate.length === 0) {
        // If no chats, show a message for 3 seconds
        ToastAndroid.show('No chats found for this date', ToastAndroid.LONG);
      }
      // If multiple chats (> 1), the drawer will auto-open from the previous useEffect
    }
  }, [selectedDate, chatsByDate]);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.container}>
        <View style={styles.topRow}>
          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: theme.primary }]}
            onPress={onBackPress}
          >
            <ArrowLeft size={22} color={theme.primary} />
          </TouchableOpacity>

          {/* Date Selection with Dropdown Calendar */}
          <TouchableOpacity
            onPress={() => setCalendarVisible(!calendarVisible)}
            activeOpacity={0.7}
            style={styles.dateButtonContainer}
          >
            <GlassCard 
              style={[
                styles.dateSelection,
                selectedDate && { borderWidth: 1.5, borderColor: theme.primary }
              ]} 
              opacity={0.05}
            >
              <ThemedText style={styles.dateText} weight="bold">
                {getCurrentDate()}
              </ThemedText>
              <Animated.View style={chevronAnimatedStyle}>
                <ChevronDown size={14} color={theme.primary} />
              </Animated.View>
            </GlassCard>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]} onPress={onCallPress}>
              <Phone size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]} onPress={handleClearAll}>
              <Trash2 size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]} onPress={() => setVisible(true)}>
              <Menu size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <ThemedText style={styles.greeting} variant="secondary" weight="semibold">
            {getGreeting()},
          </ThemedText>
          <ThemedText style={styles.name} weight="bold">
            {userName}!
          </ThemedText>
        </View>
      </Animated.View>

      {/* Side Drawer - shows filtered chats if date is selected */}
      {visible && (
        <SideDrawer
          setCurrentChatId={setCurrentChatId}
          chats={selectedDate ? chatsByDate : chats}
          OnPressHide={() => setVisible(false)}
          visibile={visible}
          currentChatId={currentChatId}
        />
      )}

      {/* Dropdown Calendar - rendered outside SafeAreaView for proper positioning */}
      {calendarVisible && (
        <DatePickerDropdown
          isVisible={calendarVisible}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    paddingTop: 10,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dateButtonContainer: {
    flex: 1,
  },
  dateSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  dateText: {
    fontSize: RFValue(11),
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingWrap: {
    marginTop: 8,
  },
  greeting: {
    fontSize: RFValue(13),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: RFValue(28),
    letterSpacing: -1,
    marginTop: -2,
  },
});

export default ModernHeader;
