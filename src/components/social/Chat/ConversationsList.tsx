import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../../../service/social';
import { setConversations, setLoadingConversations } from '../../../redux/reducers/socialSlice';
import type { Conversation } from '../../../service/social/types';
import { MessageCircle, UserCircle } from 'lucide-react-native';

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
    error: '#ff6e84',
};

export const ConversationsList: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const conversations = useSelector((state: any) => state.social.conversations);
    const currentUser = useSelector((state: any) => state.social.currentUser);
    const isLoading = useSelector((state: any) => state.social.isLoadingConversations);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            dispatch(setLoadingConversations(true));
            const response = await chatService.getConversations();
            if (response.status === 'success' && response.data) {
                dispatch(setConversations(response.data));
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            dispatch(setLoadingConversations(false));
        }
    };

    const getUnreadCount = (conversation: Conversation): number => {
        if (!currentUser) return 0;
        const unreadItem = conversation.unreadCounts.find(
            (item) => item.userUUID === currentUser.quizServerUUID
        );
        return unreadItem?.count || 0;
    };

    const handleConversationPress = (conversation: Conversation) => {
        navigation.navigate('ChatScreen' as never, { conversationId: conversation._id } as never);
    };

    const renderConversation = ({ item }: { item: Conversation }) => {
        const unreadCount = getUnreadCount(item);
        const isMuted = item.mutedBy?.includes(currentUser?.quizServerUUID || '');
        const hasUnread = unreadCount > 0;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.75}
            >
                {/* Avatar with Aura Ring */}
                <View style={styles.avatarWrapper}>
                    <View style={[styles.auraRing, hasUnread && styles.auraRingActive]}>
                        <View style={styles.avatar}>
                            <UserCircle size={36} color={C.primary} strokeWidth={1.5} />
                        </View>
                    </View>
                    {item.otherUser?.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                {/* Conversation Info */}
                <View style={styles.conversationInfo}>
                    <View style={styles.headerRow}>
                        <Text
                            style={[styles.conversationName, hasUnread && styles.conversationNameUnread]}
                            numberOfLines={1}
                        >
                            {item.type === 'direct'
                                ? item.otherUser?.name || 'Unknown'
                                : item.groupName || 'Group Chat'}
                        </Text>
                        {item.lastMessage && (
                            <Text style={styles.timestamp}>
                                {formatTimestamp(item.lastMessage.timestamp)}
                            </Text>
                        )}
                    </View>

                    <View style={styles.messageRow}>
                        {item.lastMessage ? (
                            <Text
                                style={[
                                    styles.lastMessage,
                                    hasUnread && styles.lastMessageUnread,
                                ]}
                                numberOfLines={1}
                            >
                                {item.lastMessage.preview}
                            </Text>
                        ) : (
                            <Text style={styles.noMessages}>No messages yet</Text>
                        )}

                        <View style={styles.badgesRow}>
                            {isMuted && (
                                <Text style={styles.mutedText}>🔇</Text>
                            )}
                            {hasUnread && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadCount}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading && conversations.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.loadingText}>Loading conversations…</Text>
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIconWrap}>
                    <MessageCircle size={40} color={C.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubtext}>Start chatting with your friends!</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
};

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        backgroundColor: C.bg,
    },

    // ── Conversation Item ──
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: C.surface,
        borderRadius: 20,
        marginBottom: 10,
    },

    // ── Avatar ──
    avatarWrapper: {
        position: 'relative',
        marginRight: 14,
    },
    auraRing: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 2,
        borderColor: C.outlineVariant,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    auraRingActive: {
        borderColor: C.primary,
        // Note: conic-gradient not natively available; solid primary border as fallback
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: C.surface,
    },

    // ── Info ──
    conversationInfo: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 15,
        fontWeight: '600',
        color: C.onSurfaceVariant,
        flex: 1,
        marginRight: 8,
    },
    conversationNameUnread: {
        color: C.onSurface,
        fontWeight: '700',
    },
    timestamp: {
        fontSize: 11,
        color: C.outlineVariant,
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 13,
        color: C.outlineVariant,
        flex: 1,
        marginRight: 8,
    },
    lastMessageUnread: {
        color: C.onSurfaceVariant,
        fontWeight: '600',
    },
    noMessages: {
        fontSize: 13,
        color: C.outlineVariant,
        fontStyle: 'italic',
        flex: 1,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    unreadBadge: {
        backgroundColor: C.primary,
        borderRadius: 999,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#540061',
        fontSize: 10,
        fontWeight: '800',
    },
    mutedText: {
        fontSize: 13,
    },

    // ── Empty / Loading ──
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: C.bg,
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
        color: C.onSurface,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: C.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 21,
    },
    loadingText: {
        fontSize: 13,
        color: C.onSurfaceVariant,
        marginTop: 12,
    },
});
