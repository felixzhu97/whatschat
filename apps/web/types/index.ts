export interface User {
  id: string
  name: string
  avatar: string
  phoneNumber: string
  email: string
  status: string
  isOnline: boolean
  lastSeen: string
  settings: {
    theme: "light" | "dark" | "system"
    notifications: {
      enabled: boolean
      sound: boolean
      vibration: boolean
      preview: boolean
    }
    privacy: {
      lastSeen: "everyone" | "contacts" | "nobody"
      profilePhoto: "everyone" | "contacts" | "nobody"
      about: "everyone" | "contacts" | "nobody"
      status: "everyone" | "contacts" | "nobody"
    }
    chat: {
      enterToSend: boolean
      mediaAutoDownload: boolean
      fontSize: "small" | "medium" | "large"
    }
    calls: {
      lowDataUsage: boolean
      callWaiting: boolean
    }
  }
}

// 联系人类型
export interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  isGroup: boolean
  phone?: string
  email?: string
  members?: string[]
  pinned?: boolean
  muted?: boolean
  blocked?: boolean
}

// 消息类型
export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: "text" | "image" | "video" | "audio" | "file" | "location" | "contact"
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  replyTo?: string
  isEdited?: boolean
  isStarred?: boolean
  isForwarded?: boolean
  attachments?: Attachment[]
  duration?: number
  fileName?: string
  fileSize?: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

// 附件类型
export interface Attachment {
  id: string
  type: "image" | "video" | "audio" | "file"
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
}

// 反应类型
export interface Reaction {
  id: string
  emoji: string
  userId: string
  userName: string
  timestamp: string
}

// 通话类型
export interface Call {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "voice" | "video"
  status: "incoming" | "outgoing" | "missed"
  timestamp: Date
  duration: number
  isGroup?: boolean
}

// 状态更新类型
export interface Status {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: "text" | "image" | "video"
  timestamp: Date
  expiresAt: Date
  viewers: string[]
  isViewed: boolean
}

// 群组类型
export interface Group {
  id: string
  name: string
  description?: string
  avatar: string
  createdBy: string
  createdAt: string
  members: GroupMember[]
  admins: string[]
  settings: GroupSettings
  inviteLink?: string
}

// 群组成员类型
export interface GroupMember {
  userId: string
  userName: string
  userAvatar: string
  role: "member" | "admin" | "owner"
  joinedAt: string
  lastSeen?: string
}

// 群组设置类型
export interface GroupSettings {
  whoCanSendMessages: "everyone" | "admins"
  whoCanEditGroupInfo: "everyone" | "admins"
  whoCanAddMembers: "everyone" | "admins"
  disappearingMessages: boolean
  disappearingMessagesDuration: number
}

// 搜索结果类型
export interface SearchResult {
  type: "contact" | "message" | "group"
  id: string
  title: string
  subtitle?: string
  avatar?: string
  timestamp?: string
  contactId?: string
  messageId?: string
  highlight?: string
}

// 通知类型
export interface Notification {
  id: string
  type: "message" | "call" | "group" | "system"
  title: string
  body: string
  icon?: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  data?: any
}

// 主题类型
export type Theme = "light" | "dark" | "system"

// 语音录制类型
export interface VoiceRecording {
  id: string
  url: string
  duration: number
  size?: number
  waveform?: number[]
  timestamp: string
}

// 文件上传类型
export interface FileUpload {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "failed"
  url?: string
  error?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
  id?: string
}

// 设备信息类型
export interface DeviceInfo {
  id: string
  name: string
  type: "mobile" | "desktop" | "web"
  os: string
  browser?: string
  lastActive: string
  isCurrentDevice: boolean
}

// 备份类型
export interface Backup {
  id: string
  name: string
  size: number
  timestamp: string
  type: "full" | "messages" | "media"
  status: "completed" | "failed" | "in_progress"
}

// 统计类型
export interface Statistics {
  totalMessages: number
  totalContacts: number
  totalCalls: number
  totalGroups: number
  storageUsed: number
  messagesThisWeek: number
  callsThisWeek: number
  mostActiveContact: string
  averageResponseTime: number
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  stack?: string
}

// 设置类型
export interface Settings {
  theme: "light" | "dark" | "system"
  notifications: boolean
  soundEnabled: boolean
  enterToSend: boolean
  showPreview: boolean
  autoDownload: boolean
  language: string
  fontSize: "small" | "medium" | "large"
  wallpaper: string
}

// 通话类型
export type CallType = "voice" | "video"
// 通话状态
export type CallStatus = "incoming" | "outgoing" | "missed"
// 视频布局
export type VideoLayout = "pip" | "split" | "fullscreen"
// 摄像头位置
export type CameraPosition = "front" | "back"

// 通话状态类型
export interface CallState {
  isActive: boolean
  contactId: string
  contactName: string
  contactAvatar: string
  callType: CallType
  status: "connecting" | "ringing" | "connected" | "ended"
  duration: number
  isMuted: boolean
  isVideoOff: boolean
  isSpeakerOn: boolean
  isMinimized: boolean
  isRecording: boolean
  isScreenSharing: boolean
  participants?: string[]
  effects?: {
    beautyMode: boolean
    filter: string | null
    virtualBackground: string | null
  }
}

// 通话参与者类型
export interface CallParticipant {
  id: string
  name: string
  avatar: string
  isMuted: boolean
  isVideoOff: boolean
  isSpeaking: boolean
  isHost: boolean
  joinedAt: number
  stream?: MediaStream
}

// 导出所有类型
export type {
  User,
  Contact,
  Message,
  Attachment,
  Reaction,
  Call,
  Status,
  Group,
  GroupMember,
  GroupSettings,
  SearchResult,
  Notification,
  Theme,
  VoiceRecording,
  FileUpload,
  ApiResponse,
  Pagination,
  WebSocketMessage,
  DeviceInfo,
  Backup,
  Statistics,
  AppError,
  Settings,
  CallType,
  CallStatus,
  VideoLayout,
  CameraPosition,
  CallState,
  CallParticipant,
}
