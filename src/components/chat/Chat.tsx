/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Dimensions, StyleProp, ViewStyle, ListRenderItem } from 'react-native';
import React from 'react';
import useKeyboardOffsetHeight from '../../helpers/useKeyboardOffsetHeight';
import getMessageHeightOffset from '../../helpers/useKeyboardOffsetHeight';
import { FlashList } from '@shopify/flash-list';
import MessageBubble from './MessageBubble';
import EmptyComponent from './EmptyComponent';

const windowHeight = Dimensions.get('window').height;

interface Message {
  role: string;
  isMessageRead?: boolean;
  isLoading?: boolean;
  imageUri?: string;
  content: string;
  time: string;
}

interface ChatProps {
  isTyping: boolean;
  messages: Message[];
  heightOfMessageBox: number;
}

const Chat: React.FC<ChatProps> = ({ isTyping, messages, heightOfMessageBox }) => {
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  const renderMessageBubble: ListRenderItem<Message> = ({ item, index }) => {
    return <MessageBubble message={item} />;
  };

  // Calculate chat list height with padding for better layout
  const calculatedHeight = windowHeight * 0.76 * keyboardOffsetHeight - 0.95 - getMessageHeightOffset(heightOfMessageBox || 0, windowHeight);
  const listHeight = calculatedHeight > 0 ? calculatedHeight : windowHeight * 0.6;

  return (
    <View style={{ height: listHeight, flex: 1 }}>
      {messages?.length === 0 ? (
        <EmptyComponent isTyping={isTyping} /> // Now isTyping is defined
      ) : (
        <FlashList 
          indicatorStyle="black" 
          data={[...messages].reverse()}
          inverted
          estimatedItemSize={40}
          renderItem={renderMessageBubble}
          contentContainerStyle={{ paddingTop: 20 }} // Add top padding to start messages lower
        />
      )}
    </View>
  );
};

export default Chat;