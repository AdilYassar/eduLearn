/* eslint-disable no-undef */
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
import uuid from 'react-native-uuid';
import { Colors } from '@utils/Constants';

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

  const renderChats = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      onPress={() => {
        setCurrentChatId(item.id);
        OnPressHide();
      }}
      style={[
        styles.chatButton,
        {
          backgroundColor: currentChatId === item.id ? '#fff' : '#43F7B2FF',
        },
      ]}
    >
      <CustomText numberOfLines={1} style={{ width: '70%' }} size={RFValue(11)} >
        {item.summary}
      </CustomText>
      <TouchableOpacity
        onPress={() => deleteAChat(item.id)}
        style={styles.trashIcon}
      >
        <TrashIcon color="#ef4444" size={RFValue(12)} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
        <View style={styles.modalContainer}>
          <View style={{ height: '100%', width: '100%' }}>
            <View style={styles.header}>
              <View style={styles.flexRow}>
                <Image style={{ height: 30, width: 30 }} source={require('../../assets/ai2.png')} />
                <CustomText size={RFValue(16)} >
                  All Chats
                </CustomText>
              </View>
              <TouchableOpacity onPress={OnPressHide}>
                <XCircleIcon color="#ccc" size={RFValue(16)} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.newChat} onPress={addNewChat}>
              <CustomText size={RFValue(10)} >Add New Chat</CustomText>
            </TouchableOpacity>
            <CustomText style={{ margin: 10, fontSize: RFValue(12) }} >
              Recent Chats
            </CustomText>
            <View style={{ height: '60%' }}>
              <FlatList
                data={[...chats].reverse()}
                renderItem={renderChats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                 paddingBottom: 20,
                 paddingTop: 10,
                }}
              />
            </View>
            <TouchableOpacity style={styles.clearAllChat} onPress={clearAllChatsHandler}>
              <CustomText style={{color:'#fff'}} size={RFValue(10)}>
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
    backgroundColor: Colors.teal_400,
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: Colors.teal_200,
  },
  newChat: {
    backgroundColor: Colors.teal_200,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    width: '60%',
    margin: 10,
    alignSelf: 'center',
  },
  clearAllChat: {
    backgroundColor: '#ef5432',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  trashIcon: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  chatButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 0,
  },
});

export default SideDrawer;
