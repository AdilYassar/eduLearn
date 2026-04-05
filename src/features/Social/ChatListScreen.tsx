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
import { Edit, Users, UserPlus, X, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SocialTabContext } from '../../navigation/SocialNavigator';

// ── Design Tokens ─────────────────────────────────────────────────────────────
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

export const ChatListScreen: React.FC = () => {
    const navigation = useNavigation();
    const { switchTab } = useContext(SocialTabContext);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const handleFindFriend = () => {
        closeModal();
        // Switch to the Friends tab via context — no navigator needed
        setTimeout(() => switchTab('Friends'), 200);
    };

    const handleCreateGroup = () => {
        closeModal();
        // CreateGroup is a stack screen, so navigation.navigate works fine here
        setTimeout(() => navigation.navigate('CreateGroup' as never), 200);
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            {/* ── Header ── */}
            <View style={[styles.header, { justifyContent: 'flex-end' }]}>
                <TouchableOpacity
                    style={styles.newMessageButton}
                    onPress={openModal}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.75}
                >
                    <Edit size={20} color={C.primary} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <ConversationsList />

            {/* ── Custom "New Conversation" Modal ── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                {/* Backdrop */}
                <Pressable style={styles.backdrop} onPress={closeModal}>
                    {/* Sheet — stop propagation so tapping it doesn't dismiss */}
                    <Pressable style={styles.sheet} onPress={() => {}}>

                        {/* Handle pill */}
                        <View style={styles.handlePill} />

                        {/* Header row */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <MessageCircle size={20} color={C.primary} strokeWidth={1.5} />
                                <Text style={styles.modalTitle}>New Conversation</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeModal}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <X size={18} color={C.onSurfaceVariant} strokeWidth={1.5} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            Choose how you'd like to start a chat
                        </Text>

                        {/* Options */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={handleFindFriend}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(243,130,255,0.12)' }]}>
                                <UserPlus size={22} color={C.primary} strokeWidth={1.5} />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={styles.optionLabel}>Direct Message</Text>
                                <Text style={styles.optionDesc}>Find a friend and start chatting</Text>
                            </View>
                            <View style={styles.optionChevron}>
                                <Text style={styles.chevronText}>›</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={handleCreateGroup}
                            activeOpacity={0.75}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: 'rgba(172,138,255,0.12)' }]}>
                                <Users size={22} color={C.secondary} strokeWidth={1.5} />
                            </View>
                            <View style={styles.optionText}>
                                <Text style={styles.optionLabel}>Create Group</Text>
                                <Text style={styles.optionDesc}>Start a group conversation</Text>
                            </View>
                            <View style={styles.optionChevron}>
                                <Text style={styles.chevronText}>›</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={styles.cancelOption}
                            onPress={closeModal}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: C.bg,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: C.onSurface,
        letterSpacing: -0.5,
    },
    newMessageButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Modal ──
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: C.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 36,
    },

    // Handle
    handlePill: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.outlineVariant,
        alignSelf: 'center',
        marginBottom: 20,
    },

    // Modal header
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
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: C.onSurface,
        letterSpacing: -0.3,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubtitle: {
        fontSize: 13,
        color: C.onSurfaceVariant,
        marginBottom: 22,
        lineHeight: 18,
    },

    // Option rows
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surfaceHigh,
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
    optionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: C.onSurface,
    },
    optionDesc: {
        fontSize: 12,
        color: C.onSurfaceVariant,
    },
    optionChevron: {
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevronText: {
        fontSize: 22,
        color: C.outlineVariant,
        lineHeight: 26,
    },

    // Cancel
    cancelOption: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
    },
    cancelText: {
        fontSize: 15,
        color: C.onSurfaceVariant,
        fontWeight: '600',
    },
});
