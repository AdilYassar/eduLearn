import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { UserCircle, Camera, ArrowLeft } from 'lucide-react-native';
import { userService, mediaService } from '../../service/social';
import { updateCurrentUser } from '../../redux/reducers/socialSlice';
import { launchImageLibrary } from 'react-native-image-picker';

import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, ThemedText, ThemedHeader } from '../../components/ui/ThemedComponents';

export const EditProfileScreen: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const currentUser = useSelector((state: any) => state.social.currentUser);

    const [name, setName] = useState(currentUser?.name || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(currentUser?.avatar || null);

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const updateData: any = { name, bio };
            if (avatar !== currentUser?.avatar) {
                updateData.avatar = avatar;
            }
            const response = await userService.updateMe(updateData);
            if (response.status === 'success' && response.data) {
                dispatch(updateCurrentUser(response.data));
                Alert.alert('Success', 'Profile updated successfully');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChoosePhoto = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            Alert.alert('Info', 'Media upload implementation requires backend support.');
        }
    };

    const canSave = name.trim().length > 0;

    return (
        <ThemedContainer style={styles.container} useGradient={false}>
            {/* ── Header ── */}
            <ThemedHeader 
                title="Edit Profile"
                showBack
                rightAction={
                    <TouchableOpacity
                        style={[
                            styles.saveButton, 
                            { backgroundColor: theme.primary },
                            (!canSave || loading) && styles.saveButtonDisabled
                        ]}
                        onPress={handleUpdate}
                        disabled={!canSave || loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                }
                style={{ borderBottomWidth: 1, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar Section ── */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handleChoosePhoto} activeOpacity={0.8}>
                        {/* Aura Ring */}
                        <View style={[styles.auraRing, { borderColor: theme.primary }]}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarFallback, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                    <UserCircle size={56} color={theme.primary} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>
                        {/* Camera Badge */}
                        <View style={[styles.cameraBadge, { backgroundColor: theme.primary, borderColor: theme.background[0] }]}>
                            <Camera size={14} color="#fff" strokeWidth={2} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleChoosePhoto}>
                        <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Profile Photo</Text>
                    </TouchableOpacity>
                    {currentUser?.name && (
                        <ThemedText variant="secondary" style={styles.currentName}>{currentUser.name}</ThemedText>
                    )}
                </View>

                {/* ── Form ── */}
                <View style={[styles.formCard, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <ThemedText variant="secondary" weight="bold" style={styles.fieldLabel}>NAME</ThemedText>
                        <TextInput
                            style={[styles.fieldInput, { color: theme.text.primary }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            selectionColor={theme.primary}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                    {/* Bio */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabelRow}>
                            <ThemedText variant="secondary" weight="bold" style={styles.fieldLabel}>BIO</ThemedText>
                            <ThemedText variant="secondary" size="small">{bio.length}/160</ThemedText>
                        </View>
                        <TextInput
                            style={[styles.fieldInput, styles.bioInput, { color: theme.text.primary }]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Write something about yourself…"
                            placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                            multiline
                            numberOfLines={4}
                            maxLength={160}
                            textAlignVertical="top"
                            selectionColor={theme.primary}
                        />
                    </View>
                </View>
            </ScrollView>
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    saveButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        minWidth: 64,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },

    // ── Avatar ──
    scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    auraRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 86,
        height: 86,
        borderRadius: 43,
    },
    avatarFallback: {
        width: 86,
        height: 86,
        borderRadius: 43,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    changePhotoText: {
        fontSize: 13,
        fontWeight: '600',
    },
    currentName: {
        marginTop: 4,
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
    bioInput: {
        minHeight: 72,
        lineHeight: 22,
    },
    divider: {
        height: 1,
    },
});
