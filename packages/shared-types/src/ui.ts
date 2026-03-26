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
  theme: Theme;
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
