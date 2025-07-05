export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  about: string
  lastSeen: Date
  isOnline: boolean
}

export interface Contact {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
  isGroup?: boolean
  members?: GroupMember[]
  memberCount?: number
  description?: string
  admin?: string[]
  pinned?: boolean
  muted?: boolean
}

export interface GroupMember {
  id: string
  name: string
  avatar: string
  role: "admin" | "member"
  phone?: string
}

export interface Message {
  id: string
  text: string
  time: string
  sent: boolean
  delivered?: boolean
  read?: boolean
  sender?: string
  senderName?: string
  type: "text" | "image" | "file" | "audio" | "voice"
  replyTo?: string
  edited?: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: string
  duration?: number
  starred?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export type CallType = "voice" | "video"
export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended"

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
}

export interface VoiceRecording {
  blob: Blob
  url: string
  duration: number
}
