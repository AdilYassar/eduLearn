import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { friendService } from '../../../service/social';
import { setFriends, setLoadingConversations } from '../../../redux/reducers/socialSlice';
import type { Friend } from '../../../service/social/types';
import { UserCircle, MessageCircle } from 'lucide-react-native';

import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../ui/ThemedComponents';

interface FriendsListProps {
    onFriendPress?: (friend: Friend) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onFriendPress }) => {
    const dispatch = useDispatch();
    const { theme } = useTheme();
    const friends = useSelector((state: any) => state.social.friends);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadFriends();
        }, [])
    );

    const loadFriends = async () => {
        try {
            setLoading(true);
            const response = await friendService.getFriends();
            if (response.status === 'success' && response.data) {
                dispatch(setFriends(response.data));
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadFriends();
        setRefreshing(false);
    };

    const renderFriend = ({ item }: { item: Friend }) => (
        <TouchableOpacity
            style={[styles.friendItem, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
            onPress={() => onFriendPress?.(item)}
            activeOpacity={0.75}
        >
            {/* Aura Ring Avatar */}
            <View style={styles.avatarWrapper}>
                <View style={[styles.auraRing, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }, item.isOnline && styles.auraRingOnline]}>
                    <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <UserCircle size={32} color={theme.primary} strokeWidth={1.5} />
                    </View>
                </View>
                {item.isOnline && <View style={[styles.onlineIndicator, { borderColor: theme.isDark ? '#1a1919' : '#fff' }]} />}
            </View>

            <View style={styles.friendInfo}>
                <ThemedText weight="bold" size="medium">{item.name}</ThemedText>
                <Text style={[styles.friendStatus, item.isOnline ? styles.friendStatusOnline : { color: theme.text.secondary }]}>
                    {item.isOnline ? '● Online' : `Last seen ${formatLastSeen(item.lastSeen)}`}
                </Text>
            </View>

            <TouchableOpacity style={[styles.chatButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]} activeOpacity={0.7}>
                <MessageCircle size={18} color={theme.secondary} strokeWidth={1.5} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading && friends.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (friends.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={[styles.emptyIconWrap, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    <UserCircle size={36} color={theme.primary} strokeWidth={1.5} />
                </View>
                <ThemedText weight="bold" size="large">No friends yet</ThemedText>
                <ThemedText variant="secondary" style={{ textAlign: 'center' }}>Start by sending friend requests!</ThemedText>
            </View>
        );
    }

    return (
        <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.quizServerUUID}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={theme.primary}
                    colors={[theme.primary]}
                />
            }
        />
    );
};

const formatLastSeen = (lastSeen: string): string => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },

    // ── Friend Item ──
    friendItem: {
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
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    auraRingOnline: {
        borderColor: '#22c55e',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
    },

    // ── Info ──
    friendInfo: {
        flex: 1,
        gap: 4,
    },
    friendStatus: {
        fontSize: 12,
    },
    friendStatusOnline: {
        color: '#22c55e',
    },

    // ── Chat Button ──
    chatButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Empty / Center ──
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
