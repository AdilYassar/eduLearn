import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ViewStyle, 
    TextStyle, 
    Dimensions 
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import dayjs from 'dayjs';
import MarkdownDisplay from 'react-native-markdown-display';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Play, Pause, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useVoiceMessage } from '../../context/VoiceMessageContext';
import { GlassCard } from '../../components/ui/ThemedComponents';

const { width } = Dimensions.get('window');

interface Message {
  id?: string;
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
  const isUser = message.role === 'user';
  const theme = useTheme();
  const { playingMessageId, setPlayingMessageId, playMessage, stopMessage, isPlaying } = useVoiceMessage();
  const isPlaying_Message = playingMessageId === message.id && isPlaying;

  const handlePlayPause = async () => {
    if (playingMessageId === message.id && isPlaying) {
      // If currently playing this message, stop it
      await stopMessage();
    } else {
      // Play this message
      await playMessage(message.id!, message.content);
    }
  };

  return (
    <Animated.View 
        entering={isUser ? FadeInRight : FadeInLeft}
        style={[
            styles.container, 
            { alignItems: isUser ? 'flex-end' : 'flex-start' }
        ]}
    >
        <GlassCard 
            style={[
                styles.bubble, 
                { borderTopRightRadius: isUser ? 4 : 20, borderTopLeftRadius: isUser ? 20 : 4 }
            ]}
            opacity={isUser ? 0.15 : 0.08}
            glow={isUser}
            glowColor={isUser ? theme.theme.primary : 'transparent'}
        >
            {message.isLoading ? (
                <View style={styles.loadingWrap}>
                    <Text style={[styles.loadingText, { color: theme.theme.text.secondary }]}>Neural Processing...</Text>
                </View>
            ) : message.imageUri ? (
                <Image source={{ uri: message.imageUri }} style={styles.image} />
            ) : message.isVoiceMessage ? (
                <TouchableOpacity 
                    style={styles.voiceRow} 
                    onPress={handlePlayPause}
                >
                    <View style={[styles.playBtn, { backgroundColor: theme.theme.primary }]}>
                        {isPlaying_Message ? <Pause size={16} color="#FFF" /> : <Play size={16} color="#FFF" />}
                    </View>
                    <View style={styles.waveWrap}>
                        {[...Array(12)].map((_, i) => (
                            <View 
                                key={i} 
                                style={[
                                    styles.waveBar, 
                                    { 
                                        height: 10 + Math.random() * 20, 
                                        backgroundColor: isUser ? theme.theme.primary : theme.theme.text.secondary,
                                        opacity: isPlaying_Message ? 1 : 0.5,
                                    }
                                ]} 
                            />
                        ))}
                    </View>
                </TouchableOpacity>
            ) : (
                <MarkdownDisplay style={{
                    body: {
                        fontSize: RFValue(13),
                        color: theme.theme.text.primary,
                        lineHeight: 20,
                        fontFamily: 'Inter-Medium',
                    },
                    code_inline: {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: theme.theme.primary,
                        borderRadius: 4,
                        paddingHorizontal: 4,
                    }
                }}>
                    {message.content}
                </MarkdownDisplay>
            )}

            <View style={styles.footer}>
                <ThemedText style={styles.time}>{dayjs(message.time).format('HH:mm')}</ThemedText>
                {isUser && <Check size={12} color={message.isMessageRead ? theme.theme.primary : theme.theme.text.secondary} />}
            </View>
        </GlassCard>
    </Animated.View>
  );
};

const ThemedText = ({ children, style }: any) => {
    const { theme } = useTheme();
    return <Text style={[style, { color: theme.text.primary }]}>{children}</Text>;
};

const FadeInLeft = FadeInDown.delay(100).duration(400);
const FadeInRight = FadeInDown.delay(100).duration(400);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginVertical: 6,
    },
    bubble: {
        maxWidth: width * 0.75,
        padding: 12,
        borderRadius: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 6,
        opacity: 0.6,
    },
    time: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    loadingWrap: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    loadingText: {
        fontSize: 12,
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: 12,
        marginBottom: 8,
    },
    voiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
        minWidth: 140,
    },
    playBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        flex: 1,
    },
    waveBar: {
        width: 3,
        borderRadius: 1.5,
    },
});

export default MessageBubble;
