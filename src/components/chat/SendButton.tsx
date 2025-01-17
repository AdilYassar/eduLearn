/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import { View, StyleSheet, Dimensions, Platform, TextInput, Animated, TouchableOpacity, NativeSyntheticEvent, TextInputContentSizeChangeEventData } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import useKeyboardOffsetHeight from '../../helpers/useKeyboardOffsetHeight';
import { useDispatch, useSelector } from 'react-redux';
import { addAssistantMessage, markMessageAsRead, updateChatSummary, addMessages, createNewChat, selectChats, selectCurrentChatId, updateAssistantMessage } from '../../redux/reducers/chatSlice';
import { PaperAirplaneIcon } from 'react-native-heroicons/solid';
import uuid from 'react-native-uuid';
import EventSource from 'react-native-sse';
import { HUGGING_API_URL, HUGGING_API_KEY, STABLE_DIFFUSION_URL, STABLE_DIFFUSION_KEY } from '../../redux/API';
import axios from 'axios';
import { Colors } from '@utils/Constants';

const windowHeight = Dimensions.get('window').height;

interface SendButtonProps {
    isTyping: boolean;
    setIsTyping: (isTyping: boolean) => void;
    setCurrentChatId: (chatId: string) => void;
    length: number;
    setHeightOfMessageBox?: (height: number) => void; // Optional if not always provided
    messages: Array<{
        content: string;
        time: string;
        role: string;
        id: string;
        isMessageRead: boolean;
    }>;
}

