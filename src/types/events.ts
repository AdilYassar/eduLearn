/**
 * Event-Driven Architecture Type Definitions
 * Shared between Backend (Node.js) and Frontend (React Native)
 * 
 * These types define the event contracts for Socket.io communication.
 * Both teams must maintain consistency with these definitions.
 */

// ============================================================================
// BASE EVENT TYPES
// ============================================================================

/**
 * All events must conform to this base structure
 */
export interface BaseEvent<T> {
  id: string; // Unique event ID: evt_${type}_${timestamp}
  type: EventType;
  timestamp: ISO8601String;
  version: string; // Format: "1.0", "1.1", "2.0"
  correlationId?: string; // For tracking related events
  idempotencyKey?: string; // For deduplication
  data: T;
}

export type ISO8601String = string; // e.g., "2026-04-02T10:30:00Z"

// ============================================================================
// EVENT TYPE UNION
// ============================================================================

export enum EventType {
  // Message Events
  MESSAGE_CREATED = 'message:created',
  MESSAGE_EDITED = 'message:edited',
  MESSAGE_DELETED = 'message:deleted',
  MESSAGE_REACTION = 'message:reaction',

  // Typing Events
  TYPING_INDICATOR = 'typing:indicator',

  // Friend/Relationship Events
  FRIEND_REQUEST_RECEIVED = 'friend:request:received',
  FRIEND_REQUEST_ACCEPTED = 'friend:request:accepted',
  FRIEND_REQUEST_REJECTED = 'friend:request:rejected',
  FRIEND_REMOVED = 'friend:removed',

  // Friend Status Events
  FRIEND_STATUS_CHANGED = 'friend:status:changed',

  // Conversation Events
  CONVERSATION_CREATED = 'conversation:created',
  CONVERSATION_UPDATED = 'conversation:updated',
  CONVERSATION_DELETED = 'conversation:deleted',

  // Notification Events
  NOTIFICATION_RECEIVED = 'notification:received',
}

/**
 * Union type of all possible events
 */
export type EventPayload = 
  | MessageCreatedEvent
  | MessageEditedEvent
  | MessageDeletedEvent
  | MessageReactionEvent
  | TypingIndicatorEvent
  | FriendRequestReceivedEvent
  | FriendRequestAcceptedEvent
  | FriendRequestRejectedEvent
  | FriendRemovedEvent
  | FriendStatusChangedEvent
  | ConversationCreatedEvent
  | ConversationUpdatedEvent
  | ConversationDeletedEvent
  | NotificationReceivedEvent;

// ============================================================================
// MESSAGE EVENTS
// ============================================================================

export interface MessageCreatedEventData {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  mediaUrl?: string;
  mediaMetadata?: {
    size?: number;
    duration?: number;
    width?: number;
    height?: number;
  };
  createdAt: ISO8601String;
}

export type MessageCreatedEvent = BaseEvent<MessageCreatedEventData>;

---

export interface MessageEditedEventData {
  conversationId: string;
  messageId: string;
  text: string;
  editedAt: ISO8601String;
}

export type MessageEditedEvent = BaseEvent<MessageEditedEventData>;

---

export interface MessageDeletedEventData {
  conversationId: string;
  messageId: string;
  deletedAt: ISO8601String;
}

export type MessageDeletedEvent = BaseEvent<MessageDeletedEventData>;

---

export interface MessageReactionEventData {
  conversationId: string;
  messageId: string;
  userId: string;
  userName: string;
  reaction: string; // Emoji: "👍", "❤️", "😂", etc.
  action: 'added' | 'removed';
}

export type MessageReactionEvent = BaseEvent<MessageReactionEventData>;

// ============================================================================
// TYPING EVENTS
// ============================================================================

export interface TypingIndicatorEventData {
  conversationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isTyping: boolean;
}

export type TypingIndicatorEvent = BaseEvent<TypingIndicatorEventData>;

// ============================================================================
// FRIEND/RELATIONSHIP EVENTS
// ============================================================================

