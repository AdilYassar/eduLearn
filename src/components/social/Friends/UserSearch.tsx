import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { userService, friendService } from '../../../service/social';
import type { SocialUser } from '../../../service/social/types';
import { UserCircle, UserPlus, Search, Compass } from 'lucide-react-native';

import { useTheme } from '../../../context/ThemeContext';
import { ThemedText } from '../../ui/ThemedComponents';

export const UserSearch: React.FC = () => {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<SocialUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [requesting, setRequesting] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    // Pagination state (only used for discover mode)
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isSearchMode = query.trim().length > 0;

    // ── Load discover users on mount ──────────────────────────────────────────
    const loadDiscover = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await userService.discoverUsers(pageNum, 20);
            if (response.status === 'success' && response.data) {
                setUsers(prev => append ? [...prev, ...response.data!] : response.data!);
                const pagination = (response as any).pagination;
                setHasMore(pagination?.hasMore ?? response.data.length === 20);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error loading discover users:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadDiscover(1);
    }, [loadDiscover]);

    // ── Search ────────────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!query.trim()) {
            loadDiscover(1);
            return;
        }
        try {
            setLoading(true);
            const response = await userService.searchUsers(query);
            if (response.status === 'success' && response.data) {
                setUsers(response.data);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (!text.trim()) {
            loadDiscover(1);
        }
    };

    const handleLoadMore = () => {
        if (!isSearchMode && hasMore && !loadingMore && !loading) {
            loadDiscover(page + 1, true);
        }
    };

    const handleSendRequest = async (userUUID: string) => {
        try {
            setRequesting(userUUID);
            await friendService.sendFriendRequest(userUUID);
            setSentRequests(prev => new Set([...prev, userUUID]));
        } catch (error) {
            console.error('Error sending request:', error);
        } finally {
            setRequesting(null);
        }
    };

    const renderItem = ({ item }: { item: SocialUser }) => {
        const isSent = sentRequests.has(item.quizServerUUID);
        const isSending = requesting === item.quizServerUUID;

        return (
            <View style={[styles.userItem, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                {/* Aura Ring Avatar */}
                <View style={[styles.auraRing, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <UserCircle size={30} color={theme.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.userInfo}>
                    <ThemedText weight="bold" size="medium">{item.name}</ThemedText>
                    <ThemedText variant="secondary" size="small" numberOfLines={1}>
                        {item.bio || 'EduLearn member'}
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }, isSent && styles.addButtonSent]}
                    onPress={() => handleSendRequest(item.quizServerUUID)}
                    disabled={isSending || isSent}
                    activeOpacity={0.8}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : isSent ? (
                        <Text style={[styles.sentText, { color: theme.primary }]}>✓</Text>
                    ) : (
                        <UserPlus size={16} color="#fff" strokeWidth={2} />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={theme.primary} size="small" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Compass size={36} color={theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} strokeWidth={1.5} />
                <ThemedText weight="bold">{isSearchMode ? 'No users found' : 'No new users to discover'}</ThemedText>
                <ThemedText variant="secondary" size="small">{isSearchMode ? 'Try a different name' : 'Check back later'}</ThemedText>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Search Bar ── */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputWrapper, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Search size={16} color={theme.text.secondary} strokeWidth={1.5} style={{ marginRight: 10 }} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text.primary }]}
                        placeholder="Search by name…"
                        placeholderTextColor={theme.text.secondary}
                        value={query}
                        onChangeText={handleQueryChange}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        selectionColor={theme.primary}
                    />
                </View>
                <TouchableOpacity
                    style={[
                        styles.searchButton, 
                        { backgroundColor: theme.primary },
                        !query.trim() && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                    ]}
                    onPress={handleSearch}
                    activeOpacity={0.85}
                >
                    {loading && isSearchMode ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Search size={16} color={query.trim() ? '#fff' : theme.text.secondary} strokeWidth={2} />
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Section label ── */}
            <View style={styles.sectionHeader}>
                <Compass size={14} color={theme.primary} strokeWidth={1.5} />
                <ThemedText variant="secondary" weight="bold" size="small">
                    {isSearchMode ? `Results for "${query}"` : 'People you may know'}
                </ThemedText>
            </View>

            {/* ── List ── */}
            {loading && users.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.primary} />
                    <ThemedText variant="secondary" size="small">Finding people…</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.quizServerUUID}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // ── Search Bar ──
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    searchButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Section Header ──
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },

    // ── List ──
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 24,
    },

    // ── User Item ──
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
    },
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
    userInfo: {
        flex: 1,
        gap: 3,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonSent: {
        backgroundColor: 'rgba(243, 130, 255, 0.1)',
    },
    sentText: {
        fontSize: 16,
        fontWeight: '700',
    },

    // ── Footer loader ──
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },

    // ── Empty ──
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 48,
        gap: 8,
    },
});
