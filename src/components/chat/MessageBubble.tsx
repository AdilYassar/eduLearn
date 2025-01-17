import { View, Text, StyleSheet, Image, ImageSourcePropType, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import React from 'react';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import dayjs from 'dayjs';
import TickIcon from '../../assets/tick.png';
import MarkdownDisplay from 'react-native-markdown-display';
import LoadingDots from './LoadingDots';

interface Message {
  role: string;
  isMessageRead?: boolean;
  isLoading?: boolean;
  imageUri?: string;
  content: string;
  time: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMyMessage = message.role === 'user';
  const isMessageRead = message?.isMessageRead;

  return (
    <View
      style={[
        styles.messageContainer,
        {
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          backgroundColor: isMyMessage ? '#DCF8C6' : '#FFFFFF',
          borderTopLeftRadius: isMyMessage ? 15 : 0,
          borderTopRightRadius: isMyMessage ? 0 : 15,
        } as ImageStyle,
      ]}
    >
      {isMyMessage && <View style={styles.rightMessageArrow} />}
      {!isMyMessage && <View style={styles.leftMessageArrow} />}
      
      {message.isLoading ? (
        <LoadingDots />
      ) : message?.imageUri ? (
        <Image 
          source={{ uri: message?.imageUri }} 
          style={styles.image}
        />
      ) : (
        <MarkdownDisplay style={styles.markdownDisplay}>
          {message.content}
        </MarkdownDisplay>
      )}

      <View style={styles.timeAndReadContainer}>
        <Text style={styles.timeText}>{dayjs(message.time).format('HH:mm')}</Text>
        {isMyMessage && (
          <Image
            source={TickIcon as ImageSourcePropType}
            style={[
              styles.tickIcon,
              { tintColor: isMessageRead ? '#34B7F1' : '#BDC3C7' }
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 1, height: 1 },
  } as ViewStyle,
  markdownDisplay: StyleSheet.create({
    body: {
      fontSize: RFValue(14),
      color: '#303030',
      lineHeight: 18,
    } as TextStyle,
    link: {
      color: '#1A73E8',
    } as TextStyle,
    blockquote: {
      color: '#303030',
      backgroundColor: '#F0F0F0',
      borderRadius: 4,
      padding: 5,
    } as ViewStyle,
    code_inline: {
      backgroundColor: '#ECEFF1',
      color: '#303030',
      borderRadius: 5,
      paddingHorizontal: 3,
    } as ViewStyle,
  }),
  image: {
    height: RFPercentage(28),
    width: RFPercentage(35),
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 5,
  } as ImageStyle,
  leftMessageArrow: {
    position: 'absolute',
    top: 0,
    left: -6,
    width: 0,
    height: 0,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  } as ViewStyle,
  rightMessageArrow: {
    position: 'absolute',
    top: 0,
    right: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderTopColor: '#DCF8C6',
  } as ViewStyle,
  timeAndReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  } as ViewStyle,
  timeText: {
    fontSize: 10,
    color: '#757575',
  } as TextStyle,
  tickIcon: {
    width: 15,
    height: 15,
    marginLeft: 5,
  } as ImageStyle,
});

export default MessageBubble;