export interface FriendRequestReceivedEventData {
  requestId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  bio?: string;
  receivedAt: ISO8601String;
}

export type FriendRequestReceivedEvent = BaseEvent<FriendRequestReceivedEventData>;

---

export interface FriendRequestAcceptedEventData {
  requestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  acceptedAt: ISO8601String;
}

export type FriendRequestAcceptedEvent = BaseEvent<FriendRequestAcceptedEventData>;

---

export interface FriendRequestRejectedEventData {
  requestId: string;
  userId: string;
  rejectedAt: ISO8601String;
}

export type FriendRequestRejectedEvent = BaseEvent<FriendRequestRejectedEventData>;

---

export interface FriendRemovedEventData {
  userId: string;
  removedAt: ISO8601String;
}

export type FriendRemovedEvent = BaseEvent<FriendRemovedEventData>;

---

export interface FriendStatusChangedEventData {
  userId: string;
  status: 'online' | 'offline' | 'idle';
  lastSeen: ISO8601String;
}

export type FriendStatusChangedEvent = BaseEvent<FriendStatusChangedEventData>;

// ============================================================================
// CONVERSATION EVENTS
// ============================================================================

export type ConversationType = 'dm' | 'group';

export interface ConversationCreatedEventData {
  conversationId: string;
  name: string;
  type: ConversationType;
  participants: string[]; // User IDs
  createdAt: ISO8601String;
}

export type ConversationCreatedEvent = BaseEvent<ConversationCreatedEventData>;

---

export interface ConversationUpdatedEventData {
  conversationId: string;
  name?: string;
  participants?: string[];
  updatedAt: ISO8601String;
}

export type ConversationUpdatedEvent = BaseEvent<ConversationUpdatedEventData>;

---

export interface ConversationDeletedEventData {
  conversationId: string;
  deletedAt: ISO8601String;
}

export type ConversationDeletedEvent = BaseEvent<ConversationDeletedEventData>;

// ============================================================================
// NOTIFICATION EVENTS
// ============================================================================

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'message'
  | 'system'
  | 'achievement';

export interface NotificationReceivedEventData {
  notificationId: string;
  type: NotificationType;
  title: string; // e.g., "New Friend Request"
  body: string; // e.g., "John sent you a friend request"
  data?: {
    action?: string; // e.g., "open_friend_requests"
    userId?: string; // Relevant user ID
    conversationId?: string; // Relevant conversation ID
  };
  deepLink?: string; // e.g., "edulearn://friends/requests" or "edulearn://chat/conv_12345"
  icon?: string; // URL to notification icon
  badge?: string; // App icon badge number
  receivedAt: ISO8601String;
}

export type NotificationReceivedEvent = BaseEvent<NotificationReceivedEventData>;

// ============================================================================
// SOCKET.IO EVENT HANDLERS
// ============================================================================

/**
 * Define all socket event listeners on frontend
 * 
 * Usage in React Native:
 * ```tsx
 * const handleMessageCreated = (event: MessageCreatedEvent) => {
 *   dispatch(addMessage(event.data));
 * };
 * 
 * socket.on(EventType.MESSAGE_CREATED, handleMessageCreated);
 * ```
 */
export interface SocketEventHandlers {
  [EventType.MESSAGE_CREATED]: (event: MessageCreatedEvent) => void;
  [EventType.MESSAGE_EDITED]: (event: MessageEditedEvent) => void;
  [EventType.MESSAGE_DELETED]: (event: MessageDeletedEvent) => void;
  [EventType.MESSAGE_REACTION]: (event: MessageReactionEvent) => void;
  [EventType.TYPING_INDICATOR]: (event: TypingIndicatorEvent) => void;
  [EventType.FRIEND_REQUEST_RECEIVED]: (event: FriendRequestReceivedEvent) => void;
  [EventType.FRIEND_REQUEST_ACCEPTED]: (event: FriendRequestAcceptedEvent) => void;
  [EventType.FRIEND_REQUEST_REJECTED]: (event: FriendRequestRejectedEvent) => void;
  [EventType.FRIEND_REMOVED]: (event: FriendRemovedEvent) => void;
  [EventType.FRIEND_STATUS_CHANGED]: (event: FriendStatusChangedEvent) => void;
  [EventType.CONVERSATION_CREATED]: (event: ConversationCreatedEvent) => void;
  [EventType.CONVERSATION_UPDATED]: (event: ConversationUpdatedEvent) => void;
  [EventType.CONVERSATION_DELETED]: (event: ConversationDeletedEvent) => void;
  [EventType.NOTIFICATION_RECEIVED]: (event: NotificationReceivedEvent) => void;
}

