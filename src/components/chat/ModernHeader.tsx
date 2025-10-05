/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import React, { useState } from 'react';
import { BellIcon, Squares2X2Icon, ChevronDownIcon } from 'react-native-heroicons/solid';
import { RFValue } from 'react-native-responsive-fontsize';
import aiLogo from '../../assets/images/logo.png';
import CustomText from '../ui/CustomText';
import { useDispatch } from 'react-redux';
import { clearAllChats, clearChat } from '../../redux/reducers/chatSlice';
import SideDrawer from './SideDrawer';
import LinearGradient from 'react-native-linear-gradient';

type Message = {
  id: string;
  content: string;
  isMessageRead?: boolean;
};

interface Chat {
  id: string;
  summary: string;
  messages: Message[];
}

interface ModernHeaderProps {
  currentChatId: string;
  chats: Chat[];
  setCurrentChatId: (id: string) => void;
  userName?: string;
  showGradient?: boolean;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  currentChatId,
  chats,
  setCurrentChatId,
  userName = 'Eva Smith',
  showGradient = true,
}) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  const containerContent = (
    <SafeAreaView>
      {/* Top Row: Profile, Date, Notification, Menu */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => setVisible(true)}
        >
          <Image source={aiLogo as ImageSourcePropType} style={styles.profileImage} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dateSelector}>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
          <ChevronDownIcon size={RFValue(14)} color="#fff" />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <BellIcon size={RFValue(20)} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setVisible(true)}
          >
            <Squares2X2Icon size={RFValue(20)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          {getGreeting()},{'\n'}
          <Text style={styles.nameText}>{userName}!</Text>
        </Text>
      </View>
    </SafeAreaView>
  );

  return (
    <>
      {showGradient ? (
        <LinearGradient
          colors={['#2563EB', '#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.container}
        >
          {containerContent}
        </LinearGradient>
      ) : (
        <View style={styles.containerTransparent}>
          {containerContent}
        </View>
      )}

      {/* Side Drawer */}
      {visible && (
        <SideDrawer
          setCurrentChatId={(id) => setCurrentChatId(id)}
          chats={chats}
          OnPressHide={() => setVisible(false)}
          visibile={visible}
          currentChatId={currentChatId}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  containerTransparent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dateText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingSection: {
    marginTop: 10,
  },
  greetingText: {
    fontSize: RFValue(26),
    fontWeight: '700',
    color: '#fff',
    lineHeight: RFValue(34),
    fontFamily: 'Inter-Bold',
  },
  nameText: {
    fontSize: RFValue(26),
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
});

export default ModernHeader;
