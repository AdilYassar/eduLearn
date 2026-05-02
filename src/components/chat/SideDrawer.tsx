import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import CustomText from '../ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import { XCircleIcon } from 'react-native-heroicons/outline';
import { TrashIcon } from 'react-native-heroicons/solid';
import { useDispatch } from 'react-redux';
import { createNewChat, clearAllChats, deleteChat } from '../../redux/reducers/chatSlice';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/ThemedComponents';
import uuid from 'react-native-uuid';
import Animated, { FadeInLeft } from 'react-native-reanimated';

type Message = {
  id: string;
  content: string;
  isMessageRead?: boolean;
};

type Chat = {
  id: string;
  summary: string;
  messages: Message[];
};

interface SideDrawerProps {
  setCurrentChatId: (id: string) => void;
  chats: Chat[];
  OnPressHide: () => void;
  visibile: boolean;
  currentChatId: string;
}

const SideDrawer: React.FC<SideDrawerProps> = ({
  setCurrentChatId,
  chats,
  OnPressHide,
  visibile,
  currentChatId,
}) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const clearAllChatsHandler = () => {
    dispatch(clearAllChats());
  };

  const deleteAChat = (id: string) => {
    dispatch(deleteChat({ chatId: id }));
  };

  const addNewChat = () => {
    dispatch(
      createNewChat({
        chatId: uuid.v4() as string,
        messages: [],
        summary: 'New chat',
      })
    );
  };

  const renderChats = ({ item }: { item: Chat }) => {
    const isSelected = currentChatId === item.id;
    return (
      <Animated.View entering={FadeInLeft.delay(100)}>
        <TouchableOpacity
          onPress={() => {
            setCurrentChatId(item.id);
            OnPressHide();
          }}
          style={[
            styles.chatButton,
            {
              backgroundColor: isSelected ? theme.primary : theme.secondary,
              borderColor: isSelected ? theme.primary : 'transparent',
            },
          ]}
        >
          <CustomText 
            numberOfLines={1} 
            style={[styles.chatButtonText, { color: isSelected ? '#fff' : theme.text.primary }]} 
            size={RFValue(11)} 
          >
            {item.summary}
          </CustomText>
          <TouchableOpacity
            onPress={() => deleteAChat(item.id)}
            style={styles.trashIcon}
          >
            <TrashIcon color="#ef4444" size={RFValue(12)} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Modal
      backdropColor="black"
      backdropOpacity={0.5}
      onBackdropPress={OnPressHide}
      onBackButtonPress={OnPressHide}
      animationIn="slideInLeft"
      animationOut="slideOutLeft"
      style={styles.bottomModalView}
      isVisible={visibile}
    >
      <SafeAreaView>
        <View 
          style={[styles.modalContainer, { backgroundColor: theme.secondary }]}
        >
          <View style={styles.fullHeight}>
            <View style={[styles.header, { borderBottomColor: theme.text.secondary + '40' }]}>
              <View style={styles.flexRow}>
                <Image style={styles.headerIcon} source={require('../../assets/icons/appIcon.png')} />
                <CustomText size={RFValue(16)} style={{ color: theme.text.primary }}>
                  All Chats
                </CustomText>
              </View>
              <TouchableOpacity onPress={OnPressHide}>
                <XCircleIcon color={theme.text.secondary} size={RFValue(16)} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.newChat, { backgroundColor: theme.primary }]} 
              onPress={addNewChat}
            >
              <CustomText size={RFValue(10)} style={styles.newChatText}>
                + Add New Chat
              </CustomText>
            </TouchableOpacity>
            <CustomText 
              style={[styles.recentLabel, { color: theme.text.primary }]} 
              size={RFValue(12)} 
            >
              Recent Chats
            </CustomText>
            <View style={styles.chatsList}>
              <FlatList
                data={[...chats].reverse()}
                renderItem={renderChats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
              />
            </View>
            <TouchableOpacity 
              style={styles.clearAllChat}
              onPress={clearAllChatsHandler}
            >
              <CustomText style={styles.clearAllChatText} size={RFValue(10)}>
                Clear All Chats
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomModalView: {
    justifyContent: 'flex-end',
    width: '70%',
    margin: 10,
  },
  modalContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  fullHeight: {
    height: '100%',
    width: '100%',
  },
  flexRow: {
    gap: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcon: {
    height: 30,
    width: 30,
  },
  newChat: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    width: '70%',
    margin: 16,
    alignSelf: 'center',
  },
  newChatText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recentLabel: {
    marginLeft: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  chatsList: {
    height: '60%',
  },
  listContent: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    paddingBottom: 20,
    paddingTop: 10,
  },
  clearAllChat: {
    backgroundColor: '#ef5432',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  clearAllChatText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trashIcon: {
    padding: 8,
    borderRadius: 8,
  },
  chatButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  chatButtonText: {
    width: '70%',
  },
});

export default SideDrawer;
 