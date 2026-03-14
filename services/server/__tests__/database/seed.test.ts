import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
  hash: vi.fn(),
}));

import bcrypt from "bcryptjs";

// Mock Prisma
const mockPrisma = {
  messageReaction: {
    deleteMany: vi.fn(),
  },
  messageRead: {
    deleteMany: vi.fn(),
  },
  message: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  chatParticipant: {
    deleteMany: vi.fn(),
  },
  chat: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  callParticipant: {
    deleteMany: vi.fn(),
  },
  call: {
    deleteMany: vi.fn(),
  },
  statusView: {
    deleteMany: vi.fn(),
  },
  status: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  groupParticipant: {
    deleteMany: vi.fn(),
  },
  group: {
    deleteMany: vi.fn(),
  },
  contact: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  blockedUser: {
    deleteMany: vi.fn(),
  },
  notification: {
    deleteMany: vi.fn(),
  },
  fileUpload: {
    deleteMany: vi.fn(),
  },
  userSettings: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  user: {
    count: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: "user-123", username: "serena" }),
  },
  $disconnect: vi.fn(),
};

vi.mock("@/database/client", () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

// Mock config
vi.mock("../src/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      server: {
        isDevelopment: true,
      },
      security: {
        bcrypt: {
          saltRounds: 10,
        },
      },
    })),
  },
}));

// Mock logger
vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
  hash: vi.fn(),
}));

