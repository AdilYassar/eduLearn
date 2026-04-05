import { socialApiClient } from './apiClient';
import type {
  ApiResponse,
  Conversation,
  Message,
  MessageContent,
  MessageType,
} from './types';

export const chatService = {
  /**
   * Create a new direct conversation
   */
  async createConversation(
    recipientUUID: string
  ): Promise<ApiResponse<Conversation>> {
    return socialApiClient.post('/chat/conversations', { recipientUUID });
  },

  /**
   * Get all conversations
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return socialApiClient.get('/chat/conversations');
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<Message[]>> {
    return socialApiClient.get(
      `/chat/conversations/${conversationId}/messages`,
      { page, limit }
    );
  },

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: MessageContent,
    type: MessageType = 'text'
  ): Promise<ApiResponse<Message>> {
    return socialApiClient.post(
      `/chat/conversations/${conversationId}/messages`,
      { content, type }
    );
  },

  /**
   * Add a reaction to a message
   */
  async addReaction(
    messageId: string,
    emoji: string
  ): Promise<ApiResponse<Message>> {
    return socialApiClient.post(`/chat/messages/${messageId}/react`, {
      emoji,
    });
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(
    conversationId: string
  ): Promise<ApiResponse<{ status: string }>> {
    return socialApiClient.put(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * Mute/unmute a conversation
   */
  async muteConversation(
    conversationId: string,
    muted: boolean
  ): Promise<ApiResponse<{ status: string }>> {
    return socialApiClient.put(`/chat/conversations/${conversationId}/mute`, {
      muted,
    });
  },
};
