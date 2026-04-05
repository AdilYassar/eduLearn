import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users } from 'lucide-react-native';
import { groupService } from '../../service/social';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#0e0e0e',
    surface: '#1a1919',
    surfaceHigh: '#201f1f',
    primary: '#f382ff',
    secondary: '#ac8aff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#adaaaa',
    outlineVariant: '#484847',
};

export const CreateGroupScreen: React.FC = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Group name is required');
            return;
        }
        try {
            setLoading(true);
            const response = await groupService.createGroup(name, description);
            if (response.status === 'success' && response.data) {
                Alert.alert('Success', 'Group created successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const canCreate = name.trim().length > 0;

    return (
        <SafeAreaView style={styles.container}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ArrowLeft size={20} color={C.onSurfaceVariant} strokeWidth={1.5} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>New Group</Text>

                <TouchableOpacity
                    style={[styles.createButton, (!canCreate || loading) && styles.createButtonDisabled]}
                    onPress={handleCreate}
                    disabled={!canCreate || loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#540061" />
                    ) : (
                        <Text style={styles.createButtonText}>Create</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Group icon placeholder */}
                <View style={styles.iconSection}>
                    <View style={styles.groupIconWrap}>
                        <Users size={36} color={C.primary} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.iconHint}>Group icon</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>GROUP NAME</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Study Group"
                            placeholderTextColor={C.outlineVariant}
                            maxLength={50}
                            selectionColor={C.primary}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabelRow}>
                            <Text style={styles.fieldLabel}>DESCRIPTION</Text>
                            <Text style={styles.charCount}>{description.length}/200</Text>
                        </View>
                        <TextInput
                            style={[styles.fieldInput, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your group…"
                            placeholderTextColor={C.outlineVariant}
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                            textAlignVertical="top"
                            selectionColor={C.primary}
                        />
                    </View>
                </View>
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: C.bg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(72,72,71,0.3)',
    },
    cancelButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: C.onSurface,
        letterSpacing: -0.2,
    },
    createButton: {
        backgroundColor: C.primary,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        minWidth: 72,
        alignItems: 'center',
    },
    createButtonDisabled: {
        backgroundColor: 'rgba(243,130,255,0.25)',
    },
    createButtonText: {
        color: '#540061',
        fontWeight: '800',
        fontSize: 14,
    },

    // ── Content ──
    content: {
        padding: 20,
    },
    iconSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    groupIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: C.surface,
        borderWidth: 2,
        borderColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconHint: {
        fontSize: 12,
        color: C.primary,
        fontWeight: '600',
    },

    // ── Form Card ──
    formCard: {
        backgroundColor: C.surface,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
    fieldGroup: {
        paddingVertical: 14,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: C.outlineVariant,
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    fieldInput: {
        fontSize: 15,
        color: C.onSurface,
        paddingVertical: 0,
    },
    textArea: {
        minHeight: 72,
        lineHeight: 22,
    },
    charCount: {
        fontSize: 11,
        color: C.outlineVariant,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(72,72,71,0.3)',
    },
});
