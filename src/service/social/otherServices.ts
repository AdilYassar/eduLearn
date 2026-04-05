import { socialApiClient } from './apiClient';
import type {
  ApiResponse,
  Group,
  GroupSettings,
  Notification,
  MessageRequest,
  MessageContent,
  MessageType,
  UploadedFile,
} from './types';

export const groupService = {
  /**
   * Create a new group
   */
  async createGroup(
    name: string,
    description?: string,
    settings?: GroupSettings
  ): Promise<ApiResponse<Group>> {
    return socialApiClient.post('/groups', {
      name,
      description,
      settings,
    });
  },

  /**
   * Get all groups user is a member of
   */
  async getGroups(): Promise<ApiResponse<Group[]>> {
    return socialApiClient.get('/groups');
  },

  /**
   * Get a specific group
   */
  async getGroup(groupId: string): Promise<ApiResponse<Group>> {
    return socialApiClient.get(`/groups/${groupId}`);
  },

  /**
   * Add a member to a group
   */
  async addMember(
    groupId: string,
    userUUID: string
  ): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.post(`/groups/${groupId}/members`, { userUUID });
  },
};

export const notificationService = {
  /**
   * Get all notifications
   */
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return socialApiClient.get('/notifications');
  },

  /**
   * Mark notification(s) as read
   */
  async markAsRead(
    notificationId?: string
  ): Promise<ApiResponse<{ status: string }>> {
    const url = notificationId
      ? `/notifications/read/${notificationId}`
      : '/notifications/read';
    return socialApiClient.put(url);
  },
};

export const messageRequestService = {
  /**
   * Send a message request to a non-friend
   */
  async sendMessageRequest(
    recipientUUID: string,
    message: MessageContent,
    type: MessageType = 'text'
  ): Promise<ApiResponse<MessageRequest>> {
    return socialApiClient.post('/message-requests', {
      recipientUUID,
      message,
      type,
    });
  },

  /**
   * Get all pending message requests
   */
  async getMessageRequests(): Promise<ApiResponse<MessageRequest[]>> {
    return socialApiClient.get('/message-requests');
  },

  /**
   * Accept a message request
   */
  async acceptMessageRequest(
    requestId: string
  ): Promise<ApiResponse<{ status: string; conversationId: string }>> {
    return socialApiClient.put(`/message-requests/${requestId}/accept`);
  },

  /**
   * Reject a message request
   */
  async rejectMessageRequest(
    requestId: string
  ): Promise<ApiResponse<{ status: string }>> {
    return socialApiClient.put(`/message-requests/${requestId}/reject`);
  },
};

export const mediaService = {
  /**
   * Upload a file
   */
  async uploadFile(file: any): Promise<ApiResponse<UploadedFile>> {
    const formData = new FormData();
    formData.append('file', file);
    return socialApiClient.uploadFile('/media/upload', formData);
  },

  /**
   * Get file metadata
   */
  async getFile(fileId: string): Promise<ApiResponse<UploadedFile>> {
    return socialApiClient.get(`/media/${fileId}`);
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.delete(`/media/${fileId}`);
  },
};
