// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  isOnline: boolean;
  lastSeen: Date;
  isBlocked: boolean;
  isContact: boolean;
}

// 认证相关类型
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

// 聊天相关类型
export interface Chat {
  id: string;
  type: "private" | "group";
  name?: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  type: "text" | "image" | "video" | "audio" | "file" | "location" | "contact";
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  contactInfo?: ContactInfo;
  isEdited: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  originalMessageId?: string;
  replyToMessageId?: string;
  replyToMessage?: Message;
  reactions: MessageReaction[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
}

// 通话相关类型
export interface Call {
  id: string;
  type: "audio" | "video";
  status: "incoming" | "outgoing" | "ongoing" | "ended" | "missed" | "rejected";
  initiatorId: string;
  participants: CallParticipant[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  chatId?: string;
  createdAt: Date;
}

export interface CallParticipant {
  userId: string;
  status: "calling" | "connected" | "disconnected" | "busy" | "rejected";
  joinedAt?: Date;
  leftAt?: Date;
}

// 状态相关类型
export interface Status {
  id: string;
  userId: string;
  type: "text" | "image" | "video";
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  views: StatusView[];
  expiresAt: Date;
  createdAt: Date;
}

export interface StatusView {
  userId: string;
  viewedAt: Date;
}

// 群组相关类型
export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  creatorId: string;
  admins: string[];
  participants: GroupParticipant[];
  settings: GroupSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupParticipant {
  userId: string;
  role: "admin" | "member";
  joinedAt: Date;
  addedBy?: string;
}

export interface GroupSettings {
  onlyAdminsCanSendMessages: boolean;
  onlyAdminsCanEditInfo: boolean;
  onlyAdminsCanAddParticipants: boolean;
}

// 文件上传相关类型
export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  createdAt: Date;
}

// WebSocket事件类型
export interface SocketEvents {
  // 连接事件
  "user:connect": { userId: string };
  "user:disconnect": { userId: string };

  // 消息事件
  "message:send": Message;
  "message:received": { messageId: string; chatId: string };
  "message:read": { messageId: string; chatId: string; userId: string };
  "message:typing": { chatId: string; userId: string; isTyping: boolean };
  "message:reaction": { messageId: string; reaction: MessageReaction };
  "message:delete": { messageId: string; chatId: string };
  "message:edit": Message;

  // 聊天事件
  "chat:create": Chat;
  "chat:update": Chat;
  "chat:delete": { chatId: string };
  "chat:archive": { chatId: string; userId: string };
  "chat:mute": { chatId: string; userId: string; duration: number };

  // 通话事件
  "call:incoming": Call;
  "call:outgoing": Call;
  "call:answer": { callId: string; userId: string };
  "call:reject": { callId: string; userId: string; reason?: string };
  "call:end": { callId: string; userId: string };
  "call:busy": { callId: string; userId: string };
  "call:ice-candidate": { callId: string; candidate: any };
  "call:offer": { callId: string; offer: any };
  "call:webrtc-answer": { callId: string; answer: any };

  // 状态事件
  "status:create": Status;
  "status:view": { statusId: string; userId: string };

  // 用户事件
  "user:status": { userId: string; status: string };
  "user:online": { userId: string };
  "user:offline": { userId: string };
  "user:typing": { userId: string; chatId: string; isTyping: boolean };

  // 群组事件
  "group:create": Group;
  "group:update": Group;
  "group:join": { groupId: string; userId: string };
  "group:leave": { groupId: string; userId: string };
  "group:add-participant": { groupId: string; userId: string; addedBy: string };
  "group:remove-participant": {
    groupId: string;
    userId: string;
    removedBy: string;
  };
  "group:promote-admin": {
    groupId: string;
    userId: string;
    promotedBy: string;
  };
  "group:demote-admin": { groupId: string; userId: string; demotedBy: string };
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 错误类型
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// 中间件类型
export interface AuthenticatedRequest {
  user?: User;
  token?: string;
  [key: string]: any;
}

// 搜索相关类型
export interface SearchFilters {
  query: string;
  type?: "users" | "messages" | "files";
  chatId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// 通知相关类型
export interface Notification {
  id: string;
  userId: string;
  type: "message" | "call" | "group" | "status";
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// 设置相关类型
export interface UserSettings {
  userId: string;
  theme: "light" | "dark" | "auto";
  language: string;
  notifications: {
    messages: boolean;
    calls: boolean;
    groups: boolean;
    status: boolean;
  };
  privacy: {
    lastSeen: "everyone" | "contacts" | "nobody";
    profilePhoto: "everyone" | "contacts" | "nobody";
    status: "everyone" | "contacts" | "nobody";
    readReceipts: boolean;
  };
  chat: {
    enterToSend: boolean;
    mediaAutoDownload: boolean;
    fontSize: "small" | "medium" | "large";
  };
  updatedAt: Date;
}
