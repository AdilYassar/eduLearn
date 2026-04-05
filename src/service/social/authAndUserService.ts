import { socialApiClient } from './apiClient';
import type {
  ApiResponse,
  SocialUser,
  UpdateUserProfile,
  FriendRequest,
  Friend,
  FriendSuggestion,
} from './types';

export const authService = {
  /**
   * Initialize user in social microservice
   */
  async initialize(): Promise<ApiResponse<SocialUser>> {
    return socialApiClient.post('/auth/initialize');
  },
};

export const userService = {
  /**
   * Get current user's profile
   */
  async getMe(): Promise<ApiResponse<SocialUser>> {
    return socialApiClient.get('/users/me');
  },

  /**
   * Update current user's profile
   */
  async updateMe(data: UpdateUserProfile): Promise<ApiResponse<SocialUser>> {
    return socialApiClient.patch('/users/me', data);
  },

  /**
   * Search for users by name or email
   */
  async searchUsers(query: string): Promise<ApiResponse<SocialUser[]>> {
    return socialApiClient.get('/users/search', { q: query });
  },

  /**
   * Get a specific user's profile by UUID
   */
  async getUserByUuid(uuid: string): Promise<ApiResponse<SocialUser>> {
    return socialApiClient.get(`/users/${uuid}`);
  },

  /**
   * Discover users (paginated list excluding self, friends & pending requests)
   */
  async discoverUsers(page: number = 1, limit: number = 20): Promise<ApiResponse<SocialUser[]>> {
    return socialApiClient.get('/users/discover', { page, limit });
  },
};

export const friendService = {
  /**
   * Send a friend request
   */
  async sendFriendRequest(
    recipientUUID: string,
    message?: string
  ): Promise<ApiResponse<FriendRequest>> {
    return socialApiClient.post('/friends/request', {
      recipientUUID,
      message,
    });
  },

  /**
   * Get all pending friend requests
   */
  async getFriendRequests(): Promise<ApiResponse<FriendRequest[]>> {
    return socialApiClient.get('/friends/requests');
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(
    requesterUUID: string
  ): Promise<ApiResponse<FriendRequest>> {
    return socialApiClient.post('/friends/accept', { requesterUUID });
  },

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(
    requesterUUID: string
  ): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.post('/friends/reject', { requesterUUID });
  },

  /**
   * Get all friends
   */
  async getFriends(): Promise<ApiResponse<Friend[]>> {
    return socialApiClient.get('/friends');
  },

  /**
   * Get friend suggestions
   */
  async getFriendSuggestions(): Promise<ApiResponse<FriendSuggestion[]>> {
    return socialApiClient.get('/friends/suggestions');
  },

  /**
   * Block a user
   */
  async blockUser(uuid: string): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.post(`/friends/block/${uuid}`);
  },

  /**
   * Unblock a user
   */
  async unblockUser(uuid: string): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.delete(`/friends/unblock/${uuid}`);
  },
};
