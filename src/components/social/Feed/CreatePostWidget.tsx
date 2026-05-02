import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { UserCircle, Image as ImageIcon, Send } from 'lucide-react-native';
import { feedService } from '../../../service/social';
import { useDispatch } from 'react-redux';
import { addFeedPost } from '../../../redux/reducers/socialSlice';

import { launchImageLibrary } from 'react-native-image-picker';
import { mediaService } from '../../../service/social';

import { useTheme } from '../../../context/ThemeContext';
import { GlassCard, ThemedText } from '../../../components/ui/ThemedComponents';

export const CreatePostWidget: React.FC = () => {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<any>(null);

    const handlePost = async () => {
        if (!text.trim() && !selectedImage) return;

        try {
            setLoading(true);

            let media = [];
            if (selectedImage) {
                try {
                    const uploadResp = await mediaService.uploadFile({
                        uri: selectedImage.uri,
                        type: selectedImage.type,
                        name: selectedImage.fileName,
                    });
                    if (uploadResp.data) {
                        const uploaded = uploadResp.data;
                        media.push({
                            mediaId: uploaded.id,
                            url: uploaded.url,
                            type: 'image' as const,
                        });
                    }
                } catch (err) {
                    console.error('Upload failed', err);
                    Alert.alert('Error', 'Image upload failed');
                    return;
                }
            }

            const response = await feedService.createPost(
                { text: text.trim(), media },
                'public',
                'general'
            );

            if (response.status === 'success' && response.data) {
                dispatch(addFeedPost(response.data));
                setText('');
                setSelectedImage(null);
            } else {
                Alert.alert('Error', 'Failed to create post');
            }
        } catch (error: any) {
            console.error('Error creating post:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            Alert.alert('Error', `Failed to create post: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0]);
        }
    };

    const canPost = (text.trim().length > 0 || selectedImage) && !loading;

    return (
        <GlassCard style={styles.container} opacity={0.12}>
            <View style={styles.inputRow}>
                {/* Aura Ring Avatar */}
                <View style={[styles.auraRing, { borderColor: theme.primary }]}>
                    <View style={styles.avatar}>
                        <UserCircle size={26} color={theme.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={[styles.input, { color: theme.text.primary }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={500}
                    />

                    {selectedImage && (
                        <View style={styles.imagePreview}>
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.previewImage}
                            />
                            <TouchableOpacity
                                style={styles.removeImage}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Text style={styles.removeImageText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.actions, { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage} activeOpacity={0.7}>
                    <ImageIcon size={18} color={theme.primary} strokeWidth={1.5} />
                    <ThemedText style={[styles.mediaText, { color: theme.primary }]}>Photo</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.postButton, { backgroundColor: theme.primary }, !canPost && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                    onPress={handlePost}
                    disabled={!canPost}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={[styles.postButtonText, { color: '#fff' }]}>Post</Text>
                            <Send size={14} color="#fff" strokeWidth={2} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 14,
    },

    // ── Input Row ──
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    auraRing: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        fontSize: 15,
        minHeight: 40,
        lineHeight: 22,
    },
    imagePreview: {
        marginTop: 10,
        alignSelf: 'flex-start',
        position: 'relative',
    },
    previewImage: {
        width: 90,
        height: 90,
        borderRadius: 12,
    },
    removeImage: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#ff6e84',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '800',
    },

    // ── Actions ──
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    mediaText: {
        fontWeight: '600',
        fontSize: 13,
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 999,
        gap: 6,
    },
    postButtonDisabled: {
        opacity: 0.5,
    },
    postButtonText: {
        fontWeight: '800',
        fontSize: 14,
    },
});
