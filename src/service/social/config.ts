import { getConfigValue } from '../../config/envConfig';

// Social Microservice Configuration
export const SOCIAL_CONFIG = {
  API_URL: getConfigValue('SOCIAL_API_URL'),
  SOCKET_URL: getConfigValue('SOCIAL_SOCKET_URL'),
  
  // Rate limiting settings
  MAX_MESSAGES_PER_MINUTE: 60,
  MAX_API_REQUESTS_PER_MINUTE: 100,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  
  // File upload settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  
  // Socket events
  SOCKET_EVENTS: {
    // Incoming events
    MESSAGE_NEW: 'message:new',
    CONVERSATION_UPDATE: 'conversation:update',
    MESSAGE_REACTION: 'message:reaction',
    NOTIFICATION_NEW: 'notification:new',
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    
    // Outgoing events
    JOIN_CONVERSATION: 'join:conversation',
    LEAVE_CONVERSATION: 'leave:conversation',
    EMIT_TYPING_START: 'typing:start',
    EMIT_TYPING_STOP: 'typing:stop',
  },
};
