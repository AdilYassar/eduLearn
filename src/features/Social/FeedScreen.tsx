import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserCircle } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { feedService } from '../../service/social';
import {
    setFeedPosts,
    addFeedPost,
    setLoadingFeed,
    setHasMorePosts,
    setFeedPage
} from '../../redux/reducers/socialSlice';
import { PostCard } from '../../components/social/Feed/PostCard';
import { CreatePostWidget } from '../../components/social/Feed/CreatePostWidget';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    primary: '#f382ff',
    secondary: '#ac8aff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

export const FeedScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const feedPosts = useSelector((state: any) => state.social.feedPosts);
    const isLoading = useSelector((state: any) => state.social.isLoadingFeed);
    const hasMore = useSelector((state: any) => state.social.hasMorePosts);
    const page = useSelector((state: any) => state.social.feedPage);
    const currentUser = useSelector((state: any) => state.social.currentUser);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFeed(1);
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
            <CreatePostWidget />
        </View>
    );

    const renderEmpty = () =>
        !isLoading ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet.</Text>
                <Text style={styles.emptySubText}>Be the first to share something!</Text>
            </View>
        ) : null;

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
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
                        colors={[C.primary]}
                        tintColor={C.primary}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    isLoading && !refreshing
                        ? <ActivityIndicator color={C.primary} style={{ margin: 20 }} />
                        : null
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
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
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
        color: C.onSurface,
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
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: C.primary,
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
        color: C.onSurface,
    },
    emptySubText: {
        fontSize: 14,
        color: C.onSurfaceVariant,
    },
});
