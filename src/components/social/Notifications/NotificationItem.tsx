import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    UserPlus,
    MessageSquare,
    Heart,
    AtSign,
    Bell
} from 'lucide-react-native';
import type { Notification } from '../../../service/social/types';
import { notificationService } from '../../../service/social';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../../../redux/reducers/socialSlice';

import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../ui/ThemedComponents';

interface NotificationItemProps {
    notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { theme } = useTheme();

    const ICON_CONFIG: Record<
        string,
        { icon: React.ElementType; color: string; bg: string }
    > = {
        friend_request: { icon: UserPlus, color: theme.primary, bg: 'rgba(243,130,255,0.1)' },
        friend_accepted: { icon: UserPlus, color: theme.primary, bg: 'rgba(243,130,255,0.1)' },
        post_comment: { icon: MessageSquare, color: theme.secondary, bg: 'rgba(172,138,255,0.1)' },
        message_request: { icon: MessageSquare, color: theme.secondary, bg: 'rgba(172,138,255,0.1)' },
        post_like: { icon: Heart, color: theme.isDark ? '#ff86c3' : '#ed4b9e', bg: 'rgba(255,134,195,0.1)' },
        comment_like: { icon: Heart, color: theme.isDark ? '#ff86c3' : '#ed4b9e', bg: 'rgba(255,134,195,0.1)' },
        mention: { icon: AtSign, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    };

    const handlePress = async () => {
        if (!notification.isRead) {
            dispatch(markNotificationAsRead(notification._id));
            notificationService.markAsRead(notification._id).catch(console.error);
        }

        switch (notification.type) {
            case 'message_request':
            case 'friend_request':
                break;
            case 'post_like':
            case 'post_comment':
            case 'comment_like':
                if (notification.content.postId) {
                    // navigation.navigate('PostDetails', { postId: notification.content.postId });
                }
                break;
        }
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    const iconConf = ICON_CONFIG[notification.type] ?? {
        icon: Bell,
        color: theme.text.secondary,
        bg: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    };
    const IconComponent = iconConf.icon;

    return (
        <TouchableOpacity
            style={[
                styles.container, 
                { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                !notification.isRead && { backgroundColor: theme.isDark ? 'rgba(243,130,255,0.05)' : 'rgba(243,130,255,0.03)' }
            ]}
            onPress={handlePress}
            activeOpacity={0.75}
        >
            {/* Icon Badge */}
            <View style={[styles.iconContainer, { backgroundColor: iconConf.bg }]}>
                <IconComponent size={18} color={iconConf.color} strokeWidth={1.5} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={[styles.message, { color: theme.text.primary }]} numberOfLines={2}>
                    <Text style={[styles.actorName, { color: theme.primary }]}>
                        {notification.actor?.name || 'Someone'}
                    </Text>
                    {'  '}
                    <Text style={{ color: theme.text.secondary }}>{notification.content.message}</Text>
                </Text>
                <ThemedText variant="secondary" size="tiny">{formatTime(notification.createdAt)}</ThemedText>
            </View>

            {/* Unread Dot */}
            {!notification.isRead && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 20,
        marginBottom: 8,
    },

    // ── Icon ──
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        flexShrink: 0,
    },

    // ── Content ──
    content: {
        flex: 1,
        gap: 4,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    actorName: {
        fontWeight: '700',
    },

    // ── Unread Dot ──
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 10,
        flexShrink: 0,
    },
});
