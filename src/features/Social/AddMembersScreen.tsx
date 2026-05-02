import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Check, UserCircle, Search, X } from 'lucide-react-native';
import { friendService, groupService } from '../../service/social';
import type { Friend } from '../../service/social/types';
import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText, ThemedHeader } from '../../components/ui/ThemedComponents';

export const AddMembersScreen: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { groupId } = route.params as { groupId: string };

    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            const response = await friendService.getFriends();
            if (response.status === 'success' && response.data) {
                setFriends(response.data);
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (uuid: string) => {
        if (selectedIds.includes(uuid)) {
            setSelectedIds(prev => prev.filter(id => id !== uuid));
        } else {
            setSelectedIds(prev => [...prev, uuid]);
        }
    };

    const handleAddMembers = async () => {
        if (selectedIds.length === 0) return;
        setAdding(true);
        try {
            // Add members sequentially or via batch if supported (backend only shows single add)
            for (const uuid of selectedIds) {
                await groupService.addMember(groupId, uuid);
            }
            Alert.alert('Success', 'Members added successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error adding members:', error);
            Alert.alert('Error', 'Failed to add some members');
        } finally {
            setAdding(false);
        }
    };

    const renderFriend = ({ item }: { item: Friend }) => {
        const isSelected = selectedIds.includes(item.quizServerUUID);
        return (
            <TouchableOpacity
                style={[styles.friendItem, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                onPress={() => toggleSelect(item.quizServerUUID)}
                activeOpacity={0.7}
            >
                <View style={[styles.avatar, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <UserCircle size={32} color={theme.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.friendInfo}>
                    <ThemedText weight="bold">{item.name}</ThemedText>
                    <ThemedText variant="secondary" size="small">@{item.name.toLowerCase().replace(/\s/g, '')}</ThemedText>
                </View>
                <View style={[
                    styles.checkbox, 
                    { borderColor: theme.primary },
                    isSelected && { backgroundColor: theme.primary }
                ]}>
                    {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedContainer style={styles.container}>
            <ThemedHeader 
                title="Add Members" 
                showBack
                rightAction={
                    selectedIds.length > 0 && (
                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: theme.primary }]}
                            onPress={handleAddMembers}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.doneButtonText}>Add ({selectedIds.length})</Text>
                            )}
                        </TouchableOpacity>
                    )
                }
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.primary} />
                </View>
            ) : friends.length === 0 ? (
                <View style={styles.center}>
                    <ThemedText variant="secondary">No friends to add</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={friends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.quizServerUUID}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    doneButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
