import { BASE_URL } from './config';
import { makeAuthenticatedRequest } from './authUtils';

export interface FeedbackData {
  rating: number;
  category: string;
  comment: string;
}

export const feedbackService = {
  /**
   * Submit student feedback
   */
  submitFeedback: async (data: FeedbackData) => {
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response) {
        throw new Error('Failed to connect to the server.');
      }

      console.log('FeedbackService: Status:', response.status);
      const result = await response.json();
      console.log('FeedbackService: Result:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit feedback.');
      }

      return result;
    } catch (error: any) {
      console.error('FeedbackService: Error submitting feedback:', error);
      throw error;
    }
  },
};
