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

interface NotificationItemProps {
    notification: Notification;
}

// Icon config per notification type
const ICON_CONFIG: Record<
    string,
    { icon: React.ElementType; color: string; bg: string }
> = {
    friend_request: { icon: UserPlus, color: C.primary, bg: 'rgba(243,130,255,0.12)' },
    friend_accepted: { icon: UserPlus, color: C.primary, bg: 'rgba(243,130,255,0.12)' },
    post_comment: { icon: MessageSquare, color: C.secondary, bg: 'rgba(172,138,255,0.12)' },
    message_request: { icon: MessageSquare, color: C.secondary, bg: 'rgba(172,138,255,0.12)' },
    post_like: { icon: Heart, color: C.tertiary, bg: 'rgba(255,134,195,0.12)' },
    comment_like: { icon: Heart, color: C.tertiary, bg: 'rgba(255,134,195,0.12)' },
    mention: { icon: AtSign, color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

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
        color: C.onSurfaceVariant,
        bg: C.surfaceHigh,
    };
    const IconComponent = iconConf.icon;

    return (
        <TouchableOpacity
            style={[styles.container, !notification.isRead && styles.unread]}
            onPress={handlePress}
            activeOpacity={0.75}
        >
            {/* Icon Badge */}
            <View style={[styles.iconContainer, { backgroundColor: iconConf.bg }]}>
                <IconComponent size={18} color={iconConf.color} strokeWidth={1.5} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.message} numberOfLines={2}>
                    <Text style={styles.actorName}>
                        {notification.actor?.name || 'Someone'}
                    </Text>
                    {'  '}
                    <Text style={styles.messageBody}>{notification.content.message}</Text>
                </Text>
                <Text style={styles.time}>{formatTime(notification.createdAt)}</Text>
            </View>

            {/* Unread Dot */}
            {!notification.isRead && <View style={styles.dot} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: C.surface,
        borderRadius: 20,
        marginBottom: 8,
    },
    unread: {
        backgroundColor: '#1d1a1d',
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
        color: C.onSurface,
    },
    actorName: {
        fontWeight: '700',
        color: C.primary,
    },
    messageBody: {
        color: C.onSurfaceVariant,
        fontWeight: '400',
    },
    time: {
        fontSize: 11,
        color: C.outlineVariant,
        fontWeight: '500',
    },

    // ── Unread Dot ──
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: C.primary,
        marginLeft: 10,
        flexShrink: 0,
    },
});
