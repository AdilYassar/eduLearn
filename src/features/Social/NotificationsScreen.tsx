import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { notificationService } from '../../service/social';
import {
    setNotifications,
    markAllNotificationsAsRead
} from '../../redux/reducers/socialSlice';
import { NotificationItem } from '../../components/social/Notifications/NotificationItem';
import { CheckCheck, Bell } from 'lucide-react-native';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    primary: '#f382ff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

export const NotificationsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: any) => state.social.notifications);
    const loading = useSelector((state: any) => state.social.isLoadingNotifications);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await notificationService.getNotifications();
            if (response.status === 'success' && response.data) {
                dispatch(setNotifications(response.data));
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handleMarkAllRead = async () => {
        try {
            dispatch(markAllNotificationsAsRead());
            await notificationService.markAsRead();
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            {/* Header */}
            <View style={[styles.header, { justifyContent: 'flex-end' }]}>
                <TouchableOpacity
                    onPress={handleMarkAllRead}
                    style={styles.markReadButton}
                    activeOpacity={0.7}
                >
                    <CheckCheck size={16} color={C.primary} strokeWidth={1.5} />
                    <Text style={styles.markReadText}>All read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) => <NotificationItem notification={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={C.primary}
                        colors={[C.primary]}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <Bell size={32} color={C.outlineVariant} strokeWidth={1.5} />
                            </View>
                            <Text style={styles.emptyText}>No notifications</Text>
                            <Text style={styles.emptySubtext}>You're all caught up!</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: C.bg,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: C.onSurface,
        letterSpacing: -0.5,
    },
    markReadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.surface,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
    },
    markReadText: {
        color: C.primary,
        fontWeight: '700',
        fontSize: 12,
    },

    // ── List ──
    list: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 24,
        flexGrow: 1,
    },

    // ── Empty ──
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        gap: 10,
    },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
        color: C.onSurface,
    },
    emptySubtext: {
        fontSize: 14,
        color: C.onSurfaceVariant,
    },
});
