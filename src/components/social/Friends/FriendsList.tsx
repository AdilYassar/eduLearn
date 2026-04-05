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

interface FriendsListProps {
    onFriendPress?: (friend: Friend) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ onFriendPress }) => {
    const dispatch = useDispatch();
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
            style={styles.friendItem}
            onPress={() => onFriendPress?.(item)}
            activeOpacity={0.75}
        >
            {/* Aura Ring Avatar */}
            <View style={styles.avatarWrapper}>
                <View style={[styles.auraRing, item.isOnline && styles.auraRingOnline]}>
                    <View style={styles.avatar}>
                        <UserCircle size={32} color={C.primary} strokeWidth={1.5} />
                    </View>
                </View>
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={[styles.friendStatus, item.isOnline && styles.friendStatusOnline]}>
                    {item.isOnline ? '● Online' : `Last seen ${formatLastSeen(item.lastSeen)}`}
                </Text>
            </View>

            <TouchableOpacity style={styles.chatButton} activeOpacity={0.7}>
                <MessageCircle size={18} color={C.secondary} strokeWidth={1.5} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading && friends.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={C.primary} />
            </View>
        );
    }

    if (friends.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIconWrap}>
                    <UserCircle size={36} color={C.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>Start by sending friend requests!</Text>
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
                    tintColor={C.primary}
                    colors={[C.primary]}
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
        backgroundColor: C.bg,
    },

    // ── Friend Item ──
    friendItem: {
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
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: C.outlineVariant,
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
        backgroundColor: C.surfaceHigh,
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
        borderColor: C.surface,
    },

    // ── Info ──
    friendInfo: {
        flex: 1,
        gap: 4,
    },
    friendName: {
        fontSize: 15,
        fontWeight: '700',
        color: C.onSurface,
        letterSpacing: -0.2,
    },
    friendStatus: {
        fontSize: 12,
        color: C.outlineVariant,
    },
    friendStatusOnline: {
        color: '#22c55e',
    },

    // ── Chat Button ──
    chatButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Empty / Center ──
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
});
