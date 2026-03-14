import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { MessagesService } from "../../src/application/services/messages.service";
import { PrismaService } from "../../src/infrastructure/database/prisma.service";
import { DatabaseModule } from "../../src/infrastructure/database/database.module";

describe("Messages Service", () => {
  let service: MessagesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [MessagesService],
    })
      .overrideProvider(PrismaService)
      .useValue({
        chat: {
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        message: {
          create: vi.fn(),
          findMany: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      })
      .compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("createMessage", () => {
    it("应该创建消息", async () => {
      const mockChat = { id: "chat-1" };
      const mockMessage = {
        id: "message-1",
        content: "Test message",
        type: "TEXT",
        chatId: "chat-1",
        senderId: "user-1",
      };

      vi.mocked(prisma.chat.findUnique).mockResolvedValue(mockChat as any);
      vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as any);
      vi.mocked(prisma.chat.update).mockResolvedValue(mockChat as any);

      const result = await service.createMessage({
        content: "Test message",
        type: "TEXT",
        chatId: "chat-1",
        senderId: "user-1",
      });

      expect(result).toBeDefined();
      expect(prisma.message.create).toHaveBeenCalled();
    });
  });

  describe("getMessages", () => {
    it("应该获取消息列表", async () => {
      const mockMessages = [
        {
          id: "message-1",
          content: "Test message",
          type: "TEXT",
          sender: { id: "user-1", username: "testuser", avatar: null },
        },
      ];

      vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as any);

      const result = await service.getMessages("chat-1", {
        page: 1,
        limit: 20,
      });

      expect(result).toBeDefined();
      expect(prisma.message.findMany).toHaveBeenCalled();
    });
  });
});
