export type CallType = "voice" | "video"
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended"
export type VideoLayout = "pip" | "split" | "fullscreen"
export type CameraPosition = "front" | "back"

export interface CallState {
  isActive: boolean
  callType: CallType
  status: CallStatus
  contactName: string
  contactAvatar: string
  contactId: string
  duration: number
  isMuted: boolean
  isVideoOff: boolean
  isSpeakerOn: boolean
  isGroupCall: boolean
  participants: CallParticipant[]
  maxParticipants: number
  speakingParticipant: string | null
  isMinimized: boolean
  cameraPosition: CameraPosition
  videoLayout: VideoLayout
  isBeautyMode: boolean
  currentFilter: string | null
  isScreenSharing: boolean
  isRecording: boolean
  connectionQuality?: "excellent" | "good" | "poor"
}

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
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: "text" | "image" | "video" | "audio" | "file" | "location" | "contact"
  status: "sending" | "sent" | "delivered" | "read"
  replyTo?: string
  isForwarded?: boolean
  reactions?: MessageReaction[]
  attachments?: MessageAttachment[]
  duration?: number // for audio/video messages
  size?: number // for file messages
  fileName?: string // for file messages
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
}

export interface MessageReaction {
  emoji: string
  userId: string
  userName: string
  timestamp: string
}

export interface MessageAttachment {
  id: string
  type: "image" | "video" | "audio" | "file"
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
}

export interface ChatState {
  contacts: Contact[]
  messages: { [contactId: string]: Message[] }
  activeContactId: string | null
  isTyping: { [contactId: string]: boolean }
  searchQuery: string
  selectedMessages: string[]
  replyingTo: Message | null
  isRecording: boolean
  recordingDuration: number
}

export interface User {
  id: string
  name: string
  avatar: string
  phoneNumber: string
  email?: string
  status: string
  isOnline: boolean
  lastSeen: string
  settings: UserSettings
}

export interface UserSettings {
  theme: "light" | "dark" | "system"
  notifications: {
    messages: boolean
    calls: boolean
    groups: boolean
    sound: boolean
    vibration: boolean
  }
  privacy: {
    lastSeen: "everyone" | "contacts" | "nobody"
    profilePhoto: "everyone" | "contacts" | "nobody"
    status: "everyone" | "contacts" | "nobody"
    readReceipts: boolean
    onlineStatus: boolean
  }
  chat: {
    enterToSend: boolean
    mediaAutoDownload: boolean
    fontSize: "small" | "medium" | "large"
    wallpaper: string | null
  }
  calls: {
    autoAnswer: boolean
    callWaiting: boolean
    showMyVideo: boolean
  }
}

export interface Group {
  id: string
  name: string
  description: string
  avatar: string
  participants: GroupParticipant[]
  admins: string[]
  createdBy: string
  createdAt: string
  settings: GroupSettings
  lastMessage?: Message
  unreadCount: number
}

export interface GroupParticipant {
  id: string
  name: string
  avatar: string
  role: "admin" | "member"
  joinedAt: string
  addedBy: string
  isOnline: boolean
  lastSeen?: string
}

export interface GroupSettings {
  whoCanSendMessages: "everyone" | "admins"
  whoCanEditGroupInfo: "everyone" | "admins"
  whoCanAddMembers: "everyone" | "admins"
  disappearingMessages: number | null // in seconds, null means disabled
  isPublic: boolean
  inviteLink?: string
}

export interface VoiceNote {
  id: string
  duration: number
  waveform: number[]
  url: string
  isPlaying: boolean
  currentTime: number
}

export interface SearchResult {
  type: "contact" | "message" | "group"
  id: string
  title: string
  subtitle: string
  avatar?: string
  timestamp?: string
  messageId?: string
  contactId?: string
  groupId?: string
}

export interface Notification {
  id: string
  type: "message" | "call" | "group" | "system"
  title: string
  body: string
  avatar?: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  data?: any
}

export interface FileUpload {
  id: string
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  url?: string
  error?: string
}

export interface EmojiReaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}
