import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { chatService, socialSocketService, friendService, mediaService } from '../../service/social';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import {
    addMessage,
    setMessages,
    setLoadingMessages
} from '../../redux/reducers/socialSlice';
import { MessageBubble } from '../../components/social/Chat/MessageBubble';
import { Send, Paperclip, ArrowLeft, MoreVertical, UserCircle, BellOff, UserPlus, LogOut, UserMinus, Camera, Image as ImageIcon, File, X as CloseIcon, Edit2 } from 'lucide-react-native';
import { Image as RNImage } from 'react-native';
import type { Message } from '../../service/social/types';

import { ThemedContainer, ThemedText, ThemedHeader } from '../../components/ui/ThemedComponents';
import { TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CustomBottomSheet } from '../../components/ui/CustomBottomSheet';

export const ChatScreen: React.FC = () => {
    const { theme } = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const flatListRef = useRef<FlatList>(null);

    const { conversationId } = route.params as { conversationId: string };

    const currentUser = useSelector((state: any) => state.social.currentUser);
    const messages = useSelector((state: any) => state.social.messages[conversationId] || []);
    
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [myUuid, setMyUuid] = useState<string | null>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

    // Get current user UUID from multiple sources for reliability
    useEffect(() => {
        const getMyId = async () => {
            if (currentUser?.quizServerUUID) {
                setMyUuid(currentUser.quizServerUUID);
                return;
            }
            try {
                const stored = await AsyncStorage.getItem('userData');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setMyUuid(parsed.uuid || parsed.quizServerUUID);
                }
            } catch (e) {
                console.error('Failed to get user ID from storage', e);
            }
        };
        getMyId();
    }, [currentUser]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    const isLoading = useSelector((state: any) => state.social.isLoadingMessages);
    const conversation = useSelector((state: any) =>
        state.social.conversations.find((c: any) => c._id === conversationId)
    );

    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadMessages();
        
        // Subscribe to real-time social events
        const subscription = DeviceEventEmitter.addListener('social_event', (event) => {
            if (event.subType === 'MESSAGE_RECEIVED') {
                try {
                    const payload = JSON.parse(event.payload);
                    // Only append if it's for the current conversation
                    if (payload.conversationId === conversationId) {
                        dispatch(addMessage({ conversationId, message: payload.message }));
                    }
                } catch (e) {
                    console.error('[ChatScreen] Error parsing event payload:', e);
                }
            }
        });

        // Keep socket as backup or remove if fully switching
        socialSocketService.joinConversation(conversationId);
        
        return () => { 
            socialSocketService.leaveConversation(conversationId); 
            subscription.remove();
            Keyboard.dismiss();
        };
    }, [conversationId]);

    const loadMessages = async () => {
        if (messages.length === 0) dispatch(setLoadingMessages(true));
        try {
            const response = await chatService.getMessages(conversationId);
            if (response.status === 'success' && response.data) {
                dispatch(setMessages({ conversationId, messages: response.data.reverse() }));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            dispatch(setLoadingMessages(false));
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() && !selectedMedia) return;
        
        const textToSend = inputText.trim();
        const mediaToSend = selectedMedia;
        
        setInputText('');
        setSelectedMedia(null);
        setSending(true);

        try {
            let payload: any = { text: textToSend };
            let type: any = 'text';

            if (mediaToSend) {
                type = mediaToSend.mimeType?.startsWith('image') ? 'image' : 
                       mediaToSend.mimeType?.startsWith('video') ? 'video' : 'document';
                
                payload = {
                    text: textToSend,
                    url: mediaToSend.url,
                    mediaId: mediaToSend.id || mediaToSend.mediaId,
                    fileName: mediaToSend.originalName || mediaToSend.fileName,
                    mimeType: mediaToSend.mimeType
                };
            }

            const response = await chatService.sendMessage(conversationId, payload, type);
            if (response.status === 'success' && response.data) {
                dispatch(addMessage({ conversationId, message: response.data }));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setInputText(textToSend);
            setSelectedMedia(mediaToSend);
        } finally {
            setSending(false);
        }
    };

    const handleAttachment = () => {
        setIsAttachmentVisible(true);
    };

    const onMediaSelected = async (response: any) => {
        if (response.didCancel || response.errorCode || !response.assets) return;
        
        setIsUploading(true);
        setIsAttachmentVisible(false);
        
        // Show temporary local preview while uploading
        const asset = response.assets[0];
        setSelectedMedia({
            localUri: asset.uri,
            mimeType: asset.type,
            isUploading: true
        });

        try {
            const file = {
                uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
                type: asset.type,
                name: asset.fileName || `media_${Date.now()}.${asset.type?.split('/')[1] || 'jpg'}`,
            };

            const uploadRes = await mediaService.uploadFile(file);
            if (uploadRes.status === 'success' && uploadRes.data) {
                setSelectedMedia({
                    ...uploadRes.data,
                    localUri: asset.uri,
                    isUploading: false
                });
            }
        } catch (e) {
            console.error('Upload failed', e);
            Alert.alert('Error', 'Failed to upload media');
            setSelectedMedia(null);
        } finally {
            setIsUploading(false);
        }
    };

    const attachmentOptions = [
        {
            text: 'Camera',
            icon: <Camera size={20} color={theme.text.primary} />,
            onPress: () => launchCamera({ mediaType: 'photo', quality: 0.8 }, onMediaSelected)
        },
        {
            text: 'Gallery',
            icon: <ImageIcon size={20} color={theme.text.primary} />,
            onPress: () => launchImageLibrary({ mediaType: 'mixed', quality: 0.8 }, onMediaSelected)
        },
        {
            text: 'Document',
            icon: <File size={20} color={theme.text.primary} />,
            onPress: () => Alert.alert('Info', 'Document picker coming soon')
        }
    ];

    const handleOptions = () => {
        setIsOptionsVisible(true);
    };

    const sheetOptions = [
        {
            text: 'Mute Notifications',
            icon: <BellOff size={20} color={theme.text.primary} />,
            onPress: async () => {
                try {
                    await chatService.muteConversation(conversationId, true);
                    // You could add a small toast here if needed
                } catch (e) { console.error(e); }
            }
        }
    ];

    if (conversation?.type === 'group') {
        sheetOptions.push({
            text: 'Add Members',
            icon: <UserPlus size={20} color={theme.text.primary} />,
            onPress: () => {
                navigation.navigate('AddMembers' as never, { groupId: conversation.groupId } as never);
            }
        });

        sheetOptions.push({
            text: 'Leave Group',
            icon: <LogOut size={20} color="#ef4444" />,
            style: 'destructive' as const,
            onPress: () => {
                Alert.alert('Info', 'Leave group functionality coming soon');
            }
        });
    } else if (conversation?.otherUser) {
        sheetOptions.push({
            text: 'Block User',
            icon: <UserMinus size={20} color="#ef4444" />,
            style: 'destructive' as const,
            onPress: async () => {
                try {
                    await friendService.blockUser(conversation.otherUser.quizServerUUID || '');
                    navigation.goBack();
                } catch (e) {
                    console.error('Failed to block user', e);
                }
            }
        });
    }

    const chatName = conversation?.otherUser?.name || conversation?.groupName || 'Chat';
    const isOnline = conversation?.otherUser?.isOnline;

    return (
        <ThemedContainer style={styles.container}>
            {/* ── Header ── */}
            <ThemedHeader 
                title={chatName}
                showBack
                rightAction={
                    <TouchableOpacity
                        style={styles.optionsButton}
                        onPress={handleOptions}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MoreVertical size={20} color={theme.text.secondary} strokeWidth={1.5} />
                    </TouchableOpacity>
                }
                style={{ borderBottomWidth: 1, borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            />

            {/* ── Message List ── */}
            <View style={{ flex: 1 }}>
                {isLoading && messages.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={theme.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        inverted
                        renderItem={({ item }) => {
                            const isOwn = item.senderUUID === myUuid;
                            return (
                                <MessageBubble
                                    message={item}
                                    isOwnMessage={isOwn}
                                />
                            );
                        }}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                    />
                )}
            </View>

            {/* ── Input Bar ── */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25}
                style={{ backgroundColor: theme.background[0] }}
            >
                <View style={[styles.inputContainer, { borderTopColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <TouchableOpacity 
                        style={[styles.attachButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                        onPress={selectedMedia ? () => setSelectedMedia(null) : handleAttachment}
                        disabled={isUploading && !selectedMedia}
                    >
                        {selectedMedia ? (
                            <View style={styles.thumbnailContainer}>
                                <RNImage 
                                    source={{ uri: selectedMedia.localUri }} 
                                    style={[styles.thumbnail, selectedMedia.isUploading && { opacity: 0.5 }]} 
                                />
                                <View style={[styles.thumbnailOverlay, { backgroundColor: theme.primary }]}>
                                    <CloseIcon size={10} color="#fff" strokeWidth={3} />
                                </View>
                                {selectedMedia.isUploading && (
                                    <ActivityIndicator size="small" color="#fff" style={StyleSheet.absoluteFill} />
                                )}
                            </View>
                        ) : isUploading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Paperclip size={18} color={theme.text.secondary} strokeWidth={1.5} />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { 
                            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            color: theme.text.primary 
                        }]}
                        placeholder="Message…"
                        placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        selectionColor={theme.primary}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary }, (!inputText.trim() && !selectedMedia) && { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
                        onPress={handleSend}
                        disabled={(!inputText.trim() && !selectedMedia) || sending || (selectedMedia?.isUploading)}
                        activeOpacity={0.85}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={16} color={(inputText.trim() || selectedMedia) ? '#fff' : theme.text.secondary} strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <CustomBottomSheet
                isVisible={isOptionsVisible}
                onClose={() => setIsOptionsVisible(false)}
                title={chatName}
                options={sheetOptions}
            />

            <CustomBottomSheet
                isVisible={isAttachmentVisible}
                onClose={() => setIsAttachmentVisible(false)}
                title="Send Attachment"
                options={attachmentOptions}
            />
        </ThemedContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
    },
    headerAvatar: {
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22c55e',
        borderWidth: 2,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#22c55e',
        fontWeight: '600',
    },
    optionsButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ── Messages ──
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        paddingVertical: 12,
    },

    // ── Input ──
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        gap: 8,
    },
    attachButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 9,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
    },
    // ── Thumbnails ──
    thumbnailContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        overflow: 'visible',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    thumbnailOverlay: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
});
