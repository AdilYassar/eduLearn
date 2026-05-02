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

import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText, ThemedHeader } from '../../components/ui/ThemedComponents';

export const CreateGroupScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
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
        <ThemedContainer style={styles.container} useGradient={false}>
            {/* ── Header ── */}
            <ThemedHeader 
                title="New Group"
                showBack
                rightAction={
                    <TouchableOpacity
                        style={[
                            styles.createButton, 
                            { backgroundColor: theme.primary },
                            (!canCreate || loading) && styles.createButtonDisabled
                        ]}
                        onPress={handleCreate}
                        disabled={!canCreate || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.createButtonText}>Create</Text>
                        )}
                    </TouchableOpacity>
                }
                style={{ borderBottomWidth: 1, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            />

            <View style={styles.content}>
                {/* Group icon placeholder */}
                <View style={styles.iconSection}>
                    <View style={[styles.groupIconWrap, { borderColor: theme.primary, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                        <Users size={36} color={theme.primary} strokeWidth={1.5} />
                    </View>
                    <Text style={[styles.iconHint, { color: theme.primary }]}>Group icon</Text>
                </View>

                {/* Form Card */}
                <View style={[styles.formCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <ThemedText variant="secondary" weight="bold" style={styles.fieldLabel}>GROUP NAME</ThemedText>
                        <TextInput
                            style={[styles.fieldInput, { color: theme.text.primary }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Study Group"
                            placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            maxLength={50}
                            selectionColor={theme.primary}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                    {/* Description */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabelRow}>
                            <ThemedText variant="secondary" weight="bold" style={styles.fieldLabel}>DESCRIPTION</ThemedText>
                            <ThemedText variant="secondary" size="small">{description.length}/200</ThemedText>
                        </View>
                        <TextInput
                            style={[styles.fieldInput, styles.textArea, { color: theme.text.primary }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your group…"
                            placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                            textAlignVertical="top"
                            selectionColor={theme.primary}
                        />
                    </View>
                </View>
            </View>
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        minWidth: 72,
        alignItems: 'center',
    },
    createButtonDisabled: {
        opacity: 0.5,
    },
    createButtonText: {
        color: '#fff',
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
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconHint: {
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Form Card ──
    formCard: {
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
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    fieldInput: {
        fontSize: 15,
        paddingVertical: 0,
    },
    textArea: {
        minHeight: 72,
        lineHeight: 22,
    },
    divider: {
        height: 1,
    },
});
