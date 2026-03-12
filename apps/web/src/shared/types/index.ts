export type {
  User,
  Contact,
  Message,
  Attachment,
  Location,
  Call,
  CallType,
  CallStatus,
  MessageStatus,
  Group,
  GroupMember,
  GroupSettings,
} from "@whatschat/domain";

export interface AuthState {
  user: import("@whatschat/domain").User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: "text" | "image" | "video";
  timestamp: Date;
  expiresAt: Date;
  viewers: string[];
  isViewed: boolean;
}

export interface SearchResult {
  type: "contact" | "message" | "group";
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: string;
  contactId?: string;
  messageId?: string;
  highlight?: string;
}

export interface Notification {
  id: string;
  type: "message" | "call" | "group" | "system";
  title: string;
  body: string;
  icon?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  data?: unknown;
}

export type Theme = "light" | "dark" | "system";

export interface VoiceRecording {
  id: string;
  url: string;
  duration: number;
  size?: number;
  waveform?: number[];
  timestamp: string;
}

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  url?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
  id?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: "mobile" | "desktop" | "web";
  os: string;
  browser?: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface Backup {
  id: string;
  name: string;
  size: number;
  timestamp: string;
  type: "full" | "messages" | "media";
  status: "completed" | "failed" | "in_progress";
}

export interface Statistics {
  totalMessages: number;
  totalContacts: number;
  totalCalls: number;
  totalGroups: number;
  storageUsed: number;
  messagesThisWeek: number;
  callsThisWeek: number;
  mostActiveContact: string;
  averageResponseTime: number;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  stack?: string;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  soundEnabled: boolean;
  enterToSend: boolean;
  showPreview: boolean;
  autoDownload: boolean;
  language: string;
  fontSize: "small" | "medium" | "large";
  wallpaper: string;
}

export type VideoLayout = "pip" | "split" | "fullscreen";
export type CameraPosition = "front" | "back";

export interface CallState {
  isActive: boolean;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  callType: CallType;
  status: "idle" | "connecting" | "ringing" | "connected" | "ended";
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
  isRecording: boolean;
  isScreenSharing: boolean;
  participants?: CallParticipant[];
  effects?: {
    beautyMode: boolean;
    filter: string | null;
    virtualBackground: string | null;
  };
}

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isHost: boolean;
  joinedAt: number;
  stream?: MediaStream;
}

export interface StoryItem {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  hasUnseen?: boolean;
}

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  timestamp: string;
  imageUrl: string;
  likeCount: string;
  commentCount: string;
  caption: string;
  isLiked?: boolean;
  isSaved?: boolean;
  type?: string;
  videoUrl?: string;
  coverImageUrl?: string;
  coverUrl?: string;
  mediaUrls?: string[];
}

export interface SuggestedUser {
  id: string;
  username: string;
  displayName?: string;
  avatar: string;
  description: string;
}
