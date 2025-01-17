import { createSlice } from '@reduxjs/toolkit';

interface Message {
    id: string;
    text: string;
    isMessageRead: boolean;
}

interface Chat {
    id: string;
    messages: Message[];
    summary: string;
}

interface ChatState {
    chats: Chat[];
    currentChatId: string;
}

const initialState: ChatState = {
    chats: [],
    currentChatId: ''
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessages: (state, action) => {
            const { chatId, message } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].messages.push(message);
            }
        },
        clearAllChats: (state) => {
            state.chats = [];
        },
        changeCurrentChatId: (state, action) => {
            state.currentChatId = action.payload.chatId;
        },
        createNewChat: (state, action) => {
            const { chatId, messages = [], summary = '' } = action.payload;
            state.chats.push({ id: chatId, messages, summary });
        },
        clearChat: (state, action) => {
            const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].messages = [];
            }
        },
        deleteChat: (state, action) => {
            state.chats = state.chats.filter(chat => chat.id !== action.payload.chatId);
        },
        updateChatSummary: (state, action) => {
            const { chatId, messages, summary } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].summary = summary;
                if (messages) {
                    state.chats[chatIndex].messages = messages;
                }
            }
        },
        markMessageAsRead: (state, action) => {
            const { chatId, messageId } = action.payload;
            const chat = state.chats.find(chat => chat.id === chatId);
            if (chat) {
                const message = chat.messages.find(msg => msg.id === messageId); // Corrected here
                if (message) {
                    message.isMessageRead = true;
                }
            }
        },
        addAssistantMessage: (state, action) => {
            const { chatId, message } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].messages.push(message);
            }
        },
        updateAssistantMessage: (state, action) => {
            const { chatId, message, messageId } = action.payload;
            const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
            if (chatIndex !== -1) {
                const messageIndex = state.chats[chatIndex].messages.findIndex(msg => msg.id === messageId);
                if (messageIndex !== -1) {
                    state.chats[chatIndex].messages[messageIndex] = message;
                }
            }
        },

    }
});

export const { 
    updateChatSummary, 
    deleteChat, 
    clearChat, 
    markMessageAsRead,
    clearAllChats, 
    addAssistantMessage,
    createNewChat, 
    addMessages, 
    changeCurrentChatId ,
    updateAssistantMessage
} = chatSlice.actions;

export const selectChats = (state: { chat: { chats: any; }; }) => state.chat.chats;
export const selectCurrentChatId = (state: { chat: { currentChatId: any; }; }) => state.chat.currentChatId;
export default chatSlice.reducer;
