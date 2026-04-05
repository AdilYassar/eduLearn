import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message as MessageType } from '../../../service/social/types';
import { UserCircle } from 'lucide-react-native';

// ── Ethereal Editorial Design Tokens ──────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    surfaceHigh: '#201f1f',
    surfaceBright: '#2c2c2c',
    primary: '#f382ff',
    primaryContainer: '#ed69ff',
    secondary: '#ac8aff',
    tertiary: '#ff86c3',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

interface MessageBubbleProps {
    message: MessageType;
    isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
}) => {
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
                <View style={styles.avatar}>
                    <UserCircle size={26} color={C.primary} strokeWidth={1.5} />
                </View>
            )}

            <View
                style={[
                    styles.bubble,
                    isOwnMessage ? styles.ownBubble : styles.otherBubble,
                ]}
            >
                {!isOwnMessage && message.sender && (
                    <Text style={styles.senderName}>{message.sender.name}</Text>
                )}

                {message.content.text && (
                    <Text
                        style={[
                            styles.messageText,
                            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                        ]}
                    >
                        {message.content.text}
                    </Text>
                )}

                {message.content.media && message.content.media.length > 0 && (
                    <View style={styles.mediaContainer}>
                        {message.content.media.map((media, index) => (
                            <View key={index} style={styles.mediaPlaceholder}>
                                <Text style={styles.mediaText}>
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
                            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
                        ]}
                    >
                        {formatTime(message.createdAt)}
                    </Text>
                    {message.isEdited && (
                        <Text
                            style={[
                                styles.editedLabel,
                                isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
                            ]}
                        >
                            {' '}• edited
                        </Text>
                    )}
                </View>

                {message.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                        {message.reactions.map((reaction, index) => (
                            <View key={index} style={styles.reactionBubble}>
                                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {isOwnMessage && <View style={styles.spacer} />}
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
        // Gradient approximation using solid primary (LinearGradient not imported by default)
        backgroundColor: '#d946ef',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#201f1f',
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

    spacer: {
        width: 30,
    },
});
