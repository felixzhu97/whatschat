export interface User {
  id: string
  name: string
  avatar: string
  phoneNumber: string
  email?: string
  status: string
  isOnline: boolean
  lastSeen?: string
  settings?: {
    theme: "light" | "dark" | "system"
    notifications: any
    privacy: any
    chat: any
    calls: any
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
  lastSeen?: string
  phoneNumber?: string
  email?: string
  status?: string
  pinned?: boolean
  muted?: boolean
  blocked?: boolean
}

// 消息附件类型
export interface MessageAttachment {
  id: string
  type: "image" | "video" | "audio" | "file"
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
  duration?: number
}

// 消息类型
export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: "text" | "image" | "video" | "audio" | "file" | "system"
  status: "sending" | "sent" | "delivered" | "read" | "failed"
  attachments?: MessageAttachment[]
  replyTo?: string
  isEdited?: boolean
  editedAt?: string
  isStarred?: boolean
  isForwarded?: boolean
  duration?: number
  reactions?: { [emoji: string]: string[] }
  mentions?: string[]
  isDeleted?: boolean
  deletedAt?: string
}

// 通话记录类型
export interface CallRecord {
  id: string
  contactId: string
  contactName: string
  contactAvatar: string
  type: "voice" | "video"
  direction: "incoming" | "outgoing"
  status: "connecting" | "active" | "completed" | "missed" | "declined" | "failed"
  duration: number
  timestamp: string
  endTime?: string
  isGroup: boolean
  participants?: string[]
  isRead?: boolean
}

// 状态更新类型
export interface StatusUpdate {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: "text" | "image" | "video"
  timestamp: string
  expiresAt: string
  viewers: string[]
  isViewed: boolean
  privacy: "everyone" | "contacts" | "selected"
  selectedContacts?: string[]
}

// 群组类型
export interface Group {
  id: string
  name: string
  description?: string
  avatar: string
  createdBy: string
  createdAt: string
  participants: GroupParticipant[]
  admins: string[]
  settings: {
    onlyAdminsCanMessage: boolean
    onlyAdminsCanEditInfo: boolean
    disappearingMessages: boolean
    disappearingMessagesDuration: number
  }
  inviteLink?: string
  isArchived: boolean
  isMuted: boolean
  lastActivity: string
}

// 群组参与者类型
export interface GroupParticipant {
  id: string
  name: string
  avatar: string
  role: "admin" | "member"
  joinedAt: string
  isOnline: boolean
  lastSeen?: string
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

// 媒体文件类型
export interface MediaFile {
  id: string
  type: "image" | "video" | "audio" | "document"
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
  duration?: number
  dimensions?: { width: number; height: number }
  uploadProgress?: number
  isUploaded: boolean
  createdAt: string
}

// 备份数据类型
export interface BackupData {
  version: string
  timestamp: string
  contacts: Contact[]
  messages: { [contactId: string]: Message[] }
  calls: CallRecord[]
  settings: any
  groups: Group[]
  statusUpdates: StatusUpdate[]
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: number
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: "message" | "typing" | "online" | "call" | "notification"
  data: any
  timestamp: string
  from?: string
  to?: string
}

// 语音录制类型
export interface VoiceRecording {
  url: string
  duration: number
  size?: number
  blob?: Blob
}

// 主题类型
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    accent: string
  }
  isDark: boolean
}

// 表情符号类型
export interface Emoji {
  id: string
  name: string
  native: string
  unified: string
  keywords: string[]
  shortcodes: string
  category: string
  skin?: number
}

// 贴纸类型
export interface Sticker {
  id: string
  name: string
  url: string
  pack: string
  keywords: string[]
  animated: boolean
}

// 位置信息类型
export interface Location {
  latitude: number
  longitude: number
  address?: string
  name?: string
  accuracy?: number
}

// 联系人信息类型
export interface ContactInfo {
  name: string
  phoneNumbers: string[]
  emails: string[]
  avatar?: string
  organization?: string
  birthday?: string
  notes?: string
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
  stack?: string
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

// 排序类型
export interface Sort {
  field: string
  direction: "asc" | "desc"
}

// 过滤器类型
export interface Filter {
  field: string
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "contains"
  value: any
}

// 查询参数类型
export interface QueryParams {
  pagination?: Pagination
  sort?: Sort[]
  filters?: Filter[]
  search?: string
}
