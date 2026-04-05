import { socialApiClient } from './apiClient';
import type {
  ApiResponse,
  Post,
  Comment,
  PostContent,
  PostVisibility,
  PostType,
} from './types';

export const feedService = {
  /**
   * Create a new post
   */
  async createPost(
    content: PostContent,
    visibility: PostVisibility = 'public',
    type: PostType = 'general'
  ): Promise<ApiResponse<Post>> {
    return socialApiClient.post('/feed', {
      content,
      visibility,
      type,
    });
  },

  /**
   * Get user's feed
   */
  async getFeed(page: number = 1): Promise<ApiResponse<Post[]>> {
    return socialApiClient.get('/feed', { page });
  },

  /**
   * Get a specific post
   */
  async getPost(postId: string): Promise<ApiResponse<Post>> {
    return socialApiClient.get(`/feed/${postId}`);
  },

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    content: PostContent
  ): Promise<ApiResponse<Post>> {
    return socialApiClient.put(`/feed/${postId}`, { content });
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.delete(`/feed/${postId}`);
  },

  /**
   * Like/unlike a post
   */
  async toggleLike(postId: string): Promise<ApiResponse<{ isLiked: boolean }>> {
    return socialApiClient.post(`/feed/${postId}/like`);
  },

  /**
   * Get comments on a post
   */
  async getComments(
    postId: string,
    page: number = 1
  ): Promise<ApiResponse<Comment[]>> {
    return socialApiClient.get(`/feed/${postId}/comments`, { page });
  },

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    return socialApiClient.post(`/feed/${postId}/comments`, { content });
  },

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return socialApiClient.delete(`/feed/comments/${commentId}`);
  },

  /**
   * Like/unlike a comment
   */
  async toggleCommentLike(
    commentId: string
  ): Promise<ApiResponse<{ isLiked: boolean }>> {
    return socialApiClient.post(`/feed/comments/${commentId}/like`);
  },
};