// ============================================================================
// EVENT REPLAY (Reconnection)
// ============================================================================

export interface EventReplayRequest {
  lastEventId?: string;
  limit?: number; // Default: 50, Max: 100
}

export interface EventReplayResponse {
  events: EventPayload[];
  lastEventId: string;
  hasMore: boolean;
  retrievedCount: number;
}

// ============================================================================
// SOCKET CONNECTION CONSTANTS
// ============================================================================

export const SOCKET_CONSTANTS = {
  // Rooms
  ROOM_USER: (userId: string) => `user:${userId}`,
  ROOM_CONVERSATION: (conversationId: string) => `conversation:${conversationId}`,

  // Event emission rooms
  EMIT_TO_CONVERSATION: (conversationId: string) => `conversation:${conversationId}`,
  EMIT_TO_USER: (userId: string) => `user:${userId}`,
  EMIT_TO_FRIENDS: (userId: string) => `user:${userId}:friends`,

  // Reconnection
  REPLAY_ENDPOINT: '/api/events/replay',
  REPLAY_TIMEOUT_MS: 5000,

  // Connection
  CONNECT_TIMEOUT_MS: 10000,
  RECONNECT_BACKOFF_MS: [1000, 2000, 4000, 8000, 16000],

  // Event TTL (how long to store in DB)
  EVENT_TTL_DAYS: 7,
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum SocketErrorType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  EVENT_DELIVERY_FAILED = 'EVENT_DELIVERY_FAILED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  TIMEOUT = 'TIMEOUT',
  INVALID_EVENT = 'INVALID_EVENT',
}

export interface SocketError extends Error {
  type: SocketErrorType;
  originalError?: Error;
  shouldReconnect?: boolean;
}

// ============================================================================
// FRONTEND STATE TYPES (for Redux)
// ============================================================================

export interface PendingEvent {
  eventId: string;
  acknowledged: boolean;
  retries: number;
  lastRetryAt?: ISO8601String;
}

export interface SocketConnectionState {
  connected: boolean;
  connecting: boolean;
  lastConnectedAt?: ISO8601String;
  lastDisconnectedAt?: ISO8601String;
  pendingEvents: PendingEvent[];
  replayInProgress: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Validation helper for event type guards
 */
export function isEventType(event: any, type: EventType): boolean {
  return event && event.type === type && event.data;
}

export function validateEventStructure(event: any): boolean {
  return (
    event &&
    typeof event.id === 'string' &&
    typeof event.type === 'string' &&
    typeof event.timestamp === 'string' &&
    typeof event.version === 'string' &&
    event.data !== undefined
  );
}

// ============================================================================
// MONITORING & OBSERVABILITY
// ============================================================================

export interface EventMetrics {
  eventType: EventType;
  emittedAt: ISO8601String;
  deliveredAt?: ISO8601String;
  latencyMs?: number;
  retryCount: number;
  status: 'pending' | 'delivered' | 'failed';
  errorMessage?: string;
}

export interface SocketMetrics {
  totalEventsEmitted: number;
  totalEventsDelivered: number;
  totalEventsFailed: number;
  averageLatencyMs: number;
  failureRate: number; // 0-100%
  connectionUptime: number; // ms
  disconnections: number;
}
