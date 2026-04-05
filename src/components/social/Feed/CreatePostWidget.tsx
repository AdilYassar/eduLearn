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

// ── Ethereal Editorial Design Tokens ──────────────────────────────────────────
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

export const CreatePostWidget: React.FC = () => {
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
        <View style={styles.container}>
            <View style={styles.inputRow}>
                {/* Aura Ring Avatar */}
                <View style={styles.auraRing}>
                    <View style={styles.avatar}>
                        <UserCircle size={26} color={C.primary} strokeWidth={1.5} />
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind?"
                        placeholderTextColor={C.outlineVariant}
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

            <View style={styles.actions}>
                <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage} activeOpacity={0.7}>
                    <ImageIcon size={18} color={C.secondary} strokeWidth={1.5} />
                    <Text style={styles.mediaText}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.postButton, !canPost && styles.postButtonDisabled]}
                    onPress={handlePost}
                    disabled={!canPost}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#540061" />
                    ) : (
                        <>
                            <Text style={styles.postButtonText}>Post</Text>
                            <Send size={14} color="#540061" strokeWidth={2} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1919',
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
        borderColor: C.primary,
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
        backgroundColor: '#201f1f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        fontSize: 15,
        color: C.onSurface,
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
        borderTopColor: 'rgba(72,72,71,0.3)',
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    mediaText: {
        color: C.secondary,
        fontWeight: '600',
        fontSize: 13,
    },
    postButton: {
        backgroundColor: C.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 999,
        gap: 6,
    },
    postButtonDisabled: {
        backgroundColor: 'rgba(243, 130, 255, 0.25)',
    },
    postButtonText: {
        color: '#540061',
        fontWeight: '800',
        fontSize: 14,
    },
});
