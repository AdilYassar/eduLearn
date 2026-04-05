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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { chatService, socialSocketService, friendService } from '../../service/social';
import {
    addMessage,
    setMessages,
    setLoadingMessages
} from '../../redux/reducers/socialSlice';
import { MessageBubble } from '../../components/social/Chat/MessageBubble';
import { Send, Paperclip, ArrowLeft, MoreVertical, UserCircle } from 'lucide-react-native';
import type { Message } from '../../service/social/types';

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
};

export const ChatScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const flatListRef = useRef<FlatList>(null);

    const { conversationId } = route.params as { conversationId: string };

    const currentUser = useSelector((state: any) => state.social.currentUser);
    const messages = useSelector((state: any) => state.social.messages[conversationId] || []);
    const isLoading = useSelector((state: any) => state.social.isLoadingMessages);
    const conversation = useSelector((state: any) =>
        state.social.conversations.find((c: any) => c._id === conversationId)
    );

    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadMessages();
        socialSocketService.joinConversation(conversationId);
        return () => { socialSocketService.leaveConversation(conversationId); };
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
        if (!inputText.trim()) return;
        const textToSend = inputText.trim();
        setInputText('');
        setSending(true);
        try {
            const response = await chatService.sendMessage(conversationId, { text: textToSend });
            if (response.status === 'success' && response.data) {
                dispatch(addMessage({ conversationId, message: response.data }));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setInputText(textToSend);
        } finally {
            setSending(false);
        }
    };

    const handleOptions = () => {
        Alert.alert('Chat Options', 'Choose an action', [
            {
                text: 'Mute Notifications',
                onPress: async () => {
                    try {
                        await chatService.muteConversation(conversationId, true);
                        Alert.alert('Success', 'Conversation muted');
                    } catch (e) { console.error(e); }
                }
            },
            {
                text: 'Block User',
                style: 'destructive',
                onPress: async () => {
                    if (conversation?.otherUser) {
                        try {
                            await friendService.blockUser(conversation.otherUser.quizServerUUID || '');
                            Alert.alert('Blocked', 'User has been blocked');
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to block user');
                        }
                    }
                }
            },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const chatName = conversation?.otherUser?.name || conversation?.groupName || 'Chat';
    const isOnline = conversation?.otherUser?.isOnline;

    return (
        <SafeAreaView style={styles.container}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <ArrowLeft size={22} color={C.onSurface} strokeWidth={1.5} />
                </TouchableOpacity>

                {/* Avatar */}
                <View style={styles.headerAvatar}>
                    <UserCircle size={28} color={C.primary} strokeWidth={1.5} />
                    {isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{chatName}</Text>
                    {isOnline && (
                        <Text style={styles.headerSubtitle}>● Online</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={handleOptions}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MoreVertical size={20} color={C.onSurfaceVariant} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            {/* ── Message List ── */}
            {isLoading && messages.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={C.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item}
                            isOwnMessage={item.senderUUID === currentUser?.quizServerUUID}
                        />
                    )}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            {/* ── Input Bar ── */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Paperclip size={18} color={C.onSurfaceVariant} strokeWidth={1.5} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Message…"
                        placeholderTextColor={C.outlineVariant}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        selectionColor={C.primary}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || sending}
                        activeOpacity={0.85}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#540061" />
                        ) : (
                            <Send size={16} color={inputText.trim() ? '#540061' : C.outlineVariant} strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(72,72,71,0.3)',
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
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: C.primary,
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
        borderColor: C.surface,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: C.onSurface,
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
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: 'rgba(72,72,71,0.3)',
        gap: 8,
    },
    attachButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: C.surfaceHigh,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: C.surfaceHigh,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 9,
        fontSize: 14,
        color: C.onSurface,
        maxHeight: 100,
    },
    sendButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: C.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: C.surfaceHigh,
    },
});
