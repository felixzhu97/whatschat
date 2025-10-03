import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MessageService } from "../../src/services/message";
import { prisma } from "../../src/database/client";

// Mock Prisma
vi.mock("../../src/database/client", () => ({
  prisma: {
    chat: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// Test constants
const TEST_CONSTANTS = {
  CHAT_ID: "chat-1",
  USER_ID: "user-1",
  MESSAGE_ID: "message-1",
  CHAT_NAME: "Test Chat",
  USERNAME: "testuser",
} as const;

// Helper functions
const createMockChat = (overrides = {}) => ({
  id: TEST_CONSTANTS.CHAT_ID,
  name: TEST_CONSTANTS.CHAT_NAME,
  type: "PRIVATE" as const,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockSender = (overrides = {}) => ({
  id: TEST_CONSTANTS.USER_ID,
  username: TEST_CONSTANTS.USERNAME,
  avatar: null,
  ...overrides,
});

const createMockMessage = (overrides = {}) => ({
  id: TEST_CONSTANTS.MESSAGE_ID,
  chatId: TEST_CONSTANTS.CHAT_ID,
  senderId: TEST_CONSTANTS.USER_ID,
  type: "TEXT" as const,
  content: "Test message",
  mediaUrl: null,
  thumbnailUrl: null,
  duration: null,
  size: null,
  latitude: null,
  longitude: null,
  contactName: null,
  contactPhone: null,
  contactEmail: null,
  contactAvatar: null,
  isEdited: false,
  isDeleted: false,
  isForwarded: false,
  originalMessageId: null,
  replyToMessageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  sender: createMockSender(),
  ...overrides,
});

const createMessageData = (overrides = {}) => ({
  chatId: TEST_CONSTANTS.CHAT_ID,
  senderId: TEST_CONSTANTS.USER_ID,
  type: "TEXT" as const,
  content: "Test message",
  ...overrides,
});

const createGetMessagesOptions = (overrides = {}) => ({
  page: 1,
  limit: 20,
  ...overrides,
});

describe("Message Service", () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("createMessage", () => {
    it("should create a message successfully", async () => {
      const mockChat = createMockChat();
      const mockMessage = createMockMessage();
      const messageData = createMessageData();

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.CHAT_ID },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: TEST_CONSTANTS.CHAT_ID,
          senderId: TEST_CONSTANTS.USER_ID,
          type: "TEXT",
          content: "Test message",
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
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: TEST_CONSTANTS.CHAT_ID },
        data: {
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockMessage);
    });

    it("should throw error when chat does not exist", async () => {
      const messageData = createMessageData({
        chatId: "non-existent-chat",
      });

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "聊天不存在"
      );
    });

    it("should handle database errors during message creation", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "Hello, world!",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Database error")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle database errors during chat update", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "Hello, world!",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "Hello, world!",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockRejectedValue(
        new Error("Chat update failed")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Chat update failed"
      );
    });

    it("should handle empty content message", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(result).toEqual(mockMessage);
    });

    it("should handle very long content message", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const longContent = "a".repeat(10000); // 10KB content
      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: longContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: longContent,
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(result).toEqual(mockMessage);
    });

    it("should create IMAGE message successfully", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "IMAGE",
        content: "https://example.com/image.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "IMAGE" as const,
        content: "https://example.com/image.jpg",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "IMAGE",
          content: "https://example.com/image.jpg",
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
      expect(result).toEqual(mockMessage);
    });

    it("should create VIDEO message successfully", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "VIDEO",
        content: "https://example.com/video.mp4",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "VIDEO" as const,
        content: "https://example.com/video.mp4",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "VIDEO",
          content: "https://example.com/video.mp4",
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
      expect(result).toEqual(mockMessage);
    });

    it("should create AUDIO message successfully", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "AUDIO",
        content: "https://example.com/audio.mp3",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "AUDIO" as const,
        content: "https://example.com/audio.mp3",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "AUDIO",
          content: "https://example.com/audio.mp3",
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
      expect(result).toEqual(mockMessage);
    });

    it("should create FILE message successfully", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "FILE",
        content: "https://example.com/document.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "FILE" as const,
        content: "https://example.com/document.pdf",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "FILE",
          content: "https://example.com/document.pdf",
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
      expect(result).toEqual(mockMessage);
    });

    it("should create message with metadata", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "IMAGE",
        content: "https://example.com/image.jpg",
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 1024000,
          mimeType: "image/jpeg",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "IMAGE" as const,
        content: "https://example.com/image.jpg",
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 1024000,
          mimeType: "image/jpeg",
        },
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "IMAGE",
          content: "https://example.com/image.jpg",
          metadata: {
            width: 1920,
            height: 1080,
            fileSize: 1024000,
            mimeType: "image/jpeg",
          },
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
      expect(result).toEqual(mockMessage);
    });

    it("should create message with complex metadata", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const complexMetadata = {
        audio: {
          duration: 120,
          bitrate: 128,
          sampleRate: 44100,
        },
        transcription: {
          language: "zh-CN",
          confidence: 0.95,
          text: "这是一段语音消息的转录文本",
        },
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: "北京市朝阳区",
        },
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "AUDIO",
        content: "https://example.com/audio.mp3",
        metadata: complexMetadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "AUDIO" as const,
        content: "https://example.com/audio.mp3",
        metadata: complexMetadata,
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "AUDIO",
          content: "https://example.com/audio.mp3",
          metadata: complexMetadata,
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
      expect(result).toEqual(mockMessage);
    });

    it("should create message without metadata", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT",
        content: "Simple text message",
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Simple text message",
        // metadata is optional, not provided
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "TEXT",
          content: "Simple text message",
          metadata: undefined,
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
      expect(result).toEqual(mockMessage);
    });
  });

  describe("getMessages", () => {
    it("should get messages with pagination", async () => {
      const mockMessages = [
        {
          id: "message-1",
          chatId: "chat-1",
          senderId: "user-1",
          type: "text",
          content: "Message 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: "user-1",
            username: "testuser",
            avatar: null,
          },
        },
        {
          id: "message-2",
          chatId: "chat-1",
          senderId: "user-2",
          type: "text",
          content: "Message 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: "user-2",
            username: "testuser2",
            avatar: null,
          },
        },
      ];

      const options = {
        page: 1,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      const result = await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual(mockMessages);
    });

    it("should get messages with search filter", async () => {
      const mockMessages = [
        {
          id: "message-1",
          chatId: "chat-1",
          senderId: "user-1",
          type: "text",
          content: "Hello world",
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: {
            id: "user-1",
            username: "testuser",
            avatar: null,
          },
        },
      ];

      const options = {
        page: 1,
        limit: 20,
        search: "hello",
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      const result = await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatId: "chat-1",
          content: {
            contains: "hello",
            mode: "insensitive",
          },
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
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual(mockMessages);
    });

    it("should handle pagination correctly", async () => {
      const mockMessages = [];

      const options = {
        page: 3,
        limit: 10,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: 20, // (page - 1) * limit = (3 - 1) * 10 = 20
        take: 10,
      });
    });
  });

  describe("updateMessage", () => {
    it("should update message successfully", async () => {
      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "Updated message",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockResolvedValue(mockMessage);

      const result = await messageService.updateMessage(
        "message-1",
        updateData
      );

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: "message-1" },
        data: {
          content: "Updated message",
          type: undefined,
          updatedAt: expect.any(Date),
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
      expect(result).toEqual(mockMessage);
    });

    it("should handle update errors", async () => {
      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        messageService.updateMessage("message-1", updateData)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteMessage", () => {
    it("should delete message successfully", async () => {
      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "text",
        content: "Deleted message",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      vi.mocked(prisma.message.delete).mockResolvedValue(mockMessage);

      const result = await messageService.deleteMessage("message-1");

      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: "message-1" },
      });
      expect(result).toEqual(mockMessage);
    });

    it("should handle delete errors", async () => {
      vi.mocked(prisma.message.delete).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(messageService.deleteMessage("message-1")).rejects.toThrow(
        "Delete failed"
      );
    });
  });

  describe("markAsRead", () => {
    it("should mark messages as read successfully", async () => {
      const mockMessages = [
        {
          id: "message-1",
          chatId: "chat-1",
          senderId: "user-2",
          type: "text",
          content: "Message from user-2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "message-2",
          chatId: "chat-1",
          senderId: "user-3",
          type: "text",
          content: "Another message",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      const result = await messageService.markAsRead("chat-1", "user-1");

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatId: "chat-1",
          senderId: { not: "user-1" },
        },
      });
      expect(result).toBe(true);
    });

    it("should handle empty message list", async () => {
      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      const result = await messageService.markAsRead("chat-1", "user-1");

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          chatId: "chat-1",
          senderId: { not: "user-1" },
        },
      });
      expect(result).toBe(true);
    });

    it("should handle database errors during mark as read", async () => {
      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        messageService.markAsRead("chat-1", "user-1")
      ).rejects.toThrow("Database error");
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle Prisma validation errors", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Invalid input: content is required")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Invalid input: content is required"
      );
    });

    it("should handle Prisma foreign key constraint errors", async () => {
      const messageData = {
        chatId: "non-existent-chat",
        senderId: "non-existent-user",
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "non-existent-chat",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Foreign key constraint failed")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Foreign key constraint failed"
      );
    });

    it("should handle Prisma unique constraint errors", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Unique constraint failed")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Unique constraint failed"
      );
    });

    it("should handle network timeout errors", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Request timeout")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should handle connection errors", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      vi.mocked(prisma.chat.findUnique).mockRejectedValue(
        new Error("Connection failed")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Connection failed"
      );
    });

    it("should handle updateMessage with non-existent message", async () => {
      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockRejectedValue(
        new Error("Record to update not found")
      );

      await expect(
        messageService.updateMessage("non-existent-message", updateData)
      ).rejects.toThrow("Record to update not found");
    });

    it("should handle deleteMessage with non-existent message", async () => {
      vi.mocked(prisma.message.delete).mockRejectedValue(
        new Error("Record to delete does not exist")
      );

      await expect(
        messageService.deleteMessage("non-existent-message")
      ).rejects.toThrow("Record to delete does not exist");
    });

    it("should handle getMessages with invalid chat ID", async () => {
      const options = {
        page: 1,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("Invalid chat ID format")
      );

      await expect(
        messageService.getMessages("invalid-chat-id", options)
      ).rejects.toThrow("Invalid chat ID format");
    });

    it("should handle concurrent message creation", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT",
        content: "Test message",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: "user-1",
          username: "testuser",
          avatar: null,
        },
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      // Simulate concurrent calls
      const promises = [
        messageService.createMessage(messageData),
        messageService.createMessage(messageData),
        messageService.createMessage(messageData),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(mockMessage);
      expect(results[1]).toEqual(mockMessage);
      expect(results[2]).toEqual(mockMessage);
    });
  });

  describe("input validation and parameter validation", () => {
    it("should handle null chatId in createMessage", async () => {
      const messageData = {
        chatId: null as any,
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "聊天不存在"
      );
    });

    it("should handle undefined chatId in createMessage", async () => {
      const messageData = {
        chatId: undefined as any,
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "聊天不存在"
      );
    });

    it("should handle empty string chatId in createMessage", async () => {
      const messageData = {
        chatId: "",
        senderId: "user-1",
        type: "TEXT" as const,
        content: "Test message",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(null);

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "聊天不存在"
      );
    });

    it("should handle null senderId in createMessage", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: null as any,
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("senderId cannot be null")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "senderId cannot be null"
      );
    });

    it("should handle undefined senderId in createMessage", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: undefined as any,
        type: "TEXT" as const,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("senderId is required")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "senderId is required"
      );
    });

    it("should handle null content in createMessage", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: null as any,
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("content cannot be null")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "content cannot be null"
      );
    });

    it("should handle undefined content in createMessage", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "TEXT" as const,
        content: undefined as any,
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("content is required")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "content is required"
      );
    });

    it("should handle invalid message type in createMessage", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        type: "INVALID_TYPE" as any,
        content: "Test message",
      };

      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Invalid message type")
      );

      await expect(messageService.createMessage(messageData)).rejects.toThrow(
        "Invalid message type"
      );
    });

    it("should handle null chatId in getMessages", async () => {
      const options = {
        page: 1,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("chatId cannot be null")
      );

      await expect(
        messageService.getMessages(null as any, options)
      ).rejects.toThrow("chatId cannot be null");
    });

    it("should handle undefined chatId in getMessages", async () => {
      const options = {
        page: 1,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("chatId is required")
      );

      await expect(
        messageService.getMessages(undefined as any, options)
      ).rejects.toThrow("chatId is required");
    });

    it("should handle invalid page number in getMessages", async () => {
      const options = {
        page: "invalid" as any,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getMessages("chat-1", options);

      // Should handle invalid page by converting to number or defaulting
      expect(prisma.message.findMany).toHaveBeenCalled();
    });

    it("should handle invalid limit in getMessages", async () => {
      const options = {
        page: 1,
        limit: "invalid" as any,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getMessages("chat-1", options);

      // Should handle invalid limit by converting to number or defaulting
      expect(prisma.message.findMany).toHaveBeenCalled();
    });

    it("should handle null messageId in updateMessage", async () => {
      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockRejectedValue(
        new Error("messageId cannot be null")
      );

      await expect(
        messageService.updateMessage(null as any, updateData)
      ).rejects.toThrow("messageId cannot be null");
    });

    it("should handle undefined messageId in updateMessage", async () => {
      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockRejectedValue(
        new Error("messageId is required")
      );

      await expect(
        messageService.updateMessage(undefined as any, updateData)
      ).rejects.toThrow("messageId is required");
    });

    it("should handle empty string messageId in updateMessage", async () => {
      const updateData = {
        content: "Updated message",
      };

      vi.mocked(prisma.message.update).mockRejectedValue(
        new Error("messageId cannot be empty")
      );

      await expect(
        messageService.updateMessage("", updateData)
      ).rejects.toThrow("messageId cannot be empty");
    });

    it("should handle null messageId in deleteMessage", async () => {
      vi.mocked(prisma.message.delete).mockRejectedValue(
        new Error("messageId cannot be null")
      );

      await expect(messageService.deleteMessage(null as any)).rejects.toThrow(
        "messageId cannot be null"
      );
    });

    it("should handle undefined messageId in deleteMessage", async () => {
      vi.mocked(prisma.message.delete).mockRejectedValue(
        new Error("messageId is required")
      );

      await expect(
        messageService.deleteMessage(undefined as any)
      ).rejects.toThrow("messageId is required");
    });

    it("should handle null chatId in markAsRead", async () => {
      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("chatId cannot be null")
      );

      await expect(
        messageService.markAsRead(null as any, "user-1")
      ).rejects.toThrow("chatId cannot be null");
    });

    it("should handle null userId in markAsRead", async () => {
      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("userId cannot be null")
      );

      await expect(
        messageService.markAsRead("chat-1", null as any)
      ).rejects.toThrow("userId cannot be null");
    });

    it("should handle undefined userId in markAsRead", async () => {
      vi.mocked(prisma.message.findMany).mockRejectedValue(
        new Error("userId is required")
      );

      await expect(
        messageService.markAsRead("chat-1", undefined as any)
      ).rejects.toThrow("userId is required");
    });
  });

  describe("edge cases", () => {
    it("should handle empty search string", async () => {
      const options = {
        page: 1,
        limit: 20,
        search: "",
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      });
    });

    it("should handle zero limit", async () => {
      const options = {
        page: 1,
        limit: 0,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 0,
      });
    });

    it("should handle negative page number", async () => {
      const options = {
        page: -1,
        limit: 20,
      };

      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getMessages("chat-1", options);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: -40, // (page - 1) * limit = (-1 - 1) * 20 = -40
        take: 20,
      });
    });
  });
});
