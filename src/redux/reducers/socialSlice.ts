import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  SocialUser,
  Conversation,
  Message,
  Notification,
  Friend,
  Post,
} from '../../service/social/types';

interface SocialState {
  // User
  currentUser: SocialUser | null;
  isInitialized: boolean;

  // Friends
  friends: Friend[];
  friendRequests: any[];

  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages[]
  typingUsers: Record<string, string[]>; // conversationId -> userUUIDs[]

  // Feed
  feedPosts: Post[];
  feedPage: number;
  hasMorePosts: boolean;

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;

  // UI State
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingFeed: boolean;
  isLoadingNotifications: boolean;
}

const initialState: SocialState = {
  currentUser: null,
  isInitialized: false,
  friends: [],
  friendRequests: [],
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  feedPosts: [],
  feedPage: 1,
  hasMorePosts: true,
  notifications: [],
  unreadNotificationCount: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingFeed: false,
  isLoadingNotifications: false,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    // User actions
    setCurrentUser: (state, action: PayloadAction<SocialUser>) => {
      state.currentUser = action.payload;
      state.isInitialized = true;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<SocialUser>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    clearSocialData: (state) => {
      return initialState;
    },

    // Friends actions
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      state.friends.push(action.payload);
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(
        (f) => f.quizServerUUID !== action.payload
      );
    },
    setFriendRequests: (state, action: PayloadAction<any[]>) => {
      state.friendRequests = action.payload;
    },
    updateFriendStatus: (
      state,
      action: PayloadAction<{ uuid: string; isOnline: boolean; lastSeen?: string }>
    ) => {
      const friend = state.friends.find(
        (f) => f.quizServerUUID === action.payload.uuid
      );
      if (friend) {
        friend.isOnline = action.payload.isOnline;
        if (action.payload.lastSeen) {
          friend.lastSeen = action.payload.lastSeen;
        }
      }
    },

    // Conversations actions
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.isLoadingConversations = false;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.find((c) => c._id === action.payload._id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
        // Move to top
        const [updated] = state.conversations.splice(index, 1);
        state.conversations.unshift(updated);
      }
    },
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    setLoadingConversations: (state, action: PayloadAction<boolean>) => {
      state.isLoadingConversations = action.payload;
    },

    // Messages actions
    setMessages: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
      state.isLoadingMessages = false;
    },
    addMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Avoid duplicates
      const exists = state.messages[conversationId].find(
        (m) => m._id === message._id
      );
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const { conversationId, message } = action.payload;
      if (state.messages[conversationId]) {
        const index = state.messages[conversationId].findIndex(
          (m) => m._id === message._id
        );
        if (index !== -1) {
          state.messages[conversationId][index] = message;
        }
      }
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },

    // Typing indicators
    setTypingUsers: (
      state,
      action: PayloadAction<{ conversationId: string; userUUIDs: string[] }>
    ) => {
      state.typingUsers[action.payload.conversationId] =
        action.payload.userUUIDs;
    },
    addTypingUser: (
      state,
      action: PayloadAction<{ conversationId: string; userUUID: string }>
    ) => {
      const { conversationId, userUUID } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userUUID)) {
        state.typingUsers[conversationId].push(userUUID);
      }
    },
    removeTypingUser: (
      state,
      action: PayloadAction<{ conversationId: string; userUUID: string }>
    ) => {
      const { conversationId, userUUID } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[
          conversationId
        ].filter((id) => id !== userUUID);
      }
    },

    // Feed actions
    setFeedPosts: (state, action: PayloadAction<Post[]>) => {
      state.feedPosts = action.payload;
      state.isLoadingFeed = false;
    },
    addFeedPost: (state, action: PayloadAction<Post>) => {
      state.feedPosts.unshift(action.payload);
    },
    updateFeedPost: (state, action: PayloadAction<Post>) => {
      const index = state.feedPosts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.feedPosts[index] = action.payload;
      }
    },
    removeFeedPost: (state, action: PayloadAction<string>) => {
      state.feedPosts = state.feedPosts.filter((p) => p._id !== action.payload);
    },
    setFeedPage: (state, action: PayloadAction<number>) => {
      state.feedPage = action.payload;
    },
    setHasMorePosts: (state, action: PayloadAction<boolean>) => {
      state.hasMorePosts = action.payload;
    },
    setLoadingFeed: (state, action: PayloadAction<boolean>) => {
      state.isLoadingFeed = action.payload;
    },

    // Notifications actions
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadNotificationCount = action.payload.filter(
        (n) => !n.isRead
      ).length;
      state.isLoadingNotifications = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadNotificationCount += 1;
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadNotificationCount -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadNotificationCount = 0;
    },
    setLoadingNotifications: (state, action: PayloadAction<boolean>) => {
      state.isLoadingNotifications = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  updateCurrentUser,
  clearSocialData,
  setFriends,
  addFriend,
  removeFriend,
  setFriendRequests,
  updateFriendStatus,
  setConversations,
  addConversation,
  updateConversation,
  setActiveConversation,
  setLoadingConversations,
  setMessages,
  addMessage,
  updateMessage,
  setLoadingMessages,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setFeedPosts,
  addFeedPost,
  updateFeedPost,
  removeFeedPost,
  setFeedPage,
  setHasMorePosts,
  setLoadingFeed,
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setLoadingNotifications,
} = socialSlice.actions;

export default socialSlice.reducer;