const SendButton: React.FC<SendButtonProps> = ({
    isTyping,
    setIsTyping,
    setCurrentChatId,
    length,
    setHeightOfMessageBox,
    messages,
}) => {
    const dispatch = useDispatch();
    const chats = useSelector(selectChats) as Array<{ id: string }>;
    const currentChatId = useSelector(selectCurrentChatId);
    const animationValue = useRef(new Animated.Value(0)).current;
    const keyboardOffsetHeight = useKeyboardOffsetHeight();

    const [message, setMessage] = useState<string>('');
    const TextInputRef = useRef<TextInput>(null);

    const handleTextChange = (text: string) => {
        setIsTyping(!!text);
        setMessage(text);
    };

    const handleContentSizeChange = (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
        setHeightOfMessageBox?.(event.nativeEvent.contentSize.height);
    };

    useEffect(() => {
        Animated.timing(animationValue, {
            toValue: isTyping ? 1 : 0,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [isTyping, animationValue]);

    const sendButtonStyle = {
        opacity: animationValue,
        transform: [
            {
                scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                }),
            },
        ],
    };

    const identifyImageApi = (prompt: string): boolean => {
        const imageRegex = /\b(generate\s*image|imagine)\b/i;
        return imageRegex.test(prompt);
    };

    const addChat = async (newId?: string | unknown) => {
        let selectedChatId = (newId as string) || currentChatId;
        if (length === 0 && message.trim().length > 0) {
            dispatch(updateChatSummary({
                chatId: selectedChatId || '',
                summary: message?.trim().slice(0, 40)
            }));
        }

        dispatch(addMessages({
            chatId: selectedChatId || '',
            message: {
                content: message,
                time: new Date().toString(),
                role: 'user',
                id: uuid.v4() as string,
                isMessageRead: false,
            },
        }));

        setMessage('');
        setIsTyping(false);

        let promptForAssistant = {
            content: message,
            time: new Date().toString(),
            role: 'user',
            id: length + 1,
            isMessageRead: false
        };

        if (!identifyImageApi(message)) {
            fetchResponse(promptForAssistant, selectedChatId as string);
        } else {
            generateImage(promptForAssistant, selectedChatId as string);
        }

        dispatch(markMessageAsRead({
            chatId: selectedChatId,
            messageId: length + 1
        }));
    };

    const fetchResponse = async (mes: { content: string; time: string; role: string; id: number; isMessageRead: boolean }, selectedChatId: string) => {
        let id = length + 2;
        dispatch(addAssistantMessage({
            chatId: selectedChatId,
            message: {
                content: 'loading ...',
                time: mes.time,
                role: 'assistant',
                id: id.toString(),
            }
        }));

        const eventSource = new EventSource(HUGGING_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HUGGING_API_KEY}`,
                'Content-Type': "application/json"
            },
            pollingInterval: 0,
            body: JSON.stringify({
                model: 'meta-llama/Meta-Llama-3-8B-Instruct',
                messages: [...messages, mes],
                max_token: 500,
                stream: true,
            })
        });

        let content = '';
        let responseComplete = false;

        eventSource.addEventListener('message', event => {
            if (event.data !== '[DONE]') {
                if (event.data) {
                    const parsedData = JSON.parse(event.data);
                    if (parsedData.choices && parsedData.choices.length > 0) {
                        const delta = parsedData.choices[0].delta.content;
                        if (delta) {
                            content += delta;
                            dispatch(updateAssistantMessage({
                                chatId: selectedChatId,
                                message: {
                                    content,
                                    time: new Date().toString(),
                                    role: 'assistant',
                                    id: id.toString(),
                                },
                                messageId: id.toString(),
                            }));
                        }
                    }
                }
            } else {
                responseComplete = true;
                eventSource.close();
            }
        });

        eventSource.addEventListener('error', error => {
            console.log(error);
            dispatch(updateAssistantMessage({
                chatId: selectedChatId,
                message: {
                    content: 'oops something is not working',
                    time: new Date().toString(),
                    role: 'assistant',
                    id: id.toString(),
                },
                messageId: id.toString(),
            }));
            eventSource.close();
        });

        eventSource.addEventListener('close', () => {
            if (!responseComplete) {
                eventSource.close();
            }
        });

        return () => {
            eventSource.removeAllEventListeners();
            eventSource.close();
        };
    };

    const generateImage = async (mes: { content: string; time: string; role: string; id: number; isMessageRead: boolean }, selectedChatId: string) => {
        let id = length + 2;
        dispatch(addAssistantMessage({
            chatId: selectedChatId,
            message: {
                content: 'loading ...',
                time: mes.time,
                role: 'assistant',
                id: id.toString(),
            }
        }));

        try {
            const res = await axios.post(STABLE_DIFFUSION_URL, {
                key: STABLE_DIFFUSION_KEY,
                prompt: message,
                negative_prompt: 'low-quality',
                width: '512',
                height: '512',
                safety_checkers: false,
                seed: null,
                samples: 1,
                base64: false,
                webhook: null,
                track_id: null,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            dispatch(updateAssistantMessage({
                chatId: selectedChatId,
                message: {
                    imageUri: res.data?.output[0],
                    content: res.data?.output[0],
                    time: new Date().toString(),
                    role: 'assistant',
                    id: id.toString(),
                },
                messageId: id.toString(),
            }));
        } catch (error) {
            console.log(error);
            dispatch(updateAssistantMessage({
                chatId: selectedChatId,
                message: {
                    content: 'oops something is not working',
                    time: new Date().toString(),
                    role: 'assistant',
                    id: id.toString(),
                },
                messageId: id.toString(),
            }));
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    bottom: Platform.OS === 'android' ? windowHeight * 0.02 : Math.max(keyboardOffsetHeight, windowHeight * 0.02),
                },
            ]}
        >
            <View style={styles.subContainer}>
                <View style={[styles.inputContainer, { width: isTyping ? '87%' : '100%' }]}>
                    <TextInput
                        editable
                        multiline
                        ref={TextInputRef}
                        value={message}
                        style={styles.textinput}
                        placeholder="Message"
                        placeholderTextColor="#000"
                        onChangeText={handleTextChange}
                        onContentSizeChange={handleContentSizeChange}
                    />
                </View>
                {isTyping && (
                    <Animated.View style={[styles.sendButtonWrapper, sendButtonStyle]}>
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={async () => {
                                const chatIndex: number = chats.findIndex((chat: { id: string }) => chat.id === currentChatId);
                                if (chatIndex === -1) {
                                    const newId = uuid.v4() as string;
                                    setCurrentChatId(newId);
                                    await dispatch(
                                        createNewChat({
                                            chatId: newId,
                                            messages: [],
                                            summary: 'New Chat',
                                        })
                                    );
                                    await addChat(newId);
                                    return;
                                }
                                await addChat();
                            }}
                        >
                            <PaperAirplaneIcon color="#000" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: windowHeight * 0.06,
        maxHeight: windowHeight * 0.4,
        paddingHorizontal: '1%',
        padding: 10,
        position: 'absolute',
        left: 0,
        right: 0,
        width: '98%',
        alignContent: 'center',
    },
    subContainer: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
    },
    inputContainer: {
        backgroundColor: Colors.teal_400,
        margin: '1%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '1%',
        borderRadius: 20,
    },
    textinput: {
        width: '98%',
        padding: 10,
        marginHorizontal: '2%',
        fontSize: RFValue(13),
        color: '#000',
    },
    sendButtonWrapper: {
        position: 'absolute',
        right: 0,
        bottom: 6,
        width: '11%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    sendButton: {
        backgroundColor: '#22c063',
        borderRadius: 42,
        height: 42,
        width: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SendButton;