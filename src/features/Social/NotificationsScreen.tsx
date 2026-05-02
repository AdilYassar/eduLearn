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

import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText } from '../../components/ui/ThemedComponents';

export const NotificationsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const { theme } = useTheme();
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
        <ThemedContainer style={styles.container} useGradient={false} edges={['left', 'right']}>
            {/* Header */}
            <View style={[styles.header, { justifyContent: 'flex-end' }]}>
                <TouchableOpacity
                    onPress={handleMarkAllRead}
                    style={[styles.markReadButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    activeOpacity={0.7}
                >
                    <CheckCheck size={16} color={theme.primary} strokeWidth={1.5} />
                    <Text style={[styles.markReadText, { color: theme.primary }]}>All read</Text>
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
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconWrap, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                <Bell size={32} color={theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeWidth={1.5} />
                            </View>
                            <ThemedText weight="bold" size="large">No notifications</ThemedText>
                            <ThemedText variant="secondary">You're all caught up!</ThemedText>
                        </View>
                    ) : null
                }
            />
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    markReadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
    },
    markReadText: {
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
});
