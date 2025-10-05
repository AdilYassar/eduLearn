import { View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModernHeader from '../../components/chat/ModernHeader';
import { useDispatch, useSelector } from 'react-redux';
import { changeCurrentChatId, selectChats, selectCurrentChatId } from '../../redux/reducers/chatSlice';
import SendButton from '../../components/chat/SendButton';
import Chat from '../../components/chat/Chat';
import { useUser } from '@service/hooks/useUser';
import LinearGradient from 'react-native-linear-gradient';

const MetaAi = () => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);
  const currentChatId = useSelector(selectCurrentChatId);
  const [isTyping, setIsTyping] = useState(false);
  const [heightOfMessageBox, setHeightOfMessageBox] = useState(0);
  const [userName, setUserName] = useState<string>('Student');
  const [presetMessage, setPresetMessage] = useState<string>('');
  const { getUserProfile } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('💬 MetaAi: Fetching user data...');
        const accessToken = await AsyncStorage.getItem('accessToken');
        console.log('💬 MetaAi: Access token exists:', !!accessToken);

        if (accessToken) {
          // Try to get user data from API
          const userProfile = await getUserProfile(accessToken);
          console.log('💬 MetaAi: User profile from API:', userProfile);
          if (userProfile && userProfile.student) {
            const name = userProfile.student.name || userProfile.student.email;
            console.log('💬 MetaAi: Setting userName to:', name);
            setUserName(name);
            return;
          }
        }

        // Fallback to stored user data
        const storedUserData = await AsyncStorage.getItem('userData');
        console.log('💬 MetaAi: Stored userData exists:', !!storedUserData);
        if (!storedUserData) {
          console.log('💬 MetaAi: No stored user data found');
          return;
        }

        const parsedUserData = JSON.parse(storedUserData);
        console.log('💬 MetaAi: Parsed user data:', parsedUserData);
        console.log('💬 MetaAi: Setting userName to:', parsedUserData.name);
        setUserName(parsedUserData.name);
      } catch (fetchError) {
        console.error('💬 MetaAi: Error fetching user data:', fetchError);
      }
    };

    fetchUserData();
  }, [getUserProfile]);

  const setCurrentChatId = (id: string) => {
    dispatch(changeCurrentChatId({ chatId: id }));
  };

  const handleCardPress = (text: string) => {
    console.log('💬 Card pressed with text:', text);
    setPresetMessage(text);
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#3B82F6', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ModernHeader
      chats={chats}
      currentChatId={currentChatId}
      setCurrentChatId={(id) => setCurrentChatId(id)}
      userName={userName}
      showGradient={false}
       />

      {/* Main chat and input area container */}
      <View style={styles.chatContainer}>
        {/* Chat component with heightOfMessageBox to avoid overlap */}
        <Chat
          isTyping={isTyping}
          messages={chats?.find((chat: { id: string }) => chat.id === currentChatId)?.messages || []}
          heightOfMessageBox={heightOfMessageBox}
          userName={userName}
          onCardPress={handleCardPress}
        />

        {/* Spacer to avoid overlap with the SendButton */}
        <View style={styles.spacer} />

        {/* SendButton at the bottom */}
        <SendButton
          isTyping={isTyping}
          setHeightOfMessageBox={setHeightOfMessageBox}
          setIsTyping={setIsTyping}
          setCurrentChatId={(id: string) => setCurrentChatId(id)}
          length={chats?.find((chat: { id: string }) => chat.id === currentChatId)?.messages?.length || 0}
          messages={chats?.find((chat: { id: string }) => chat.id === currentChatId)?.messages || []}
          presetMessage={presetMessage}
          onMessageSent={() => setPresetMessage('')}
        />
      </View>
    </LinearGradient>
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
