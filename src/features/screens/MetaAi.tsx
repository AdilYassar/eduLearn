import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import WABG from '../../assets/images/download.jpeg';
import CustomHeader from '../../components/chat/CustomHeader';
import { useDispatch, useSelector } from 'react-redux';
import { changeCurrentChatId, selectChats, selectCurrentChatId } from '../../redux/reducers/chatSlice';
import SendButton from '../../components/chat/SendButton';
import Chat from '../../components/chat/Chat';

const MetaAi = () => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);
  const currentChatId = useSelector(selectCurrentChatId);
  const [isTyping, setIsTyping] = useState(false);
  const [heightOfMessageBox, setHeightOffMessageBox] = useState(0);

  const setCurrentChatId = (id) => {
    dispatch(changeCurrentChatId({ chatId: id }));
  };

  return (
    <ImageBackground source={WABG} style={styles.container} resizeMode="cover">
      <CustomHeader   
      chats={chats}
      currentChatId={currentChatId}
      setCurrentChatId={id=>setCurrentChatId(id)}

       />

      {/* Main chat and input area container */}
      <View style={styles.chatContainer}>
        {/* Chat component with heightOfMessageBox to avoid overlap */}
        <Chat
          isTyping={isTyping}
          messages={chats?.find(chat => chat.id === currentChatId)?.messages || []}
          heightOfMessageBox={heightOfMessageBox} // Pass height of message box here
        />

        {/* Spacer to avoid overlap with the SendButton */}
        <View style={styles.spacer} />

        {/* SendButton at the bottom */}
        <SendButton
          isTyping={isTyping}
          setHeightOffMessageBox={setHeightOffMessageBox}
          heightOfMessageBox={heightOfMessageBox}
          setIsTyping={setIsTyping}
          currentChatId={currentChatId}
          setCurrentChatId={(id) => setCurrentChatId(id)}
          length={chats?.find(chat => chat.id === currentChatId)?.messages?.length || 0}
          messages={chats?.find(chat => chat.id === currentChatId)?.messages || []}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'space-between', // Ensures chat and send button don't overlap
  },
  spacer: {
    height: 80, // Adjust this value to control the space between the chat and SendButton
  },
});

export default MetaAi;
