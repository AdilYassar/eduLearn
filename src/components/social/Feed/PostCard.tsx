import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { feedService } from '../../../service/social';
import type { Post as PostType } from '../../../service/social/types';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    UserCircle,
    Play,
    FileText,
} from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

interface PostCardProps {
    post: PostType;
    onLike?: () => void;
    onComment?: () => void;
    onShare?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
    post,
    onLike,
    onComment,
    onShare,
}) => {
    const navigation = useNavigation();
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likeCount, setLikeCount] = useState(post.stats.likes);

    const handleLike = async () => {
        try {
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
            await feedService.toggleLike(post._id);
            onLike?.();
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            console.error('Error liking post:', error);
        }
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.authorInfo}>
                    {/* Aura Ring Avatar */}
                    <View style={styles.auraRing}>
                        <View style={styles.avatar}>
                            <UserCircle size={32} color={C.primary} strokeWidth={1.5} />
                        </View>
                    </View>
                    <View style={styles.authorMeta}>
                        <Text style={styles.authorName}>{post.author?.name || 'Unknown'}</Text>
                        <Text style={styles.timestamp}>{formatTime(post.createdAt)}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MoreVertical size={18} color={C.onSurfaceVariant} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {post.content.text && (
                    <Text style={styles.postText}>{post.content.text}</Text>
                )}

                {/* Progress Badge */}
                {post.type === 'progress' && post.content.progress && (
                    <View style={styles.progressBadge}>
                        <Text style={styles.progressType}>
                            🎉 {post.content.progress.type.replace(/_/g, ' ').toUpperCase()}
                        </Text>
                        {post.content.progress.courseName && (
                            <Text style={styles.progressCourse}>
                                {post.content.progress.courseName}
                            </Text>
                        )}
                        {post.content.progress.score !== undefined && (
                            <Text style={styles.progressScore}>
                                Score: {post.content.progress.score}%
                            </Text>
                        )}
                    </View>
                )}

                {/* Media */}
                {post.content.media && post.content.media.length > 0 && (
                    <View style={styles.mediaContainer}>
                        {post.content.media.map((media, index) => {
                            if (media.type === 'image' && media.url) {
                                return (
                                    <Image
                                        key={index}
                                        source={{ uri: media.url }}
                                        style={styles.mediaImage}
                                        resizeMode="cover"
                                    />
                                );
                            }
                            if (media.type === 'video' && media.url) {
                                return (
                                    <View key={index} style={styles.videoPlaceholder}>
                                        <Image
                                            source={{ uri: media.thumbnailUrl || media.url }}
                                            style={StyleSheet.absoluteFill}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.playOverlay}>
                                            <Play size={28} color="#fff" fill="#fff" strokeWidth={1.5} />
                                        </View>
                                    </View>
                                );
                            }
                            // fallback for other/unknown types
                            return (
                                <View key={index} style={styles.mediaFallback}>
                                    <FileText size={22} color={C.outlineVariant} strokeWidth={1.5} />
                                    <Text style={styles.mediaFallbackText}>
                                        {media.type?.toUpperCase() ?? 'FILE'}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                    <View style={styles.hashtagsContainer}>
                        {post.hashtags.map((tag, index) => (
                            <Text key={index} style={styles.hashtag}>
                                #{tag}
                            </Text>
                        ))}
                    </View>
                )}
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <Text style={styles.statsText}>
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </Text>
                <Text style={styles.statsDot}>·</Text>
                <Text style={styles.statsText}>
                    {post.stats.comments} {post.stats.comments === 1 ? 'comment' : 'comments'}
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <Heart
                        size={20}
                        color={isLiked ? C.primary : C.onSurfaceVariant}
                        fill={isLiked ? C.primary : 'none'}
                        strokeWidth={1.5}
                    />
                    <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                        Like
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                    activeOpacity={0.7}
                >
                    <MessageCircle size={20} color={C.onSurfaceVariant} strokeWidth={1.5} />
                    <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onShare}
                    activeOpacity={0.7}
                >
                    <Share2 size={20} color={C.onSurfaceVariant} strokeWidth={1.5} />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: C.surface,
        borderRadius: 24,
        marginBottom: 14,
        overflow: 'hidden',
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    auraRing: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 2,
        borderColor: C.primary,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorMeta: {
        gap: 2,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
        color: C.onSurface,
        letterSpacing: -0.2,
    },
    timestamp: {
        fontSize: 12,
        color: C.outlineVariant,
    },
    moreButton: {
        padding: 4,
    },

    // ── Content ──
    content: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        color: C.onSurface,
        marginBottom: 12,
    },

    // Progress Badge
    progressBadge: {
        backgroundColor: C.surfaceHigh,
        borderRadius: 16,
        padding: 14,
        marginTop: 4,
        borderLeftWidth: 3,
        borderLeftColor: C.primary,
    },
    progressType: {
        fontSize: 13,
        fontWeight: '800',
        color: C.primary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    progressCourse: {
        fontSize: 13,
        color: C.onSurface,
        marginBottom: 2,
    },
    progressScore: {
        fontSize: 12,
        color: C.onSurfaceVariant,
    },

    // Media
    mediaContainer: {
        marginTop: 8,
        gap: 6,
    },
    mediaImage: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        backgroundColor: C.surfaceHigh,
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: C.surfaceHigh,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playOverlay: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaFallback: {
        height: 80,
        backgroundColor: C.surfaceHigh,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    mediaFallbackText: {
        fontSize: 12,
        color: C.outlineVariant,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    // Hashtags
    hashtagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 6,
    },
    hashtag: {
        fontSize: 13,
        color: C.secondary,
        fontWeight: '600',
    },

    // ── Stats ──
    stats: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 6,
    },
    statsText: {
        fontSize: 12,
        color: C.outlineVariant,
    },
    statsDot: {
        fontSize: 12,
        color: C.outlineVariant,
    },

    // ── Actions ──
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(72,72,71,0.3)',
        paddingVertical: 6,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        color: C.onSurfaceVariant,
        fontWeight: '600',
    },
    actionTextActive: {
        color: C.primary,
    },
});
