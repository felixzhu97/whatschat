/**
 * Domain Test Values - WhatsFeed
 * 
 * Standardized test data constants for consistent, maintainable tests.
 * Follows TDD best practices with boundary values and equivalence classes.
 */

import type { MessageReaction, ContactInfo, Attachment, Location } from "../message";
import type { User } from "../user";
import type { GroupParticipant, GroupSettings } from "../group";

// =============================================================================
// BOUNDARY & EDGE VALUES
// =============================================================================

export const BOUNDARY = {
  EMPTY_STRING: "",
  NULL: null,
  UNDEFINED: undefined,
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  MINUS_ZERO: -0,
  INFINITY: Infinity,
  NEGATIVE_INFINITY: -Infinity,
  NaN: NaN,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  EPSILON: Number.EPSILON,
} as const;

export const STRING_VALUES = {
  EMPTY: "",
  SINGLE_CHAR: "a",
  WHITESPACE: "   ",
  TAB: "\t",
  NEWLINE: "\n",
  MAX_LENGTH_1K: "a".repeat(1024),
  MAX_LENGTH_10K: "a".repeat(10240),
  EMAIL_VALID: "user@example.com",
  EMAIL_INVALID: "invalid-email",
  URL_VALID: "https://example.com",
  URL_INVALID: "not-a-url",
  HTML_SCRIPT: '<script>alert("xss")</script>',
  SQL_INJECTION: "'; DROP TABLE users;--",
  UNICODE_EMOJI: "👋🎉",
  UNICODE_CJK: "中文测试",
} as const;

export const NUMBER_VALUES = {
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  MINUS_ZERO: -0,
  INFINITY: Infinity,
  NEGATIVE_INFINITY: -Infinity,
  NaN: NaN,
  FLOAT_PRECISION_EDGE: 0.1 + 0.2,
} as const;

// =============================================================================
// MESSAGE DOMAIN
// =============================================================================

export const MESSAGE_DOMAIN = {
  TYPES: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "LOCATION", "CONTACT", "VOICE"] as const,
  TYPES_LOWERCASE: ["text", "image", "video", "audio", "file", "location", "contact", "voice"] as const,
  STATUSES: ["sending", "sent", "delivered", "read", "failed"] as const,

  VALID: {
    id: "msg_1234567890",
    chatId: "chat_9876543210",
    senderId: "user_1111111111",
    senderName: "John Doe",
    senderAvatar: "https://example.com/avatar.jpg",
    content: "Hello, World!",
    mediaUrl: "https://example.com/media.jpg",
    thumbnailUrl: "https://example.com/thumb.jpg",
    duration: 120,
    size: 1024000,
    latitude: 37.7749,
    longitude: -122.4194,
    replyToMessageId: "msg_original_123",
    originalMessageId: "msg_original_456",
  },

  INVALID: {
    emptyContent: "",
    tooLongContent: "a".repeat(65536),
    invalidLatitude: 91,
    invalidLongitude: 181,
    negativeDuration: -1,
    negativeSize: -1,
  },

  BOUNDARY: {
    minIdLength: 1,
    maxIdLength: 128,
    minContentLength: 1,
    maxContentLength: 65535,
    minDuration: 0,
    maxDuration: 86400,
    minSize: 0,
    maxSize: 209715200,
  },
} as const;

// =============================================================================
// USER DOMAIN
// =============================================================================

export const USER_DOMAIN = {
  ROLES: ["admin", "user", "guest", "moderator"] as const,
  STATUS: ["active", "inactive", "suspended", "pending"] as const,

  VALID: {
    id: "user_1234567890",
    username: "testuser",
    email: "user@example.com",
    phone: "+1234567890",
    avatar: "https://example.com/avatar.jpg",
    status: "Hey there!",
    about: "Just a test user",
  },

  INVALID: {
    emailNoAt: "userexample.com",
    emailNoDomain: "user@",
    emailNoTLD: "user@domain",
    usernameWithSpaces: "user name",
    usernameWithSpecial: "user@name",
    usernameTooLong: "a".repeat(65),
    invalidPhone: "abc",
  },

  EDGE: {
    longestUsername: "a".repeat(64),
    shortestUsername: "a",
    oldestPossibleDate: new Date("1900-01-01"),
    futureDate: new Date("2100-12-31"),
  },
} as const;

// =============================================================================
// CHAT DOMAIN
// =============================================================================

