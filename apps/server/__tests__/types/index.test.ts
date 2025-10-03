import { describe, it, expect } from "vitest";
import type {
  User,
  UserProfile,
  AuthTokens,
  JwtPayload,
  Chat,
  Message,
  MessageReaction,
  ContactInfo,
  Call,
  CallParticipant,
  Status,
  StatusView,
  Group,
  GroupParticipant,
  GroupSettings,
  FileUpload,
  SocketEvents,
  ApiResponse,
  PaginatedResponse,
  AppError,
  AuthenticatedRequest,
  SearchFilters,
  Notification,
  UserSettings,
} from "../../src/types";

describe("Types", () => {
  describe("User", () => {
    it("应该正确定义User接口", () => {
      const user: User = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "online",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe("user-123");
      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.phone).toBe("+1234567890");
      expect(user.avatar).toBe("https://example.com/avatar.jpg");
      expect(user.status).toBe("online");
      expect(user.isOnline).toBe(true);
      expect(user.lastSeen).toBeInstanceOf(Date);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("应该支持可选的phone和avatar字段", () => {
      const user: User = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        isOnline: false,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.phone).toBeUndefined();
      expect(user.avatar).toBeUndefined();
    });
  });

  describe("UserProfile", () => {
    it("应该正确定义UserProfile接口", () => {
      const profile: UserProfile = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "online",
        isOnline: true,
        lastSeen: new Date(),
        isBlocked: false,
        isContact: true,
      };

      expect(profile.isBlocked).toBe(false);
      expect(profile.isContact).toBe(true);
    });
  });

  describe("AuthTokens", () => {
    it("应该正确定义AuthTokens接口", () => {
      const tokens: AuthTokens = {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        expiresIn: 3600,
      };

      expect(tokens.accessToken).toBe("access-token-123");
      expect(tokens.refreshToken).toBe("refresh-token-456");
      expect(tokens.expiresIn).toBe(3600);
    });
  });

  describe("JwtPayload", () => {
    it("应该正确定义JwtPayload接口", () => {
      const payload: JwtPayload = {
        userId: "user-123",
        email: "test@example.com",
        username: "testuser",
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };

      expect(payload.userId).toBe("user-123");
      expect(payload.email).toBe("test@example.com");
      expect(payload.username).toBe("testuser");
      expect(payload.iat).toBe(1234567890);
      expect(payload.exp).toBe(1234567890 + 3600);
    });
  });

  describe("Chat", () => {
    it("应该正确定义Chat接口", () => {
      const chat: Chat = {
        id: "chat-123",
        type: "private",
        name: "Private Chat",
        avatar: "https://example.com/chat-avatar.jpg",
        participants: [],
        lastMessage: undefined,
        unreadCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chat.type).toBe("private");
      expect(chat.unreadCount).toBe(5);
    });

    it("应该支持群组聊天", () => {
      const groupChat: Chat = {
        id: "group-123",
        type: "group",
        name: "Group Chat",
        participants: [],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(groupChat.type).toBe("group");
    });
  });

  describe("Message", () => {
    it("应该正确定义Message接口", () => {
      const message: Message = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        sender: {} as User,
        type: "text",
        content: "Hello World!",
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        reactions: [],
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(message.type).toBe("text");
      expect(message.content).toBe("Hello World!");
      expect(message.isEdited).toBe(false);
    });

    it("应该支持不同类型的消息", () => {
      const imageMessage: Message = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        sender: {} as User,
        type: "image",
        content: "Check out this image!",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        reactions: [],
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(imageMessage.type).toBe("image");
      expect(imageMessage.mediaUrl).toBe("https://example.com/image.jpg");
    });

    it("应该支持视频消息", () => {
      const videoMessage: Message = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        sender: {} as User,
        type: "video",
        content: "Amazing video!",
        mediaUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/video-thumb.jpg",
        duration: 60,
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        reactions: [],
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(videoMessage.type).toBe("video");
      expect(videoMessage.duration).toBe(60);
    });

    it("应该支持位置消息", () => {
      const locationMessage: Message = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        sender: {} as User,
        type: "location",
        content: "My location",
        latitude: 40.7128,
        longitude: -74.006,
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        reactions: [],
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(locationMessage.type).toBe("location");
      expect(locationMessage.latitude).toBe(40.7128);
      expect(locationMessage.longitude).toBe(-74.006);
    });
  });

  describe("MessageReaction", () => {
    it("应该正确定义MessageReaction接口", () => {
      const reaction: MessageReaction = {
        userId: "user-123",
        emoji: "👍",
        createdAt: new Date(),
      };

      expect(reaction.userId).toBe("user-123");
      expect(reaction.emoji).toBe("👍");
      expect(reaction.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("ContactInfo", () => {
    it("应该正确定义ContactInfo接口", () => {
      const contact: ContactInfo = {
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
      };

      expect(contact.name).toBe("John Doe");
      expect(contact.phone).toBe("+1234567890");
      expect(contact.email).toBe("john@example.com");
      expect(contact.avatar).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("Call", () => {
    it("应该正确定义Call接口", () => {
      const call: Call = {
        id: "call-123",
        type: "audio",
        status: "ongoing",
        initiatorId: "user-123",
        participants: [],
        startTime: new Date(),
        endTime: new Date(),
        duration: 300,
        chatId: "chat-123",
        createdAt: new Date(),
      };

      expect(call.type).toBe("audio");
      expect(call.status).toBe("ongoing");
      expect(call.duration).toBe(300);
    });

    it("应该支持视频通话", () => {
      const videoCall: Call = {
        id: "call-123",
        type: "video",
        status: "ended",
        initiatorId: "user-123",
        participants: [],
        startTime: new Date(),
        endTime: new Date(),
        duration: 600,
        createdAt: new Date(),
      };

      expect(videoCall.type).toBe("video");
      expect(videoCall.status).toBe("ended");
    });
  });

  describe("CallParticipant", () => {
    it("应该正确定义CallParticipant接口", () => {
      const participant: CallParticipant = {
        userId: "user-123",
        status: "connected",
        joinedAt: new Date(),
        leftAt: new Date(),
      };

      expect(participant.userId).toBe("user-123");
      expect(participant.status).toBe("connected");
      expect(participant.joinedAt).toBeInstanceOf(Date);
      expect(participant.leftAt).toBeInstanceOf(Date);
    });
  });

  describe("Status", () => {
    it("应该正确定义Status接口", () => {
      const status: Status = {
        id: "status-123",
        userId: "user-123",
        type: "text",
        content: "Hello World!",
        views: [],
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      expect(status.type).toBe("text");
      expect(status.content).toBe("Hello World!");
      expect(status.views).toEqual([]);
    });

    it("应该支持图片状态", () => {
      const imageStatus: Status = {
        id: "status-123",
        userId: "user-123",
        type: "image",
        content: "Check out this image!",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
        views: [],
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      expect(imageStatus.type).toBe("image");
      expect(imageStatus.mediaUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("StatusView", () => {
    it("应该正确定义StatusView接口", () => {
      const view: StatusView = {
        userId: "user-123",
        viewedAt: new Date(),
      };

      expect(view.userId).toBe("user-123");
      expect(view.viewedAt).toBeInstanceOf(Date);
    });
  });

  describe("Group", () => {
    it("应该正确定义Group接口", () => {
      const group: Group = {
        id: "group-123",
        name: "Test Group",
        description: "A test group",
        avatar: "https://example.com/group-avatar.jpg",
        creatorId: "user-123",
        admins: ["user-123"],
        participants: [],
        settings: {
          onlyAdminsCanSendMessages: false,
          onlyAdminsCanEditInfo: false,
          onlyAdminsCanAddParticipants: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(group.name).toBe("Test Group");
      expect(group.description).toBe("A test group");
      expect(group.creatorId).toBe("user-123");
      expect(group.admins).toEqual(["user-123"]);
    });
  });

  describe("GroupParticipant", () => {
    it("应该正确定义GroupParticipant接口", () => {
      const participant: GroupParticipant = {
        userId: "user-123",
        role: "admin",
        joinedAt: new Date(),
        addedBy: "user-456",
      };

      expect(participant.userId).toBe("user-123");
      expect(participant.role).toBe("admin");
      expect(participant.addedBy).toBe("user-456");
    });
  });

  describe("GroupSettings", () => {
    it("应该正确定义GroupSettings接口", () => {
      const settings: GroupSettings = {
        onlyAdminsCanSendMessages: true,
        onlyAdminsCanEditInfo: true,
        onlyAdminsCanAddParticipants: true,
      };

      expect(settings.onlyAdminsCanSendMessages).toBe(true);
      expect(settings.onlyAdminsCanEditInfo).toBe(true);
      expect(settings.onlyAdminsCanAddParticipants).toBe(true);
    });
  });

  describe("FileUpload", () => {
    it("应该正确定义FileUpload接口", () => {
      const file: FileUpload = {
        id: "file-123",
        originalName: "document.pdf",
        filename: "uploaded-document.pdf",
        mimetype: "application/pdf",
        size: 1024000,
        url: "https://example.com/files/document.pdf",
        thumbnailUrl: "https://example.com/thumbnails/document.jpg",
        uploadedBy: "user-123",
        createdAt: new Date(),
      };

      expect(file.originalName).toBe("document.pdf");
      expect(file.filename).toBe("uploaded-document.pdf");
      expect(file.mimetype).toBe("application/pdf");
      expect(file.size).toBe(1024000);
      expect(file.url).toBe("https://example.com/files/document.pdf");
    });
  });

  describe("ApiResponse", () => {
    it("应该正确定义ApiResponse接口", () => {
      const response: ApiResponse<string> = {
        success: true,
        message: "Operation successful",
        data: "test data",
        timestamp: new Date(),
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe("Operation successful");
      expect(response.data).toBe("test data");
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it("应该支持错误响应", () => {
      const errorResponse: ApiResponse = {
        success: false,
        message: "Operation failed",
        error: "Something went wrong",
        timestamp: new Date(),
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe("Something went wrong");
    });
  });

  describe("PaginatedResponse", () => {
    it("应该正确定义PaginatedResponse接口", () => {
      const paginatedResponse: PaginatedResponse<User> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          totalPages: 10,
          hasNext: true,
          hasPrev: false,
        },
      };

      expect(paginatedResponse.data).toEqual([]);
      expect(paginatedResponse.pagination.page).toBe(1);
      expect(paginatedResponse.pagination.limit).toBe(10);
      expect(paginatedResponse.pagination.total).toBe(100);
      expect(paginatedResponse.pagination.totalPages).toBe(10);
      expect(paginatedResponse.pagination.hasNext).toBe(true);
      expect(paginatedResponse.pagination.hasPrev).toBe(false);
    });
  });

  describe("AppError", () => {
    it("应该正确定义AppError接口", () => {
      const error: AppError = {
        name: "AppError",
        message: "Something went wrong",
        statusCode: 500,
        isOperational: true,
        code: "INTERNAL_ERROR",
      };

      expect(error.name).toBe("AppError");
      expect(error.message).toBe("Something went wrong");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("AuthenticatedRequest", () => {
    it("应该正确定义AuthenticatedRequest接口", () => {
      const req: AuthenticatedRequest = {
        user: {} as User,
        token: "jwt-token-123",
        body: {},
        params: {},
        query: {},
      };

      expect(req.user).toBeDefined();
      expect(req.token).toBe("jwt-token-123");
    });
  });

  describe("SearchFilters", () => {
    it("应该正确定义SearchFilters接口", () => {
      const filters: SearchFilters = {
        query: "test search",
        type: "users",
        chatId: "chat-123",
        dateFrom: new Date("2023-01-01"),
        dateTo: new Date("2023-12-31"),
        limit: 20,
        offset: 0,
      };

      expect(filters.query).toBe("test search");
      expect(filters.type).toBe("users");
      expect(filters.chatId).toBe("chat-123");
      expect(filters.dateFrom).toBeInstanceOf(Date);
      expect(filters.dateTo).toBeInstanceOf(Date);
      expect(filters.limit).toBe(20);
      expect(filters.offset).toBe(0);
    });
  });

  describe("Notification", () => {
    it("应该正确定义Notification接口", () => {
      const notification: Notification = {
        id: "notification-123",
        userId: "user-123",
        type: "message",
        title: "New Message",
        body: "You have a new message",
        data: { messageId: "message-123" },
        isRead: false,
        createdAt: new Date(),
      };

      expect(notification.id).toBe("notification-123");
      expect(notification.userId).toBe("user-123");
      expect(notification.type).toBe("message");
      expect(notification.title).toBe("New Message");
      expect(notification.body).toBe("You have a new message");
      expect(notification.data).toEqual({ messageId: "message-123" });
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("UserSettings", () => {
    it("应该正确定义UserSettings接口", () => {
      const settings: UserSettings = {
        userId: "user-123",
        theme: "dark",
        language: "zh-CN",
        notifications: {
          messages: true,
          calls: true,
          groups: false,
          status: true,
        },
        privacy: {
          lastSeen: "contacts",
          profilePhoto: "everyone",
          status: "contacts",
          readReceipts: true,
        },
        chat: {
          enterToSend: true,
          mediaAutoDownload: false,
          fontSize: "medium",
        },
        updatedAt: new Date(),
      };

      expect(settings.userId).toBe("user-123");
      expect(settings.theme).toBe("dark");
      expect(settings.language).toBe("zh-CN");
      expect(settings.notifications.messages).toBe(true);
      expect(settings.notifications.groups).toBe(false);
      expect(settings.privacy.lastSeen).toBe("contacts");
      expect(settings.chat.enterToSend).toBe(true);
      expect(settings.chat.fontSize).toBe("medium");
    });
  });

  describe("SocketEvents", () => {
    it("应该正确定义SocketEvents接口", () => {
      // 测试连接事件
      const connectEvent: SocketEvents["user:connect"] = {
        userId: "user-123",
      };

      expect(connectEvent.userId).toBe("user-123");

      // 测试消息事件
      const messageEvent: SocketEvents["message:send"] = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        sender: {} as User,
        type: "text",
        content: "Hello!",
        isEdited: false,
        isDeleted: false,
        isForwarded: false,
        reactions: [],
        readBy: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(messageEvent.id).toBe("message-123");
      expect(messageEvent.type).toBe("text");

      // 测试通话事件
      const callEvent: SocketEvents["call:incoming"] = {
        id: "call-123",
        type: "audio",
        status: "incoming",
        initiatorId: "user-123",
        participants: [],
        startTime: new Date(),
        createdAt: new Date(),
      };

      expect(callEvent.type).toBe("audio");
      expect(callEvent.status).toBe("incoming");
    });
  });
});
