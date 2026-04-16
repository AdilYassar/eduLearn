import { createSlice } from '@reduxjs/toolkit';

interface Message {
    id: string;
    content?: string;
    text?: string;
    time?: string;
    role?: string;
    isMessageRead: boolean;
}

interface Chat {
    id: string;
    messages: Message[];
    summary: string;
    createdAt?: string; // ISO date string
}

interface ChatState {
    chats: Chat[];
    currentChatId: string;
    selectedDate: string | null; // ISO date string
}

const initialState: ChatState = {
    chats: [],
    currentChatId: '',
    selectedDate: null,
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
            state.currentChatId = '';
        },
        changeCurrentChatId: (state, action) => {
            state.currentChatId = action.payload.chatId;
        },
        createNewChat: (state, action) => {
            const { chatId, messages = [], summary = '' } = action.payload;
            state.chats.push({ 
                id: chatId, 
                messages, 
                summary,
                createdAt: new Date().toISOString(),
            });
        },
        clearChat: (state, action) => {
            const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chatId);
            if (chatIndex !== -1) {
                state.chats[chatIndex].messages = [];
            }
        },
        deleteChat: (state, action) => {
            state.chats = state.chats.filter(chat => chat.id !== action.payload.chatId);
            if (state.currentChatId === action.payload.chatId) {
                state.currentChatId = state.chats.length > 0 ? state.chats[0].id : '';
            }
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
                const message = chat.messages.find(msg => msg.id === messageId);
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
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload; // ISO date string
        },
        clearSelectedDate: (state) => {
            state.selectedDate = null;
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
    changeCurrentChatId,
    updateAssistantMessage,
    setSelectedDate,
    clearSelectedDate,
} = chatSlice.actions;

export const selectChats = (state: { chat: { chats: any; }; }) => state.chat.chats;
export const selectCurrentChatId = (state: { chat: { currentChatId: any; }; }) => state.chat.currentChatId;
export const selectSelectedDate = (state: { chat: { selectedDate: any; }; }) => state.chat.selectedDate;

// Selector to get chats filtered by selected date
export const selectChatsByDate = (state: { chat: ChatState }) => {
    if (!state.chat.selectedDate) return state.chat.chats;
    
    const selectedDateStr = state.chat.selectedDate.split('T')[0]; // Get date part only
    return state.chat.chats.filter(chat => {
        // If chat doesn't have createdAt, include it (old chats)
        if (!chat.createdAt) return true;
        const chatDateStr = new Date(chat.createdAt).toISOString().split('T')[0];
        return chatDateStr === selectedDateStr;
    });
};

export default chatSlice.reducer;
