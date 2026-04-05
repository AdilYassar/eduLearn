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

// ── Ethereal Editorial Design Tokens ──────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    surfaceHigh: '#201f1f',
    surfaceBright: '#2c2c2c',
    primary: '#f382ff',
    secondary: '#ac8aff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

export const UserSearch: React.FC = () => {
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
                // Check pagination from response
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
            // Reset to discover mode
            loadDiscover(1);
            return;
        }
        try {
            setLoading(true);
            const response = await userService.searchUsers(query);
            if (response.status === 'success' && response.data) {
                setUsers(response.data);
                setHasMore(false); // no pagination for search
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset to discover when query is cleared
    const handleQueryChange = (text: string) => {
        setQuery(text);
        if (!text.trim()) {
            loadDiscover(1);
        }
    };

    // ── Load more (infinite scroll for discover) ──────────────────────────────
    const handleLoadMore = () => {
        if (!isSearchMode && hasMore && !loadingMore && !loading) {
            loadDiscover(page + 1, true);
        }
    };

    // ── Send friend request ───────────────────────────────────────────────────
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

    // ── Render each user row ──────────────────────────────────────────────────
    const renderItem = ({ item }: { item: SocialUser }) => {
        const isSent = sentRequests.has(item.quizServerUUID);
        const isSending = requesting === item.quizServerUUID;

        return (
            <View style={styles.userItem}>
                {/* Aura Ring Avatar */}
                <View style={styles.auraRing}>
                    <View style={styles.avatar}>
                        <UserCircle size={30} color={C.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userBio} numberOfLines={1}>
                        {item.bio || 'EduLearn member'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.addButton, isSent && styles.addButtonSent]}
                    onPress={() => handleSendRequest(item.quizServerUUID)}
                    disabled={isSending || isSent}
                    activeOpacity={0.8}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#540061" />
                    ) : isSent ? (
                        <Text style={styles.sentText}>✓</Text>
                    ) : (
                        <UserPlus size={16} color="#540061" strokeWidth={2} />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // ── Footer for infinite scroll ────────────────────────────────────────────
    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator color={C.primary} size="small" />
            </View>
        );
    };

    // ── Empty state ───────────────────────────────────────────────────────────
    const renderEmpty = () => {
        if (loading) return null;
        if (isSearchMode) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No users found</Text>
                    <Text style={styles.emptySubtext}>Try a different name</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Compass size={36} color={C.outlineVariant} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No new users to discover</Text>
                <Text style={styles.emptySubtext}>Check back later</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Search Bar ── */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Search size={16} color={C.outlineVariant} strokeWidth={1.5} style={{ marginRight: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name…"
                        placeholderTextColor={C.outlineVariant}
                        value={query}
                        onChangeText={handleQueryChange}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        selectionColor={C.primary}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
                    onPress={handleSearch}
                    activeOpacity={0.85}
                >
                    {loading && isSearchMode ? (
                        <ActivityIndicator size="small" color="#540061" />
                    ) : (
                        <Search size={16} color={query.trim() ? '#540061' : C.outlineVariant} strokeWidth={2} />
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Section label ── */}
            <View style={styles.sectionHeader}>
                <Compass size={14} color={C.primary} strokeWidth={1.5} />
                <Text style={styles.sectionLabel}>
                    {isSearchMode ? `Results for "${query}"` : 'People you may know'}
                </Text>
            </View>

            {/* ── List ── */}
            {loading && users.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={C.primary} />
                    <Text style={styles.loadingText}>Finding people…</Text>
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
        backgroundColor: C.bg,
    },

    // ── Search Bar ──
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: C.bg,
        gap: 10,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: C.onSurface,
    },
    searchButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonDisabled: {
        backgroundColor: C.surface,
    },

    // ── Section Header ──
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: C.onSurfaceVariant,
        letterSpacing: 0.3,
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: C.onSurfaceVariant,
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
        backgroundColor: C.surface,
        borderRadius: 20,
        marginBottom: 10,
    },
    auraRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: C.outlineVariant,
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
    userInfo: {
        flex: 1,
        gap: 3,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: C.onSurface,
    },
    userBio: {
        fontSize: 12,
        color: C.outlineVariant,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonSent: {
        backgroundColor: 'rgba(243, 130, 255, 0.2)',
    },
    sentText: {
        color: C.primary,
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
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: C.onSurface,
    },
    emptySubtext: {
        fontSize: 13,
        color: C.onSurfaceVariant,
    },
});
