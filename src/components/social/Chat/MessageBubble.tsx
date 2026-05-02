import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message as MessageType } from '../../../service/social/types';
import { UserCircle, Play, FileText, Image as ImageIcon } from 'lucide-react-native';
import { Image, TouchableOpacity, Linking } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';

interface MessageBubbleProps {
    message: MessageType;
    isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
}) => {
    const { theme } = useTheme();
    
    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <View
            style={[
                styles.container,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
            ]}
        >
            {/* Other user avatar */}
            {!isOwnMessage && (
                <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <UserCircle size={26} color={theme.primary} strokeWidth={1.5} />
                </View>
            )}

            <View
                style={[
                    styles.bubble,
                    isOwnMessage 
                        ? [styles.ownBubble, { backgroundColor: theme.primary }] 
                        : [styles.otherBubble, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }],
                ]}
            >
                {!isOwnMessage && message.sender && (
                    <Text style={[styles.senderName, { color: theme.primary }]}>{message.sender.name}</Text>
                )}

                {message.content.text && (
                    <Text
                        style={[
                            styles.messageText,
                            { color: isOwnMessage ? '#fff' : theme.text.primary }
                        ]}
                    >
                        {message.content.text}
                    </Text>
                )}

                {/* Media Content */}
                {message.type === 'image' && message.content.url && (
                    <Image 
                        source={{ uri: message.content.url }} 
                        style={styles.chatImage} 
                        resizeMode="cover"
                    />
                )}

                {message.type === 'video' && message.content.url && (
                    <View style={styles.videoPlaceholder}>
                        <Play size={24} color="#fff" fill="#fff" />
                    </View>
                )}

                {message.type === 'document' && message.content.url && (
                    <TouchableOpacity 
                        style={[styles.fileBox, { backgroundColor: isOwnMessage ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)' }]}
                        onPress={() => Linking.openURL(message.content.url!)}
                    >
                        <FileText size={20} color={isOwnMessage ? '#fff' : theme.primary} />
                        <View style={styles.fileInfo}>
                            <Text style={[styles.fileName, { color: isOwnMessage ? '#fff' : theme.text.primary }]} numberOfLines={1}>
                                {message.content.fileName || 'Document'}
                            </Text>
                            <Text style={[styles.fileSize, { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : theme.text.secondary }]}>
                                {message.content.mimeType?.split('/')[1].toUpperCase() || 'FILE'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Legacy Media Array Support */}
                {message.type === 'text' && message.content.media && message.content.media.length > 0 && (
                    <View style={styles.mediaContainer}>
                        {message.content.media.map((media, index) => (
                            <View key={index} style={[styles.mediaPlaceholder, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Text style={[styles.mediaText, { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : theme.text.secondary }]}>
                                    {media.type.toUpperCase()} — {media.fileName}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.timestamp,
                            { color: isOwnMessage ? 'rgba(255,255,255,0.6)' : theme.text.secondary }
                        ]}
                    >
                        {formatTime(message.createdAt)}
                    </Text>
                    {message.isEdited && (
                        <Text
                            style={[
                                styles.editedLabel,
                                { color: isOwnMessage ? 'rgba(255,255,255,0.6)' : theme.text.secondary }
                            ]}
                        >
                            {' '}• edited
                        </Text>
                    )}
                </View>

                {message.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                        {message.reactions.map((reaction, index) => (
                            <View key={index} style={[styles.reactionBubble, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 3,
        paddingHorizontal: 14,
        alignItems: 'flex-end',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },

    // ── Avatar ──
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#201f1f',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },

    // ── Bubble ──
    bubble: {
        maxWidth: '72%',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    ownBubble: {
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        borderBottomLeftRadius: 4,
    },

    // ── Text ──
    senderName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#f382ff',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    ownMessageText: {
        color: '#ffffff',
    },
    otherMessageText: {
        color: '#ffffff',
    },

    // ── Footer ──
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 10,
    },
    ownTimestamp: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    otherTimestamp: {
        color: '#484847',
    },
    editedLabel: {
        fontSize: 10,
        fontStyle: 'italic',
    },

    // ── Reactions ──
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 4,
    },
    reactionBubble: {
        backgroundColor: 'rgba(243, 130, 255, 0.15)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    reactionEmoji: {
        fontSize: 13,
    },

    // ── Media ──
    mediaContainer: {
        marginTop: 8,
        gap: 4,
    },
    mediaPlaceholder: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        padding: 10,
        borderRadius: 12,
    },
    mediaText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },

    // ── Media Rendering ──
    chatImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 4,
    },
    videoPlaceholder: {
        width: 200,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    fileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 4,
        gap: 10,
        minWidth: 180,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 13,
        fontWeight: '600',
    },
    fileSize: {
        fontSize: 11,
    },

    spacer: {
        width: 30,
    },
});
