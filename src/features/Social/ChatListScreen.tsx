import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConversationsList } from '../../components/social/Chat/ConversationsList';
import { Edit, Users, UserPlus, X, MessageCircle, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SocialTabContext } from '../../navigation/SocialNavigator';
import { Keyboard } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText } from '../../components/ui/ThemedComponents';

export const ChatListScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { switchTab } = useContext(SocialTabContext);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const handleFindFriend = () => {
        closeModal();
        setTimeout(() => switchTab('Friends'), 200);
    };

    const handleCreateGroup = () => {
        closeModal();
        setTimeout(() => navigation.navigate('CreateGroup' as never), 200);
    };

    useFocusEffect(
        React.useCallback(() => {
            Keyboard.dismiss();
        }, [])
    );

    return (
        <ThemedContainer style={styles.container} useGradient={false} edges={['left', 'right']}>
            {/* ── Empty Header (for title if needed) ── */}
            <View style={styles.header}>
                <ThemedText weight="bold" size="xlarge">Messages</ThemedText>
            </View>

            <ConversationsList />

            {/* ── Floating Action Button ── */}
            <TouchableOpacity
                style={[styles.fabButton, { backgroundColor: theme.primary }]}
                onPress={openModal}
                activeOpacity={0.8}
            >
                <Edit size={24} color="#FFF" strokeWidth={2} />
            </TouchableOpacity>

            {/* ── Custom "New Conversation" Modal ── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                {/* Backdrop */}
                <Pressable style={styles.backdrop} onPress={closeModal}>
                    {/* Sheet */}
                    <View style={[styles.sheet, { backgroundColor: theme.background[0] }]}>
                        <View style={[styles.handlePill, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <MessageCircle size={20} color={theme.primary} strokeWidth={1.5} />
                                <ThemedText weight="bold" size="large">New Conversation</ThemedText>
                            </View>
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                                onPress={closeModal}
                            >
                                <X size={18} color={theme.text.secondary} strokeWidth={1.5} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText variant="secondary" style={styles.modalSubtitle}>
                            Choose how you'd like to start a chat
                        </ThemedText>

                        {/* Options */}
                        <TouchableOpacity
                            style={[styles.option, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                            onPress={handleFindFriend}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(243,130,255,0.1)' }]}>
                                <UserPlus size={22} color={theme.primary} strokeWidth={1.5} />
                            </View>
                            <View style={styles.optionText}>
                                <ThemedText weight="bold">Direct Message</ThemedText>
                                <ThemedText variant="secondary" size="small">Find a friend and start chatting</ThemedText>
                            </View>
                            <ThemedText variant="secondary" style={{ fontSize: 22 }}>›</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                            onPress={handleCreateGroup}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(172,138,255,0.1)' }]}>
                                <Users size={22} color={theme.secondary} strokeWidth={1.5} />
                            </View>
                            <View style={styles.optionText}>
                                <ThemedText weight="bold">Create Group</ThemedText>
                                <ThemedText variant="secondary" size="small">Start a group conversation</ThemedText>
                            </View>
                            <ThemedText variant="secondary" style={{ fontSize: 22 }}>›</ThemedText>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={styles.cancelOption}
                            onPress={closeModal}
                            activeOpacity={0.7}
                        >
                            <ThemedText weight="semibold" variant="secondary">Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
    },
    fabButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 10,
    },

    // ── Modal ──
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 36,
    },
    handlePill: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubtitle: {
        marginBottom: 22,
        lineHeight: 18,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    optionText: {
        flex: 1,
        gap: 3,
    },
    cancelOption: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
    },
});
