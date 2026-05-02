import { BASE_URL } from './config';
import { makeAuthenticatedRequest } from './authUtils';

export interface TicketData {
  subject: string;
  initialMessage: string;
}

export interface SupportMessageData {
  ticketId: string;
  message: string;
}

export const supportService = {
  /**
   * Create a new support ticket
   */
  createTicket: async (data: TicketData) => {
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/support/tickets`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response) throw new Error('Network error');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create ticket');

      return result;
    } catch (error) {
      console.error('SupportService: Error creating ticket:', error);
      throw error;
    }
  },

  /**
   * Get all tickets for the current user
   */
  getTickets: async () => {
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/support/tickets`, {
        method: 'GET',
      });

      if (!response) throw new Error('Network error');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch tickets');

      return result.tickets || [];
    } catch (error) {
      console.error('SupportService: Error fetching tickets:', error);
      throw error;
    }
  },

  /**
   * Get message history for a specific ticket
   */
  getTicketMessages: async (ticketId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/support/tickets/${ticketId}/messages`, {
        method: 'GET',
      });

      if (!response) throw new Error('Network error');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch messages');

      return result.messages || [];
    } catch (error) {
      console.error('SupportService: Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a message to an existing ticket
   */
  sendMessage: async (data: SupportMessageData) => {
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/support/tickets/${data.ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: data.message }),
      });

      if (!response) throw new Error('Network error');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send message');

      return result;
    } catch (error) {
      console.error('SupportService: Error sending message:', error);
      throw error;
    }
  },
};
