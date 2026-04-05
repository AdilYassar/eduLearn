import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Bell, LayoutGrid, ChevronDown, Trash2, Phone } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import aiLogo from '../../assets/images/logo.png';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { clearAllChats } from '../../redux/reducers/chatSlice';
import SideDrawer from './SideDrawer';
import { GlassCard, ThemedText } from '../ui/ThemedComponents';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  currentChatId,
  chats,
  setCurrentChatId,
  userName = 'Learner',
  onCallPress,
}) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const getCurrentDate = () => {
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

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.profileBg, { borderColor: theme.primary }]}
            onPress={() => setVisible(true)}
          >
            <Image source={aiLogo} style={styles.profile} />
          </TouchableOpacity>

          <GlassCard style={styles.dateSelection} opacity={0.05}>
            <ThemedText style={styles.dateText} weight="bold">{getCurrentDate()}</ThemedText>
            <ChevronDown size={14} color={theme.text.secondary} />
          </GlassCard>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onCallPress}>
                <Phone size={20} color={theme.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleClearAll}>
                <Trash2 size={20} color={theme.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setVisible(true)}>
                <LayoutGrid size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingWrap}>
            <ThemedText style={styles.greeting} variant="secondary" weight="semibold">
                {getGreeting()},
            </ThemedText>
            <ThemedText style={styles.name} weight="bold">
                {userName}!
            </ThemedText>
        </View>
      </Animated.View>

      {visible && (
        <SideDrawer
          setCurrentChatId={setCurrentChatId}
          chats={chats}
          OnPressHide={() => setVisible(false)}
          visibile={visible}
          currentChatId={currentChatId}
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  profile: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'contain',
  },
  dateSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 0,
    marginHorizontal: 0,
    borderRadius: 100,
  },
  dateText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingWrap: {
    marginTop: 4,
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