export const CHAT_DOMAIN = {
  TYPES: ["PRIVATE", "GROUP", "private", "group", "individual", "broadcast"] as const,

  VALID: {
    id: "chat_1234567890",
    name: "Test Chat",
    avatar: "https://example.com/chat.jpg",
    description: "A test chat room",
    unreadCount: 5,
  },

  BOUNDARY: {
    minUnreadCount: 0,
    maxUnreadCount: 9999,
    minMemberCount: 0,
    maxMemberCount: 1024,
  },
} as const;

// =============================================================================
// GROUP DOMAIN
// =============================================================================

export const GROUP_DOMAIN = {
  ROLES: ["ADMIN", "MEMBER", "member", "admin", "owner"] as const,

  VALID: {
    id: "group_1234567890",
    name: "Test Group",
    description: "A test group",
    avatar: "https://example.com/group.jpg",
    inviteLink: "https://chat.whatsfeed.com/invite/abc123",
  },

  SETTINGS: {
    default: {
      onlyAdminsCanSendMessages: false,
      onlyAdminsCanEditInfo: false,
      onlyAdminsCanAddParticipants: false,
    } as GroupSettings,
    restricted: {
      onlyAdminsCanSendMessages: true,
      onlyAdminsCanEditInfo: true,
      onlyAdminsCanAddParticipants: true,
    } as GroupSettings,
  },
} as const;

// =============================================================================
// CONTACT DOMAIN
// =============================================================================

export const CONTACT_DOMAIN = {
  VALID: {
    id: "contact_1234567890",
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    lastMessage: "Hello there!",
    phone: "+1234567890",
    email: "john@example.com",
    status: "Hey, I'm using WhatsFeed!",
  },

  BOUNDARY: {
    minNameLength: 1,
    maxNameLength: 255,
    minUnreadCount: 0,
    maxUnreadCount: 999,
    maxMemberCount: 1024,
  },
} as const;

// =============================================================================
// DATETIME DOMAIN
// =============================================================================

export const DATETIME_DOMAIN = {
  NOW: new Date(),
  PAST: new Date("2020-01-01"),
  FUTURE: new Date("2030-12-31"),
  TIMESTAMP: Date.now(),

  EDGE: {
    unixEpoch: new Date(0),
    farFuture: new Date("9999-12-31T23:59:59Z"),
  },
} as const;

// =============================================================================
// ERROR DOMAIN
// =============================================================================

export const ERROR_DOMAIN = {
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  MESSAGES: {
    REQUIRED_FIELD: "This field is required",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PASSWORD: "Password must be at least 8 characters",
    NOT_FOUND: "Resource not found",
    UNAUTHORIZED: "Authentication required",
    FORBIDDEN: "Access denied",
    SERVER_ERROR: "Internal server error",
    NETWORK_ERROR: "Network connection failed",
    TIMEOUT: "Request timed out",
  },

  CODES: {
    AUTH_TOKEN_EXPIRED: "AUTH_001",
    AUTH_INVALID_CREDENTIALS: "AUTH_002",
    VALIDATION_ERROR: "VAL_001",
    RESOURCE_NOT_FOUND: "RES_001",
    DUPLICATE_ENTRY: "RES_002",
    RATE_LIMIT_EXCEEDED: "RATE_001",
  },
} as const;

// =============================================================================
// TEST DATA FACTORIES
// =============================================================================

/**
 * Creates a test message with optional overrides
 */
export const createTestMessage = (overrides: Partial<{
  id: string;
  chatId: string;
  senderId: string;
  type: (typeof MESSAGE_DOMAIN.TYPES)[number];
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  size?: number;
  latitude?: number;
  longitude?: number;
  isEdited: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  reactions: MessageReaction[];
  readBy: string[];
}> = {}): Record<string, unknown> => ({
  id: MESSAGE_DOMAIN.VALID.id,
  chatId: MESSAGE_DOMAIN.VALID.chatId,
  senderId: MESSAGE_DOMAIN.VALID.senderId,
  type: "TEXT",
  content: MESSAGE_DOMAIN.VALID.content,
  ...overrides,
});

/**
 * Creates a test user with optional overrides
 */
export const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: USER_DOMAIN.VALID.id,
  username: USER_DOMAIN.VALID.username,
  email: USER_DOMAIN.VALID.email,
  isOnline: false,
  ...overrides,
});

/**
 * Creates a test contact info
 */
export const createTestContactInfo = (overrides: Partial<ContactInfo> = {}): ContactInfo => ({
  name: "John Doe",
  phone: USER_DOMAIN.VALID.phone!,
  email: USER_DOMAIN.VALID.email,
  avatar: USER_DOMAIN.VALID.avatar,
  ...overrides,
});

