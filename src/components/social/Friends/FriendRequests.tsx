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
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { friendService } from '../../../service/social';
import { setFriendRequests } from '../../../redux/reducers/socialSlice';
import type { FriendRequest } from '../../../service/social/types';
import { UserCircle, Check, X } from 'lucide-react-native';

import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../ui/ThemedComponents';

export const FriendRequests: React.FC = () => {
    const dispatch = useDispatch();
    const { theme } = useTheme();
    const friendRequests = useSelector((state: any) => state.social.friendRequests);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadFriendRequests();

        // Subscribe to real-time social events
        const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
            if (event.subType === 'FRIEND_REQUEST_RECEIVED') {
                console.log('[FriendRequests] 🔄 Refreshing requests due to new event');
                loadFriendRequests();
            }
        });

        return () => subscription.remove();
    }, []);

    const loadFriendRequests = async () => {
        try {
            setLoading(true);
            const response = await friendService.getFriendRequests();
            if (response.status === 'success' && response.data) {
                dispatch(setFriendRequests(response.data));
            }
        } catch (error) {
            console.error('Error loading friend requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requesterUUID: string) => {
        try {
            setProcessingId(requesterUUID);
            await friendService.acceptFriendRequest(requesterUUID);
            await loadFriendRequests();
        } catch (error) {
            console.error('Error accepting friend request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requesterUUID: string) => {
        try {
            setProcessingId(requesterUUID);
            await friendService.rejectFriendRequest(requesterUUID);
            await loadFriendRequests();
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const renderRequest = ({ item }: { item: FriendRequest }) => {
        const isProcessing = processingId === item.requesterUUID;

        return (
            <View style={[styles.requestItem, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                {/* Aura Ring Avatar */}
                <View style={[styles.auraRing, { borderColor: theme.primary }]}>
                    <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <UserCircle size={30} color={theme.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.requestInfo}>
                    <ThemedText weight="bold" size="medium">{item.requester?.name || 'Unknown'}</ThemedText>
                    {item.message && (
                        <Text style={[styles.requestMessage, { color: theme.text.secondary }]} numberOfLines={2}>
                            "{item.message}"
                        </Text>
                    )}
                    <ThemedText variant="secondary" size="tiny">{formatTime(item.createdAt)}</ThemedText>
                </View>

                <View style={styles.actionButtons}>
                    {/* Accept */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                        onPress={() => handleAccept(item.requesterUUID)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Check size={16} color="#fff" strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>

                    {/* Reject */}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: 'rgba(255,110,132,0.3)', borderWidth: 1 }]}
                        onPress={() => handleReject(item.requesterUUID)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        <X size={16} color={theme.isDark ? '#ff6e84' : '#ef4444'} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading && friendRequests.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (friendRequests.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={[styles.emptyIconWrap, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    <UserCircle size={36} color={theme.text.secondary} strokeWidth={1.5} />
                </View>
                <ThemedText weight="bold" size="large">No pending requests</ThemedText>
                <ThemedText variant="secondary">You're all caught up!</ThemedText>
            </View>
        );
    }

    return (
        <FlatList
            data={friendRequests}
            renderItem={renderRequest}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
        />
    );
};

const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

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

    // ── Request Item ──
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
    },

    // ── Avatar ──
    auraRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Info ──
    requestInfo: {
        flex: 1,
        gap: 2,
    },
    requestMessage: {
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 17,
        marginBottom: 2,
    },

    // ── Buttons ──
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Empty ──
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
