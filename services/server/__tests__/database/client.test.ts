import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "../../src/database/client";

// Mock Prisma for database tests
vi.mock("../../src/database/client", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    chat: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    message: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    chatParticipant: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  },
}));

describe("Database Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Operations", () => {
    it("should create user successfully", async () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        password: "hashed-password",
        phone: "+1234567890",
      };

      const mockUser = {
        id: "user-1",
        ...userData,
        status: "offline",
        isOnline: false,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await prisma.user.create({
        data: userData,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });

    it("should find user by email", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        password: "hashed-password",
        phone: "+1234567890",
        status: "offline",
        isOnline: false,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should update user status", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        password: "hashed-password",
        phone: "+1234567890",
        status: "online",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { id: "user-1" },
        data: { status: "online", isOnline: true },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { status: "online", isOnline: true },
      });
      expect(result).toEqual(mockUser);
    });

    it("should handle user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await prisma.user.findUnique({
        where: { email: "nonexistent@example.com" },
      });

      expect(result).toBeNull();
    });
  });

  describe("Chat Operations", () => {
    it("should create chat successfully", async () => {
      const chatData = {
        name: "Test Chat",
        type: "private",
      };

      const mockChat = {
        id: "chat-1",
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.create).mockResolvedValue(mockChat);

      const result = await prisma.chat.create({
        data: chatData,
      });

      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: chatData,
      });
      expect(result).toEqual(mockChat);
    });

    it("should find chat by id", async () => {
      const mockChat = {
        id: "chat-1",
        name: "Test Chat",
        type: "private",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat);

      const result = await prisma.chat.findUnique({
        where: { id: "chat-1" },
      });

      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: "chat-1" },
      });
      expect(result).toEqual(mockChat);
    });

    it("should find user chats", async () => {
      const mockChats = [
        {
          id: "chat-1",
          name: "Chat 1",
          type: "private",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "chat-2",
          name: "Chat 2",
          type: "group",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.chat.findMany).mockResolvedValue(mockChats);

      const result = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: "user-1",
            },
          },
        },
      });

      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: {
          participants: {
            some: {
              userId: "user-1",
            },
          },
        },
      });
      expect(result).toEqual(mockChats);
    });
  });

  describe("Message Operations", () => {
    it("should create message successfully", async () => {
      const messageData = {
        chatId: "chat-1",
        senderId: "user-1",
        content: "Hello, world!",
        type: "text",
      };

      const mockMessage = {
        id: "message-1",
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage);

      const result = await prisma.message.create({
        data: messageData,
      });

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: messageData,
      });
      expect(result).toEqual(mockMessage);
    });

    it("should find messages by chat id", async () => {
      const mockMessages = [
        {
          id: "message-1",
          chatId: "chat-1",
          senderId: "user-1",
          content: "Hello",
          type: "text",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "message-2",
          chatId: "chat-1",
          senderId: "user-2",
          content: "Hi there",
          type: "text",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages);

      const result = await prisma.message.findMany({
        where: { chatId: "chat-1" },
        orderBy: { createdAt: "desc" },
      });

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockMessages);
    });

    it("should update message", async () => {
      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        content: "Updated message",
        type: "text",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.message.update).mockResolvedValue(mockMessage);

      const result = await prisma.message.update({
        where: { id: "message-1" },
        data: { content: "Updated message" },
      });

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: "message-1" },
        data: { content: "Updated message" },
      });
      expect(result).toEqual(mockMessage);
    });

    it("should delete message", async () => {
      const mockMessage = {
        id: "message-1",
        chatId: "chat-1",
        senderId: "user-1",
        content: "Deleted message",
        type: "text",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.message.delete).mockResolvedValue(mockMessage);

      const result = await prisma.message.delete({
        where: { id: "message-1" },
      });

      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: "message-1" },
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe("Chat Participant Operations", () => {
    it("should add participant to chat", async () => {
      const participantData = {
        chatId: "chat-1",
        userId: "user-1",
        role: "member",
      };

      const mockParticipant = {
        id: "participant-1",
        ...participantData,
        joinedAt: new Date(),
      };

      vi.mocked(prisma.chatParticipant.create).mockResolvedValue(
        mockParticipant
      );

      const result = await prisma.chatParticipant.create({
        data: participantData,
      });

      expect(prisma.chatParticipant.create).toHaveBeenCalledWith({
        data: participantData,
      });
      expect(result).toEqual(mockParticipant);
    });

    it("should find chat participants", async () => {
      const mockParticipants = [
        {
          id: "participant-1",
          chatId: "chat-1",
          userId: "user-1",
          role: "admin",
          joinedAt: new Date(),
        },
        {
          id: "participant-2",
          chatId: "chat-1",
          userId: "user-2",
          role: "member",
          joinedAt: new Date(),
        },
      ];

      vi.mocked(prisma.chatParticipant.findMany).mockResolvedValue(
        mockParticipants
      );

      const result = await prisma.chatParticipant.findMany({
        where: { chatId: "chat-1" },
      });

      expect(prisma.chatParticipant.findMany).toHaveBeenCalledWith({
        where: { chatId: "chat-1" },
      });
      expect(result).toEqual(mockParticipants);
    });

    it("should remove participant from chat", async () => {
      const mockParticipant = {
        id: "participant-1",
        chatId: "chat-1",
        userId: "user-1",
        role: "member",
        joinedAt: new Date(),
      };

      vi.mocked(prisma.chatParticipant.delete).mockResolvedValue(
        mockParticipant
      );

      const result = await prisma.chatParticipant.delete({
        where: { id: "participant-1" },
      });

      expect(prisma.chatParticipant.delete).toHaveBeenCalledWith({
        where: { id: "participant-1" },
      });
      expect(result).toEqual(mockParticipant);
    });
  });

  describe("Database Transactions", () => {
    it("should handle transaction successfully", async () => {
      const mockTransaction = vi.fn().mockResolvedValue({
        user: { id: "user-1" },
        chat: { id: "chat-1" },
      });

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: "test@example.com",
            username: "testuser",
            password: "hashed-password",
          },
        });

        const chat = await tx.chat.create({
          data: {
            name: "Test Chat",
            type: "private",
          },
        });

        return { user, chat };
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        user: { id: "user-1" },
        chat: { id: "chat-1" },
      });
    });

    it("should handle transaction rollback on error", async () => {
      const mockTransaction = vi
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));

      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await expect(
        prisma.$transaction(async (tx) => {
          await tx.user.create({
            data: {
              email: "test@example.com",
              username: "testuser",
              password: "hashed-password",
            },
          });

          throw new Error("Transaction failed");
        })
      ).rejects.toThrow("Transaction failed");

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        prisma.user.findUnique({
          where: { email: "test@example.com" },
        })
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle constraint violations", async () => {
      vi.mocked(prisma.user.create).mockRejectedValue(
        new Error("Unique constraint failed on email")
      );

      await expect(
        prisma.user.create({
          data: {
            email: "existing@example.com",
            username: "testuser",
            password: "hashed-password",
          },
        })
      ).rejects.toThrow("Unique constraint failed on email");
    });

    it("should handle foreign key violations", async () => {
      vi.mocked(prisma.message.create).mockRejectedValue(
        new Error("Foreign key constraint failed")
      );

      await expect(
        prisma.message.create({
          data: {
            chatId: "non-existent-chat",
            senderId: "user-1",
            content: "Hello",
            type: "text",
          },
        })
      ).rejects.toThrow("Foreign key constraint failed");
    });
  });
});
