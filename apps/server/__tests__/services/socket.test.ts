import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

// Mock dependencies
vi.mock("jsonwebtoken");
vi.mock("@/config", () => ({
  default: {
    jwt: {
      secret: "test-secret",
    },
  },
}));

vi.mock("@/database/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    chatParticipant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    messageRead: {
      upsert: vi.fn(),
    },
    messageReaction: {
      upsert: vi.fn(),
    },
    status: {
      create: vi.fn(),
    },
    contact: {
      findMany: vi.fn(),
    },
  },
  default: {
    prisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      chatParticipant: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      message: {
        create: vi.fn(),
      },
      messageRead: {
        upsert: vi.fn(),
      },
      messageReaction: {
        upsert: vi.fn(),
      },
      status: {
        create: vi.fn(),
      },
      contact: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Socket Service", () => {
  let mockIO: any;
  let mockSocket: any;
  let mockPrisma: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock Socket.IO Server
    mockIO = {
      use: vi.fn(),
      on: vi.fn(),
      to: vi.fn(() => ({
        emit: vi.fn(),
      })),
      emit: vi.fn(),
    };

    // Mock Socket
    mockSocket = {
      id: "socket-123",
      userId: "user-123",
      user: { id: "user-123", username: "testuser" },
      handshake: {
        auth: { token: "valid-token" },
        headers: {},
      },
      emit: vi.fn(),
      on: vi.fn(),
      join: vi.fn(),
      leave: vi.fn(),
      disconnect: vi.fn(),
      broadcast: {
        emit: vi.fn(),
      },
      to: vi.fn(() => ({
        emit: vi.fn(),
      })),
    };

    // Mock Prisma
    mockPrisma = (await import("@/database/client")).prisma;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("setupSocketHandlers", () => {
    it("should setup authentication middleware", async () => {
      const { setupSocketHandlers } = await import("@/services/socket");

      setupSocketHandlers(mockIO as Server);

      expect(mockIO.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should setup connection handler", async () => {
      const { setupSocketHandlers } = await import("@/services/socket");

      setupSocketHandlers(mockIO as Server);

      expect(mockIO.on).toHaveBeenCalledWith(
        "connection",
        expect.any(Function)
      );
    });
  });

  describe("authentication middleware", () => {
    it("should authenticate user with valid token", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      // Get the middleware function
      const middleware = mockIO.use.mock.calls[0][0];
      const next = vi.fn();

      await middleware(mockSocket, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          status: true,
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { isOnline: true },
      });
      expect(next).toHaveBeenCalled();
    });

    it("should reject authentication with invalid token", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = vi.fn();

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(new Error("认证失败"));
    });

    it("should reject authentication with missing token", async () => {
      mockSocket.handshake.auth = {};
      mockSocket.handshake.headers = {};

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = vi.fn();

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(new Error("认证令牌缺失"));
    });

    it("should reject authentication with non-existent user", async () => {
      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const middleware = mockIO.use.mock.calls[0][0];
      const next = vi.fn();

      await middleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(new Error("认证失败"));
    });
  });

  describe("connection handler", () => {
    it("should handle user connection", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      // Get the connection handler
      const connectionHandler = mockIO.on.mock.calls[0][1];

      await connectionHandler(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith("user:user-123");
      expect(mockSocket.emit).toHaveBeenCalledWith("user:connect", {
        userId: "user-123",
      });
    });

    it("should handle message sending", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const mockParticipant = { userId: "user-123" };
      const mockMessage = {
        id: "message-123",
        chatId: "chat-123",
        senderId: "user-123",
        type: "TEXT",
        content: "Hello world",
        sender: mockUser,
      };

      const mockParticipants = [{ userId: "user-123" }, { userId: "user-456" }];

      mockPrisma.chatParticipant.findUnique.mockResolvedValue(mockParticipant);
      mockPrisma.message.create.mockResolvedValue(mockMessage);
      mockPrisma.chatParticipant.findMany.mockResolvedValue(mockParticipants);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      // Get the message:send handler
      const messageHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "message:send"
      )[1];

      const messageData = {
        chatId: "chat-123",
        content: "Hello world",
        type: "TEXT",
        mediaUrl: null,
        replyToMessageId: null,
      };

      await messageHandler(messageData);

      expect(mockPrisma.chatParticipant.findUnique).toHaveBeenCalledWith({
        where: {
          chatId_userId: {
            chatId: "chat-123",
            userId: "user-123",
          },
        },
      });

      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-123",
          senderId: "user-123",
          type: "TEXT",
          content: "Hello world",
          mediaUrl: null,
          replyToMessageId: null,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("message:sent", mockMessage);
    });

    it("should reject message sending for non-participant", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      mockPrisma.chatParticipant.findUnique.mockResolvedValue(null);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const messageHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "message:send"
      )[1];

      const messageData = {
        chatId: "chat-123",
        content: "Hello world",
        type: "TEXT",
        mediaUrl: null,
        replyToMessageId: null,
      };

      await messageHandler(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "无权发送消息到此聊天",
      });
    });

    it("should handle message read", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const mockMessageRead = {
        messageId: "message-123",
        userId: "user-123",
      };

      mockPrisma.messageRead.upsert.mockResolvedValue(mockMessageRead);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const messageReadHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "message:read"
      )[1];

      const readData = {
        messageId: "message-123",
        chatId: "chat-123",
      };

      await messageReadHandler(readData);

      expect(mockPrisma.messageRead.upsert).toHaveBeenCalledWith({
        where: {
          messageId_userId: {
            messageId: "message-123",
            userId: "user-123",
          },
        },
        update: {},
        create: {
          messageId: "message-123",
          userId: "user-123",
        },
      });
    });

    it("should handle typing indicator", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const typingHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "message:typing"
      )[1];

      const typingData = {
        chatId: "chat-123",
        isTyping: true,
      };

      await typingHandler(typingData);

      expect(mockSocket.to).toHaveBeenCalledWith("chat:chat-123");
    });

    it("should handle message reaction", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const mockReaction = {
        messageId: "message-123",
        userId: "user-123",
        emoji: "👍",
      };

      mockPrisma.messageReaction.upsert.mockResolvedValue(mockReaction);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const reactionHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "message:reaction"
      )[1];

      const reactionData = {
        messageId: "message-123",
        emoji: "👍",
      };

      await reactionHandler(reactionData);

      expect(mockPrisma.messageReaction.upsert).toHaveBeenCalledWith({
        where: {
          messageId_userId_emoji: {
            messageId: "message-123",
            userId: "user-123",
            emoji: "👍",
          },
        },
        update: {},
        create: {
          messageId: "message-123",
          userId: "user-123",
          emoji: "👍",
        },
      });

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith(
        "message:reaction",
        {
          messageId: "message-123",
          reaction: mockReaction,
        }
      );
    });

    it("should handle call events", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers, onlineUsers } = await import(
        "@/services/socket"
      );
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      // 模拟目标用户在线
      onlineUsers.set("user-456", "socket-456");

      // Test call:incoming
      const incomingCallHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "call:incoming"
      )[1];

      const incomingCallData = {
        targetUserId: "user-456",
      };

      await incomingCallHandler(incomingCallData);

      expect(mockIO.to).toHaveBeenCalledWith("socket-456"); // Assuming target user's socket ID

      // Test call:answer
      const answerCallHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "call:answer"
      )[1];

      const answerCallData = {
        callId: "call-123",
        initiatorId: "user-456",
      };

      await answerCallHandler(answerCallData);

      expect(mockIO.to).toHaveBeenCalledWith("socket-456");

      // Test call:reject
      const rejectCallHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "call:reject"
      )[1];

      const rejectCallData = {
        callId: "call-123",
        initiatorId: "user-456",
      };

      await rejectCallHandler(rejectCallData);

      expect(mockIO.to).toHaveBeenCalledWith("socket-456");
    });

    it("should handle status creation", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const mockStatus = {
        id: "status-123",
        userId: "user-123",
        type: "TEXT",
        content: "Test status",
        user: mockUser,
      };

      const mockContacts = [{ phone: "+1234567890" }, { phone: "+0987654321" }];

      mockPrisma.status.create.mockResolvedValue(mockStatus);
      mockPrisma.contact.findMany.mockResolvedValue(mockContacts);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const statusHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "status:create"
      )[1];

      const statusData = {
        content: "Test status",
        type: "TEXT",
        mediaUrl: null,
        duration: null,
      };

      await statusHandler(statusData);

      expect(mockPrisma.status.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          content: "Test status",
          type: "TEXT",
          mediaUrl: null,
          duration: null,
          expiresAt: expect.any(Date),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith(
        "status:create",
        mockStatus
      );
    });

    it("should handle user status update", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const statusUpdateHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "user:status"
      )[1];

      const statusData = {
        status: "忙碌中...",
      };

      await statusUpdateHandler(statusData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { status: "忙碌中..." },
      });

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith("user:status", {
        userId: "user-123",
        status: "忙碌中...",
      });
    });

    it("should handle disconnect", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        avatar: null,
        status: "online",
      };

      const mockDecoded = { userId: "user-123" };
      vi.mocked(jwt.verify).mockReturnValue(mockDecoded as any);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const { setupSocketHandlers } = await import("@/services/socket");
      setupSocketHandlers(mockIO as Server);

      const connectionHandler = mockIO.on.mock.calls[0][1];
      await connectionHandler(mockSocket);

      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === "disconnect"
      )[1];

      await disconnectHandler();

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          isOnline: false,
          lastSeen: expect.any(Date),
        },
      });

      expect(mockSocket.broadcast.emit).toHaveBeenCalledWith("user:offline", {
        userId: "user-123",
      });
    });
  });

  describe("utility functions", () => {
    it("should get online user count", async () => {
      const { getOnlineUserCount } = await import("@/services/socket");

      const count = getOnlineUserCount();
      expect(typeof count).toBe("number");
    });

    it("should check if user is online", async () => {
      const { isUserOnline } = await import("@/services/socket");

      const isOnline = isUserOnline("user-123");
      expect(typeof isOnline).toBe("boolean");
    });

    it("should get user socket ID", async () => {
      const { getUserSocketId } = await import("@/services/socket");

      const socketId = getUserSocketId("user-123");
      expect(socketId).toBeUndefined(); // No users online in test
    });

    it("should send message to user", async () => {
      const { sendToUser } = await import("@/services/socket");

      sendToUser(mockIO as Server, "user-123", "test:event", { data: "test" });

      // Should not throw error even if user is not online
      expect(true).toBe(true);
    });

    it("should send message to multiple users", async () => {
      const { sendToUsers } = await import("@/services/socket");

      sendToUsers(mockIO as Server, ["user-123", "user-456"], "test:event", {
        data: "test",
      });

      // Should not throw error even if users are not online
      expect(true).toBe(true);
    });
  });
});
