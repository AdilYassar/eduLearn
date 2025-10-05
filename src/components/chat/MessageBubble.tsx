import { View, Text, StyleSheet, Image, ImageSourcePropType, ImageStyle, TextStyle, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import dayjs from 'dayjs';
import TickIcon from '../../assets/tick.png';
import MarkdownDisplay from 'react-native-markdown-display';
import LoadingDots from './LoadingDots';
import { PlayIcon, PauseIcon } from 'react-native-heroicons/solid';

// TTS module
let Tts: any = null;

// Load TTS module
const loadTtsModule = () => {
  try {
    const TtsModule = require('react-native-tts');
    const loadedTts = TtsModule.default || TtsModule;
    
    if (loadedTts && typeof loadedTts === 'object') {
      console.log('TTS module loaded successfully in MessageBubble');
      Tts = loadedTts;
      return loadedTts;
    } else {
      console.warn('TTS module loaded but object is invalid');
      return null;
    }
  } catch (error: any) {
    console.warn('TTS module not available:', error.message);
    return null;
  }
};

interface Message {
  role: string;
  isMessageRead?: boolean;
  isLoading?: boolean;
  imageUri?: string;
  content: string;
  time: string;
  isVoiceMessage?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMyMessage = message.role === 'user';
  const isMessageRead = message?.isMessageRead;
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);

  // Initialize TTS
  useEffect(() => {
    const initTts = async () => {
      if (!Tts) {
        const loadedTts = loadTtsModule();
        if (loadedTts) {
          Tts = loadedTts;
        }
      }

      if (Tts) {
        try {
          // Initialize TTS settings
          if (typeof Tts.setDefaultLanguage === 'function') {
            await Tts.setDefaultLanguage('en-US');
          }
          if (typeof Tts.setDefaultRate === 'function') {
            await Tts.setDefaultRate(0.5);
          }
          if (typeof Tts.setDefaultPitch === 'function') {
            await Tts.setDefaultPitch(1.0);
          }

          // Set up event listeners
          if (typeof Tts.addEventListener === 'function') {
            Tts.addEventListener('tts-start', () => setIsPlaying(true));
            Tts.addEventListener('tts-finish', () => setIsPlaying(false));
            Tts.addEventListener('tts-cancel', () => setIsPlaying(false));
          }

          setTtsReady(true);
          console.log('TTS initialized successfully in MessageBubble');
        } catch (error) {
          console.error('TTS initialization error:', error);
        }
      }
    };

    initTts();

    return () => {
      if (Tts && typeof Tts.removeAllListeners === 'function') {
        try {
          Tts.removeAllListeners('tts-start');
          Tts.removeAllListeners('tts-finish');
          Tts.removeAllListeners('tts-cancel');
        } catch (error) {
          console.error('TTS cleanup error:', error);
        }
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!Tts || !ttsReady) {
      console.log('TTS not available');
      return;
    }

    try {
      if (isPlaying) {
        // Stop current speech
        if (typeof Tts.stop === 'function') {
          await Tts.stop();
          setIsPlaying(false);
        }
      } else {
        // Clean the text
        const cleanText = message.content
          .replace(/[*_~#]/g, '') // Remove markdown characters
          .replace(/\n+/g, '. ') // Replace newlines with periods
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();

        if (cleanText.length > 0) {
          // Stop any ongoing speech first
          if (typeof Tts.stop === 'function') {
            await Tts.stop();
          }
          
          // Start speaking
          if (typeof Tts.speak === 'function') {
            await Tts.speak(cleanText);
          }
        }
      }
    } catch (error) {
      console.error('TTS playback error:', error);
      setIsPlaying(false);
    }
  };

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
      ) : message.isVoiceMessage ? (
        // Voice Message UI
        <TouchableOpacity 
          style={styles.voiceMessageContainer} 
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          <View style={[
            styles.playButton,
            { backgroundColor: isMyMessage ? '#25D366' : '#128C7E' }
          ]}>
            {isPlaying ? (
              <PauseIcon size={16} color="#fff" />
            ) : (
              <PlayIcon size={16} color="#fff" />
            )}
          </View>
          <View style={styles.voiceWaveform}>
            {[...Array(20)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  { 
                    height: Math.random() * 20 + 10,
                    backgroundColor: isMyMessage ? '#075E54' : '#128C7E'
                  }
                ]}
              />
            ))}
          </View>
          <Text style={styles.voiceDuration}>0:{message.content.length > 100 ? '15' : '08'}</Text>
        </TouchableOpacity>
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
              { tintColor: isMessageRead ? '#34B7F1' : '#BDC3C7' },
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
      fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-Regular',
  } as TextStyle,
  tickIcon: {
    width: 15,
    height: 15,
    marginLeft: 5,
  } as ImageStyle,
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 200,
  } as ViewStyle,
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  } as ViewStyle,
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 30,
    marginRight: 8,
  } as ViewStyle,
  waveformBar: {
    width: 2,
    borderRadius: 1,
    marginHorizontal: 1,
  } as ViewStyle,
  voiceDuration: {
    fontSize: RFValue(11),
    color: '#757575',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  } as TextStyle,
});

export default MessageBubble;
