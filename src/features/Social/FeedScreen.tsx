import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserCircle } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { feedService } from '../../service/social';
import {
    setFeedPosts,
    setLoadingFeed,
    setHasMorePosts,
    setFeedPage,
    addFeedPost,
} from '../../redux/reducers/socialSlice';
import { ThemedContainer, ThemedText, ThemedHeader } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import { PostCard } from '../../components/social/Feed/PostCard';
import { CreatePostWidget } from '../../components/social/Feed/CreatePostWidget';

export const FeedScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const feedPosts = useSelector((state: any) => state.social.feedPosts);
    const isLoading = useSelector((state: any) => state.social.isLoadingFeed);
    const hasMore = useSelector((state: any) => state.social.hasMorePosts);
    const page = useSelector((state: any) => state.social.feedPage);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFeed(1);

        // Subscribe to real-time social events
        const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
            if (event.subType === 'POST_CREATED') {
                try {
                    const payload = JSON.parse(event.payload);
                    dispatch(addFeedPost(payload));
                } catch (e) {
                    console.error('[FeedScreen] Error parsing post payload:', e);
                }
            }
        });

        return () => subscription.remove();
    }, []);

    const loadFeed = async (pageNum: number) => {
        if (pageNum === 1) dispatch(setLoadingFeed(true));

        try {
            const response = await feedService.getFeed(pageNum);

            if (response.status === 'success' && response.data) {
                if (pageNum === 1) {
                    dispatch(setFeedPosts(response.data));
                }
                if (response.data.length < 20) {
                    dispatch(setHasMorePosts(false));
                }
            }
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            dispatch(setLoadingFeed(false));
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        dispatch(setFeedPage(1));
        dispatch(setHasMorePosts(true));
        loadFeed(1);
    };

    const handleLoadMore = () => {
        // pagination placeholder
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <ThemedHeader
                title="Neural Feed"
                rightAction={
                    <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
                        <View style={[styles.profileAvatarFallback, { borderColor: theme.primary, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            <UserCircle size={20} color={theme.primary} strokeWidth={1.5} />
                        </View>
                    </TouchableOpacity>
                }
                style={{ paddingHorizontal: 0 }}
            />
            <CreatePostWidget />
        </View>
    );

    const renderEmpty = () =>
        !isLoading ? (
            <View style={styles.emptyContainer}>
                <ThemedText weight="bold" size="large">No posts yet.</ThemedText>
                <ThemedText variant="secondary">Be the first to share something!</ThemedText>
            </View>
        ) : null;

    return (
        <ThemedContainer style={styles.container} edges={['left', 'right']}>
            <FlatList
                data={feedPosts}
                renderItem={({ item }) => <PostCard post={item} />}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isLoading && !refreshing
                        ? <ActivityIndicator color={theme.primary} style={{ margin: 20 }} />
                        : null
                }
            />
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
    },

    // ── Header ──
    headerContainer: {
        paddingTop: 16,
        marginBottom: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        overflow: 'hidden',
    },
    profileAvatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    profileAvatarFallback: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        gap: 8,
    },
    emptyText: {
        fontSize: 17,
        fontWeight: '700',
    },
    emptySubText: {
        fontSize: 14,
        opacity: 0.6,
    },
});
