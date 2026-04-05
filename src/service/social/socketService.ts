import { io, Socket } from 'socket.io-client';
import { SOCIAL_CONFIG } from './config';
import type {
  Message,
  Conversation,
  Notification,
  TypingEvent,
  UserStatusEvent,
} from './types';

type SocketEventCallback = (data: any) => void;

class SocialSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private eventListeners: Map<string, Set<SocketEventCallback>> = new Map();

  /**
   * Connect to the socket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.token = token;

    this.socket = io(String(SOCIAL_CONFIG.SOCKET_URL), {
      auth: {
        token: this.token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventListeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup default event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Setup listeners for all social events
    this.socket.on(SOCIAL_CONFIG.SOCKET_EVENTS.MESSAGE_NEW, (data: Message) => {
      this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.MESSAGE_NEW, data);
    });

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.CONVERSATION_UPDATE,
      (data: Conversation) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.CONVERSATION_UPDATE, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.MESSAGE_REACTION,
      (data: any) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.MESSAGE_REACTION, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.NOTIFICATION_NEW,
      (data: Notification) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.NOTIFICATION_NEW, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.USER_ONLINE,
      (data: UserStatusEvent) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.USER_ONLINE, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.USER_OFFLINE,
      (data: UserStatusEvent) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.USER_OFFLINE, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.TYPING_START,
      (data: TypingEvent) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.TYPING_START, data);
      }
    );

    this.socket.on(
      SOCIAL_CONFIG.SOCKET_EVENTS.TYPING_STOP,
      (data: TypingEvent) => {
        this.emit(SOCIAL_CONFIG.SOCKET_EVENTS.TYPING_STOP, data);
      }
    );
  }

  /**
   * Emit event to all registered listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Subscribe to a socket event
   */
  on(event: string, callback: SocketEventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCIAL_CONFIG.SOCKET_EVENTS.JOIN_CONVERSATION, {
        conversationId,
      });
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCIAL_CONFIG.SOCKET_EVENTS.LEAVE_CONVERSATION, {
        conversationId,
      });
    }
  }

  /**
   * Emit typing start event
   */
  startTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCIAL_CONFIG.SOCKET_EVENTS.EMIT_TYPING_START, {
        conversationId,
      });
    }
  }

  /**
   * Emit typing stop event
   */
  stopTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit(SOCIAL_CONFIG.SOCKET_EVENTS.EMIT_TYPING_STOP, {
        conversationId,
      });
    }
  }
}

export const socialSocketService = new SocialSocketService();
