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

import { useTheme } from '../../../context/ThemeContext';
import { GlassCard, ThemedText } from '../../../components/ui/ThemedComponents';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
    const { theme } = useTheme();
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
        <GlassCard style={styles.container} opacity={0.1}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.authorInfo}>
                    {/* Aura Ring Avatar */}
                    <View style={[styles.auraRing, { borderColor: theme.primary }]}>
                        <View style={styles.avatar}>
                            <UserCircle size={32} color={theme.primary} strokeWidth={1.5} />
                        </View>
                    </View>
                    <View style={styles.authorMeta}>
                        <ThemedText style={styles.authorName}>{post.author?.name || 'Unknown'}</ThemedText>
                        <ThemedText style={styles.timestamp}>{formatTime(post.createdAt)}</ThemedText>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MoreVertical size={18} color={theme.text.secondary} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {post.content.text && (
                    <ThemedText style={styles.postText}>{post.content.text}</ThemedText>
                )}

                {/* Progress Badge */}
                {post.type === 'progress' && post.content.progress && (
                    <View style={styles.progressBadge}>
                        <ThemedText style={[styles.progressType, { color: theme.primary }]}>
                            🎉 {post.content.progress.type.replace(/_/g, ' ').toUpperCase()}
                        </ThemedText>
                        {post.content.progress.courseName && (
                            <ThemedText style={styles.progressCourse}>
                                {post.content.progress.courseName}
                            </ThemedText>
                        )}
                        {post.content.progress.score !== undefined && (
                            <ThemedText style={styles.progressScore}>
                                Score: {post.content.progress.score}%
                            </ThemedText>
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
                                    <FileText size={22} color={theme.text.secondary} strokeWidth={1.5} />
                                    <ThemedText style={styles.mediaFallbackText}>
                                        {media.type?.toUpperCase() ?? 'FILE'}
                                    </ThemedText>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                    <View style={styles.hashtagsContainer}>
                        {post.hashtags.map((tag, index) => (
                            <ThemedText key={index} style={[styles.hashtag, { color: theme.primary }]}>
                                #{tag}
                            </ThemedText>
                        ))}
                    </View>
                )}
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <ThemedText style={styles.statsText}>
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </ThemedText>
                <ThemedText style={styles.statsDot}>·</ThemedText>
                <ThemedText style={styles.statsText}>
                    {post.stats.comments} {post.stats.comments === 1 ? 'comment' : 'comments'}
                </ThemedText>
            </View>

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <Heart
                        size={20}
                        color={isLiked ? theme.primary : theme.text.secondary}
                        fill={isLiked ? theme.primary : 'none'}
                        strokeWidth={1.5}
                    />
                    <ThemedText style={[styles.actionText, isLiked && { color: theme.primary }]}>
                        Like
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onComment}
                    activeOpacity={0.7}
                >
                    <MessageCircle size={20} color={theme.text.secondary} strokeWidth={1.5} />
                    <ThemedText style={styles.actionText}>Comment</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onShare}
                    activeOpacity={0.7}
                >
                    <Share2 size={20} color={theme.text.secondary} strokeWidth={1.5} />
                    <ThemedText style={styles.actionText}>Share</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Inline Comments */}
            {post.comments && post.comments.length > 0 && (
                <View style={[styles.commentsSection, { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    {post.comments.slice(0, 2).map((comment, index) => (
                        <View key={comment._id || index} style={styles.commentItem}>
                            <ThemedText style={styles.commentAuthor}>{comment.author?.name || 'User'}</ThemedText>
                            <ThemedText style={styles.commentText}>{comment.content.text}</ThemedText>
                        </View>
                    ))}
                    {post.stats.comments > 2 && (
                        <TouchableOpacity onPress={onComment} style={styles.viewMoreComments}>
                            <ThemedText style={[styles.viewMoreText, { color: theme.primary }]}>
                                View all {post.stats.comments} comments
                            </ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
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
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorMeta: {
        gap: 2,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.6,
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
        marginBottom: 12,
    },

    // Progress Badge
    progressBadge: {
        borderRadius: 16,
        padding: 14,
        marginTop: 4,
        borderLeftWidth: 3,
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    progressType: {
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    progressCourse: {
        fontSize: 13,
        marginBottom: 2,
    },
    progressScore: {
        fontSize: 12,
        opacity: 0.7,
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
    },
    videoPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 16,
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
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    mediaFallbackText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        opacity: 0.6,
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
        opacity: 0.6,
    },
    statsDot: {
        fontSize: 12,
        opacity: 0.6,
    },

    // ── Actions ──
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
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
        fontWeight: '600',
    },
    actionTextActive: {
    },
    // ── Comments ──
    commentsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 4,
        gap: 6,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '700',
    },
    commentText: {
        fontSize: 13,
        flex: 1,
        opacity: 0.8,
    },
    viewMoreComments: {
        marginTop: 6,
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