describe("Database Seed", () => {
  beforeEach(() => {
    // 不要清除 mock 的返回值，只重置调用次数
    vi.clearAllMocks();

    // 重新设置默认的 mock 返回值
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.user.create.mockResolvedValue({
      id: "user-123",
      username: "testuser",
    });
    mockPrisma.userSettings.create.mockResolvedValue({});
    mockPrisma.chat.create.mockResolvedValue({});
    mockPrisma.message.create.mockResolvedValue({});
    mockPrisma.contact.create.mockResolvedValue({});
    mockPrisma.status.create.mockResolvedValue({});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("main function", () => {
    it("should skip seeding when database already has users", async () => {
      mockPrisma.user.count.mockResolvedValue(1);

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.user.count).toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockPrisma.messageReaction.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.user.deleteMany).not.toHaveBeenCalled();
    });

    it("should create test users with correct data", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");

      const mockUsers = [
        { id: "user-1", username: "serena" },
        { id: "user-2", username: "beyonce" },
        { id: "user-3", username: "messi" },
        { id: "user-4", username: "adele" },
        { id: "user-5", username: "leonardo" },
        { id: "user-6", username: "gisele" },
      ];
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValue({});
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.user.create).toHaveBeenCalledTimes(6);
      expect(mockPrisma.user.create).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          username: "serena",
          email: "serena@whatschat.com",
          status: "On the court.",
        }),
      });
      expect(mockPrisma.user.create).toHaveBeenNthCalledWith(5, {
        data: expect.objectContaining({
          username: "leonardo",
          email: "leonardo@whatschat.com",
          status: "On set.",
        }),
      });
      expect(mockPrisma.user.create).toHaveBeenNthCalledWith(6, {
        data: expect.objectContaining({
          username: "gisele",
          email: "gisele@whatschat.com",
          status: "At the shoot.",
        }),
      });
      expect(mockHash).toHaveBeenCalledWith("123456", 10);
    });

    it("should create user settings for each user", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");
      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({ id: `user-${i}`, username: "u" }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValue({});
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.userSettings.create).toHaveBeenCalledTimes(6);
      expect(mockPrisma.userSettings.create).toHaveBeenNthCalledWith(1, { data: { userId: "user-1" } });
      expect(mockPrisma.userSettings.create).toHaveBeenNthCalledWith(6, { data: { userId: "user-6" } });
    });

    it("should create private and group chats", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");
      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({ id: `user-${i}`, username: "u" }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-1", type: "PRIVATE" });
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-2", type: "GROUP", name: "All Stars" });
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-3", type: "PRIVATE" });
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.chat.create).toHaveBeenCalledTimes(3);
      expect(mockPrisma.chat.create).toHaveBeenNthCalledWith(1, {
        data: {
          type: "PRIVATE",
          participants: { create: [{ userId: "user-1", role: "MEMBER" }, { userId: "user-2", role: "MEMBER" }] },
        },
      });
      expect(mockPrisma.chat.create).toHaveBeenNthCalledWith(2, {
        data: {
          type: "GROUP",
          name: "All Stars",
          avatar: "/placeholder.svg?height=40&width=40&text=A",
          participants: {
            create: [
              { userId: "user-1", role: "ADMIN" },
              { userId: "user-2", role: "MEMBER" },
              { userId: "user-3", role: "MEMBER" },
              { userId: "user-4", role: "MEMBER" },
              { userId: "user-5", role: "MEMBER" },
              { userId: "user-6", role: "MEMBER" },
            ],
          },
        },
      });
      expect(mockPrisma.chat.create).toHaveBeenNthCalledWith(3, {
        data: {
          type: "PRIVATE",
          participants: { create: [{ userId: "user-5", role: "MEMBER" }, { userId: "user-6", role: "MEMBER" }] },
        },
      });
    });

    it("should create test messages", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");
      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({ id: `user-${i}`, username: "u" }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-1", type: "PRIVATE" });
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-2", type: "GROUP", name: "All Stars" });
      mockPrisma.chat.create.mockResolvedValueOnce({ id: "chat-3", type: "PRIVATE" });
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.message.create).toHaveBeenCalledTimes(10);
      expect(mockPrisma.message.create).toHaveBeenNthCalledWith(1, {
        data: { chatId: "chat-1", senderId: "user-1", type: "TEXT", content: "Hey! Welcome to WhatsChat." },
      });
      expect(mockPrisma.message.create).toHaveBeenNthCalledWith(3, {
        data: { chatId: "chat-3", senderId: "user-5", type: "TEXT", content: "See you at the premiere." },
      });
      expect(mockPrisma.message.create).toHaveBeenNthCalledWith(5, {
        data: { chatId: "chat-2", senderId: "user-1", type: "TEXT", content: "Welcome to All Stars!" },
      });
      expect(mockPrisma.message.create).toHaveBeenNthCalledWith(10, {
        data: { chatId: "chat-2", senderId: "user-6", type: "TEXT", content: "Hi all!" },
      });
    });

    it("should create contacts", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");
      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({
        id: `user-${i}`,
        username: "u",
        phone: `+1${i}`,
        email: `u${i}@whatschat.com`,
        avatar: "/placeholder.svg",
      }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValue({});
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.contact.create).toHaveBeenCalledTimes(6);
      expect(mockPrisma.contact.create).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({ ownerId: "user-1", name: "Beyonce" }),
      });
      expect(mockPrisma.contact.create).toHaveBeenNthCalledWith(5, {
        data: expect.objectContaining({ ownerId: "user-5", name: "Gisele" }),
      });
    });

    it("should create status updates", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");
      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({ id: `user-${i}`, username: "u" }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValue({});
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.status.create).toHaveBeenCalledTimes(6);
      expect(mockPrisma.status.create).toHaveBeenNthCalledWith(1, {
        data: { userId: "user-1", type: "TEXT", content: "Match day tomorrow.", expiresAt: expect.any(Date) },
      });
      expect(mockPrisma.status.create).toHaveBeenNthCalledWith(5, {
        data: { userId: "user-5", type: "TEXT", content: "Wrapping the film.", expiresAt: expect.any(Date) },
      });
      expect(mockPrisma.status.create).toHaveBeenNthCalledWith(6, {
        data: { userId: "user-6", type: "TEXT", content: "Vogue cover this week.", expiresAt: expect.any(Date) },
      });
    });

    it("should handle errors gracefully", async () => {
      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockRejectedValue(new Error("Hashing failed"));

      const { main } = await import("@/database/seed");

      await expect(main()).rejects.toThrow("Hashing failed");
    });

    it("should not clean data in production mode", async () => {
      // Mock config for production
      vi.doMock("../../../src/config", () => ({
        default: {
          server: {
            isDevelopment: false,
          },
          security: {
            bcrypt: {
              saltRounds: 10,
            },
          },
        },
      }));

      const mockHash = vi.mocked(bcrypt.hash);
      mockHash.mockResolvedValue("hashed-password");

      const mockUsers = [1, 2, 3, 4, 5, 6].map((i) => ({ id: `user-${i}`, username: "u" }));
      mockUsers.forEach((u) => mockPrisma.user.create.mockResolvedValueOnce(u));
      mockPrisma.userSettings.create.mockResolvedValue({});
      mockPrisma.chat.create.mockResolvedValue({});
      mockPrisma.message.create.mockResolvedValue({});
      mockPrisma.contact.create.mockResolvedValue({});
      mockPrisma.status.create.mockResolvedValue({});

      const { main } = await import("@/database/seed");
      await main();

      expect(mockPrisma.user.create).toHaveBeenCalledTimes(6);
    });
  });
});
