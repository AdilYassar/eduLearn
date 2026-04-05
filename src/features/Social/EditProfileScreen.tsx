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

// ── Design Tokens ─────────────────────────────────────────────────────────────
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
    error: '#ff6e84',
};

export const EditProfileScreen: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
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

                <Text style={styles.headerTitle}>Edit Profile</Text>

                <TouchableOpacity
                    style={[styles.saveButton, (!canSave || loading) && styles.saveButtonDisabled]}
                    onPress={handleUpdate}
                    disabled={!canSave || loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#540061" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Avatar Section ── */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handleChoosePhoto} activeOpacity={0.8}>
                        {/* Aura Ring */}
                        <View style={styles.auraRing}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <UserCircle size={56} color={C.primary} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>
                        {/* Camera Badge */}
                        <View style={styles.cameraBadge}>
                            <Camera size={14} color='#540061' strokeWidth={2} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    {currentUser?.name && (
                        <Text style={styles.currentName}>{currentUser.name}</Text>
                    )}
                </View>

                {/* ── Form ── */}
                <View style={styles.formCard}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>NAME</Text>
                        <TextInput
                            style={styles.fieldInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                            placeholderTextColor={C.outlineVariant}
                            selectionColor={C.primary}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Bio */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.fieldLabelRow}>
                            <Text style={styles.fieldLabel}>BIO</Text>
                            <Text style={styles.charCount}>{bio.length}/160</Text>
                        </View>
                        <TextInput
                            style={[styles.fieldInput, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Write something about yourself…"
                            placeholderTextColor={C.outlineVariant}
                            multiline
                            numberOfLines={4}
                            maxLength={160}
                            textAlignVertical="top"
                            selectionColor={C.primary}
                        />
                    </View>
                </View>
            </ScrollView>
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
    saveButton: {
        backgroundColor: C.primary,
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        minWidth: 64,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(243,130,255,0.25)',
    },
    saveButtonText: {
        color: '#540061',
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
        borderColor: C.primary,
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
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: C.primary,
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: C.bg,
    },
    changePhotoText: {
        color: C.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    currentName: {
        color: C.onSurfaceVariant,
        fontSize: 12,
        marginTop: 4,
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
    bioInput: {
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
