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
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat);

      const result = await messageService.createMessage(messageData);

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: "chat-1" },
      });
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: "chat-1",
          senderId: "user-1",
          type: "text",
          content: "Hello, world!",
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
        where: { id: "chat-1" },
        data: {
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockMessage);
    });

    it("should throw error when chat does not exist", async () => {
      const messageData = {
        chatId: "non-existent-chat",
        senderId: "user-1",
        type: "text",
        content: "Hello, world!",
      };

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