/**
 * Creates a test attachment
 */
export const createTestAttachment = (overrides: Partial<Attachment> = {}): Attachment => ({
  id: "att_1234567890",
  type: "image",
  url: "https://example.com/file.jpg",
  name: "image.jpg",
  size: 1024000,
  mimeType: "image/jpeg",
  ...overrides,
});

/**
 * Creates a test location
 */
export const createTestLocation = (overrides: Partial<Location> = {}): Location => ({
  latitude: MESSAGE_DOMAIN.VALID.latitude!,
  longitude: MESSAGE_DOMAIN.VALID.longitude!,
  address: "San Francisco, CA",
  ...overrides,
});

/**
 * Creates a test message reaction
 */
export const createTestReaction = (overrides: Partial<MessageReaction> = {}): MessageReaction => ({
  userId: USER_DOMAIN.VALID.id,
  emoji: "👍",
  createdAt: new Date(),
  ...overrides,
});

/**
 * Creates a test group participant
 */
export const createTestParticipant = (overrides: Partial<GroupParticipant> = {}): GroupParticipant => ({
  userId: USER_DOMAIN.VALID.id,
  role: "MEMBER",
  joinedAt: new Date(),
  ...overrides,
});

// =============================================================================
// ARRAY FACTORIES
// =============================================================================

/**
 * Creates multiple test messages
 */
export const createTestMessages = (count: number, baseOverrides: Parameters<typeof createTestMessage>[0] = {}): ReturnType<typeof createTestMessage>[] =>
  Array.from({ length: count }, (_, i) =>
    createTestMessage({
      id: `msg_${i}`,
      chatId: baseOverrides.chatId ?? MESSAGE_DOMAIN.VALID.chatId,
      senderId: baseOverrides.senderId ?? MESSAGE_DOMAIN.VALID.senderId,
      content: `Test message ${i}`,
      ...baseOverrides,
    })
  );

/**
 * Creates multiple test users
 */
export const createTestUsers = (count: number, baseOverrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, (_, i) =>
    createTestUser({
      id: `user_${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
      ...baseOverrides,
    })
  );

/**
 * Creates multiple test participants
 */
export const createTestParticipants = (count: number, baseOverrides: Partial<GroupParticipant> = {}): GroupParticipant[] =>
  Array.from({ length: count }, (_, i) =>
    createTestParticipant({
      userId: `user_${i}`,
      role: i === 0 ? "ADMIN" : "MEMBER",
      ...baseOverrides,
    })
  );

/**
 * Creates multiple test reactions
 */
export const createTestReactions = (count: number, baseOverrides: Partial<MessageReaction> = {}): MessageReaction[] =>
  Array.from({ length: count }, (_, i) =>
    createTestReaction({
      userId: `user_${i}`,
      emoji: i % 2 === 0 ? "👍" : "❤️",
      ...baseOverrides,
    })
  );

// =============================================================================
// EQUIVALENCE CLASSES FOR PARAMETERIZED TESTS
// =============================================================================

export const EMAIL_EQUIVALENCE_CLASSES = {
  valid: [
    "user@example.com",
    "user.name@example.com",
    "user+tag@example.co.uk",
    "user@subdomain.example.com",
  ],
  invalid: [
    "",
    "no-domain",
    "@no-local.com",
    "spaces in@email.com",
    "very-long-email-address-that-exceeds-normal-length-limits@very-long-domain-name.example.com",
  ],
} as const;

export const MESSAGE_TYPE_EQUIVALENCE_CLASSES = {
  all: MESSAGE_DOMAIN.TYPES,
  media: ["IMAGE", "VIDEO", "AUDIO", "FILE"] as const,
  location: ["LOCATION"] as const,
  contact: ["CONTACT"] as const,
  text: ["TEXT"] as const,
} as const;

export const CHAT_TYPE_EQUIVALENCE_CLASSES = {
  all: CHAT_DOMAIN.TYPES,
  private: ["PRIVATE", "private", "individual"] as const,
  group: ["GROUP", "group"] as const,
  broadcast: ["broadcast"] as const,
} as const;

export const PARTICIPANT_ROLE_EQUIVALENCE_CLASSES = {
  all: GROUP_DOMAIN.ROLES,
  admin: ["ADMIN", "admin", "owner"] as const,
  member: ["MEMBER", "member"] as const,
} as const;
