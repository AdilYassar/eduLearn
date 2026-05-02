import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    DeviceEventEmitter,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../../../service/social';
import { setConversations, setLoadingConversations } from '../../../redux/reducers/socialSlice';
import { useFocusEffect } from '@react-navigation/native';
import type { Conversation } from '../../../service/social/types';
import { MessageCircle, UserCircle } from 'lucide-react-native';

import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../ui/ThemedComponents';

export const ConversationsList: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const conversations = useSelector((state: any) => state.social.conversations);
    const currentUser = useSelector((state: any) => state.social.currentUser);
    const isLoading = useSelector((state: any) => state.social.isLoadingConversations);

    useFocusEffect(
        React.useCallback(() => {
            loadConversations();
        }, [])
    );

    useEffect(() => {
        // Subscribe to real-time social events
        const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
            if (
                event.subType === 'MESSAGE_RECEIVED' || 
                event.subType === 'FRIEND_ACCEPTED' ||
                event.subType === 'GROUP_CREATED' ||
                event.subType === 'GROUP_MEMBER_ADDED'
            ) {
                console.log(`[ConversationsList] 🔄 Refreshing list due to: ${event.subType}`);
                loadConversations();
            }
        });

        return () => subscription.remove();
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
                style={[styles.conversationItem, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                onPress={() => handleConversationPress(item)}
                activeOpacity={0.75}
            >
                {/* Avatar with Aura Ring */}
                <View style={styles.avatarWrapper}>
                    <View style={[styles.auraRing, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }, hasUnread && { borderColor: theme.primary }]}>
                        <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            <UserCircle size={36} color={theme.primary} strokeWidth={1.5} />
                        </View>
                    </View>
                    {item.otherUser?.isOnline && <View style={[styles.onlineIndicator, { borderColor: theme.isDark ? '#1a1919' : '#fff' }]} />}
                </View>

                {/* Conversation Info */}
                <View style={styles.conversationInfo}>
                    <View style={styles.headerRow}>
                        <Text
                            style={[
                                styles.conversationName, 
                                { color: theme.text.primary },
                                hasUnread && { fontWeight: '700' }
                            ]}
                            numberOfLines={1}
                        >
                            {item.type === 'direct'
                                ? item.otherUser?.name || 'Unknown'
                                : item.groupName || 'Group Chat'}
                        </Text>
                        {item.lastMessage && (
                            <ThemedText variant="secondary" size="tiny">
                                {formatTimestamp(item.lastMessage.timestamp)}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.messageRow}>
                        {item.lastMessage ? (
                            <Text
                                style={[
                                    styles.lastMessage,
                                    { color: theme.text.secondary },
                                    hasUnread && { fontWeight: '600', color: theme.text.primary },
                                ]}
                                numberOfLines={1}
                            >
                                {item.lastMessage.preview}
                            </Text>
                        ) : (
                            <Text style={[styles.noMessages, { color: theme.text.secondary }]}>No messages yet</Text>
                        )}

                        <View style={styles.badgesRow}>
                            {isMuted && (
                                <Text style={styles.mutedText}>🔇</Text>
                            )}
                            {hasUnread && (
                                <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
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
                <ActivityIndicator size="large" color={theme.primary} />
                <ThemedText variant="secondary" style={{ marginTop: 12 }}>Loading conversations…</ThemedText>
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={[styles.emptyIconWrap, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    <MessageCircle size={40} color={theme.primary} strokeWidth={1.5} />
                </View>
                <ThemedText weight="bold" size="large">No conversations yet</ThemedText>
                <ThemedText variant="secondary" style={{ textAlign: 'center' }}>Start chatting with your friends!</ThemedText>
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
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={8}
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
    },

    // ── Conversation Item ──
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
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
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
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
        flex: 1,
        marginRight: 8,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 13,
        flex: 1,
        marginRight: 8,
    },
    noMessages: {
        fontSize: 13,
        fontStyle: 'italic',
        flex: 1,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    unreadBadge: {
        borderRadius: 999,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: '#fff',
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
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
});
