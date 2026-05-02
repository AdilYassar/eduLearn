// ==================== USER TYPES ====================
export interface SocialUser {
  quizServerUUID: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
}

export interface UpdateUserProfile {
  bio?: string;
  avatar?: string;
}

// ==================== FRIEND TYPES ====================
export interface FriendRequest {
  _id: string;
  requesterUUID: string;
  recipientUUID: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  acceptedAt?: string;
  requester?: {
    name: string;
    avatar: string | null;
  };
}

export interface Friend {
  quizServerUUID: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
}

export interface FriendSuggestion {
  quizServerUUID: string;
  name: string;
  avatar: string | null;
  mutualFriends: number;
}

// ==================== CHAT TYPES ====================
export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participantUUIDs: string[];
  initiatorUUID?: string;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: LastMessage;
  unreadCounts: UnreadCount[];
  otherUser?: {
    name: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: string;
  };
  createdAt: string;
  mutedBy?: string[];
}

export interface LastMessage {
  messageId: string;
  senderUUID: string;
  preview: string;
  timestamp: string;
  type: MessageType;
}

export interface UnreadCount {
  userUUID: string;
  count: number;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';

export interface MessageContent {
  text?: string;
  media?: MediaItem[];
  url?: string;
  mediaId?: string;
  fileName?: string;
  mimeType?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface MediaItem {
  mediaId: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
  thumbnail?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderUUID: string;
  type: MessageType;
  content: MessageContent;
  reactions: Reaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  editedAt?: string;
  sender?: {
    name: string;
    avatar: string | null;
  };
}

export interface Reaction {
  userUUID: string;
  emoji: string;
  timestamp: string;
}

// ==================== MESSAGE REQUEST TYPES ====================
export interface MessageRequest {
  _id: string;
  senderUUID: string;
  recipientUUID: string;
  message: MessageContent;
  type: MessageType;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender?: {
    name: string;
    avatar: string | null;
  };
}

// ==================== FEED TYPES ====================
export type PostType = 'general' | 'progress' | 'achievement' | 'question';
export type PostVisibility = 'public' | 'friends' | 'private';

export interface PostContent {
  text?: string;
  media?: MediaItem[];
  progress?: ProgressData;
}

export interface ProgressData {
  type: 'course_completed' | 'quiz_passed' | 'streak_milestone' | 'level_up';
  courseId?: string;
  courseName?: string;
  score?: number;
  grade?: string;
  streakDays?: number;
  level?: number;
}

export interface Post {
  _id: string;
  authorUUID: string;
  type: PostType;
  content: PostContent;
  visibility: PostVisibility;
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  hashtags?: string[];
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
  author?: {
    name: string;
    avatar: string | null;
    quizServerUUID: string;
  };
  isLiked?: boolean;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  postId: string;
  authorUUID: string;
  content: {
    text: string;
  };
  stats: {
    likes: number;
  };
  createdAt: string;
  author?: {
    name: string;
    avatar: string | null;
    quizServerUUID: string;
  };
  isLiked?: boolean;
}

// ==================== GROUP TYPES ====================
export interface Group {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  creatorUUID: string;
  adminUUIDs: string[];
  memberUUIDs?: string[];
  settings?: GroupSettings;
  stats: {
    members: number;
    posts: number;
  };
  createdAt: string;
}

export interface GroupSettings {
  maxMembers?: number;
  joinApproval?: boolean;
  allowMemberInvites?: boolean;
  onlyAdminsCanPost?: boolean;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'message_request'
  | 'post_like'
  | 'post_comment'
  | 'comment_like'
  | 'group_invite'
  | 'mention';

export interface Notification {
  _id: string;
  recipientUUID: string;
  type: NotificationType;
  actorUUID: string;
  content: {
    message: string;
    postId?: string;
    commentId?: string;
    groupId?: string;
  };
  isRead: boolean;
  createdAt: string;
  actor?: {
    name: string;
    avatar: string | null;
  };
}

// ==================== MEDIA TYPES ====================
export interface UploadedFile {
  id: string; // Changed from fileId
  url: string;
  mimeType: string;
  downloadUrl?: string; // Added from backend
  thumbnail?: string;
  fileName?: string; // Optional, might not be returned by backend but used in UI
  fileSize?: number; // Optional
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ==================== SOCKET EVENT TYPES ====================
export interface TypingEvent {
  conversationId: string;
  userUUID: string;
  userName?: string;
}

export interface UserStatusEvent {
  userUUID: string;
  isOnline: boolean;
  lastSeen?: string;
}
