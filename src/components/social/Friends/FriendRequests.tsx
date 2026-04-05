import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { friendService } from '../../../service/social';
import { setFriendRequests } from '../../../redux/reducers/socialSlice';
import type { FriendRequest } from '../../../service/social/types';
import { UserCircle, Check, X } from 'lucide-react-native';

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

export const FriendRequests: React.FC = () => {
    const dispatch = useDispatch();
    const friendRequests = useSelector((state: any) => state.social.friendRequests);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadFriendRequests();
        }, [])
    );

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
            <View style={styles.requestItem}>
                {/* Aura Ring Avatar */}
                <View style={styles.auraRing}>
                    <View style={styles.avatar}>
                        <UserCircle size={30} color={C.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{item.requester?.name || 'Unknown'}</Text>
                    {item.message && (
                        <Text style={styles.requestMessage} numberOfLines={2}>
                            "{item.message}"
                        </Text>
                    )}
                    <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
                </View>

                <View style={styles.actionButtons}>
                    {/* Accept */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => handleAccept(item.requesterUUID)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#540061" />
                        ) : (
                            <Check size={16} color="#540061" strokeWidth={2.5} />
                        )}
                    </TouchableOpacity>

                    {/* Reject */}
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleReject(item.requesterUUID)}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        <X size={16} color={C.error} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading && friendRequests.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={C.primary} />
            </View>
        );
    }

    if (friendRequests.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.emptyIconWrap}>
                    <UserCircle size={36} color={C.outlineVariant} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyText}>No pending requests</Text>
                <Text style={styles.emptySubtext}>You're all caught up!</Text>
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
        backgroundColor: C.bg,
    },

    // ── Request Item ──
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: C.surface,
        borderRadius: 20,
        marginBottom: 10,
    },

    // ── Avatar ──
    auraRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: C.primary,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Info ──
    requestInfo: {
        flex: 1,
        gap: 2,
    },
    requestName: {
        fontSize: 15,
        fontWeight: '700',
        color: C.onSurface,
        marginBottom: 2,
    },
    requestMessage: {
        fontSize: 12,
        color: C.onSurfaceVariant,
        fontStyle: 'italic',
        lineHeight: 17,
        marginBottom: 2,
    },
    requestTime: {
        fontSize: 11,
        color: C.outlineVariant,
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
    acceptBtn: {
        backgroundColor: C.primary,
    },
    rejectBtn: {
        backgroundColor: C.surfaceHigh,
        borderWidth: 1,
        borderColor: 'rgba(255,110,132,0.3)',
    },

    // ── Empty ──
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
    },
});
