/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Dimensions, StyleSheet } from 'react-native';
import React from 'react';
import useKeyboardOffsetHeight from '../../helpers/useKeyboardOffsetHeight';
import getMessageHeightOffset from '../../helpers/useKeyboardOffsetHeight';
import { FlashList } from '@shopify/flash-list';
import MessageBubble from './MessageBubble';
import DashboardEmptyState from './DashboardEmptyState';

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
  userName?: string;
  onCardPress?: (text: string) => void;
}

const Chat: React.FC<ChatProps> = ({ isTyping, messages, heightOfMessageBox, userName, onCardPress }) => {
  const keyboardOffsetHeight = useKeyboardOffsetHeight();

  const renderMessageBubble = ({ item, index }: { item: Message; index: number }) => {
    return <MessageBubble message={item} />;
  };

  // Calculate chat list height with padding for better layout
  const calculatedHeight = windowHeight * 0.76 * keyboardOffsetHeight - 0.95 - getMessageHeightOffset();
  const listHeight = calculatedHeight > 0 ? calculatedHeight : windowHeight * 0.6;

  return (
    <View style={styles.container}>
      {messages?.length === 0 ? (
        <DashboardEmptyState isTyping={isTyping} userName={userName} onCardPress={onCardPress} />
      ) : (
        <FlashList
          indicatorStyle="black"
          data={[...messages].reverse()}
          inverted
          estimatedItemSize={40}
          renderItem={renderMessageBubble}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 20,
  },
});

export default Chat;
