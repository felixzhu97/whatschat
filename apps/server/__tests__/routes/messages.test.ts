import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import { messageRoutes, setMessageService } from "@/routes/messages";

// Mock dependencies
vi.mock("@/services/message", () => ({
  MessageService: vi.fn().mockImplementation(() => ({
    createMessage: vi.fn(),
    getMessages: vi.fn(),
    updateMessage: vi.fn(),
    deleteMessage: vi.fn(),
  })),
}));

vi.mock("@/middleware/auth", () => ({
  authMiddleware: vi.fn((req: any, res: any, next: any) => {
    req.user = { id: "user-123", username: "testuser" };
    next();
  }),
}));

describe("Message Routes", () => {
  let app: express.Application;
  let messageService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/messages", messageRoutes);

    // Get the mocked MessageService instance
    const { MessageService } = await import("@/services/message");
    messageService = new MessageService();

    // Mock the service methods with default return values
    messageService.getMessages = vi.fn().mockResolvedValue([]);
    messageService.createMessage = vi.fn().mockResolvedValue({});
    messageService.updateMessage = vi.fn().mockResolvedValue({});
    messageService.deleteMessage = vi.fn().mockResolvedValue({});

    // Set the mock service in the route
    setMessageService(messageService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /messages/:chatId", () => {
    it("should get messages successfully", async () => {
      const mockMessages = [
        {
          id: "message-1",
          content: "Hello world",
          type: "text",
          senderId: "user-123",
          chatId: "chat-123",
          createdAt: "2025-10-03T11:02:40.886Z",
          sender: {
            id: "user-123",
            username: "testuser",
            avatar: null,
          },
        },
      ];

      messageService.getMessages.mockResolvedValue(mockMessages);

      const response = await request(app).get("/messages/chat-123").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockMessages,
      });

      expect(messageService.getMessages).toHaveBeenCalledWith("chat-123", {
        page: 1,
        limit: 20,
        search: undefined,
      });
    });

    it("should get messages with pagination", async () => {
      const mockMessages = [];
      messageService.getMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get("/messages/chat-123")
        .query({ page: "2", limit: "10" })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockMessages,
      });

      expect(messageService.getMessages).toHaveBeenCalledWith("chat-123", {
        page: 2,
        limit: 10,
        search: undefined,
      });
    });

    it("should get messages with search", async () => {
      const mockMessages = [];
      messageService.getMessages.mockResolvedValue(mockMessages);

      const response = await request(app)
        .get("/messages/chat-123")
        .query({ search: "hello" })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockMessages,
      });

      expect(messageService.getMessages).toHaveBeenCalledWith("chat-123", {
        page: 1,
        limit: 20,
        search: "hello",
      });
    });

    it("should handle service errors", async () => {
      messageService.getMessages.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/messages/chat-123").expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "获取消息失败",
      });
    });
  });

  describe("POST /messages", () => {
    it("should create message successfully", async () => {
      const mockMessage = {
        id: "message-1",
        content: "Hello world",
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          type: "text",
          chatId: "chat-123",
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: "消息发送成功",
        data: mockMessage,
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: "Hello world",
        type: "text",
        chatId: "chat-123",
        senderId: "user-123",
        metadata: undefined,
      });
    });

    it("should create message with metadata", async () => {
      const mockMessage = {
        id: "message-1",
        content: "https://example.com/image.jpg",
        type: "image",
        senderId: "user-123",
        chatId: "chat-123",
        metadata: { width: 1920, height: 1080 },
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: "https://example.com/image.jpg",
          type: "image",
          chatId: "chat-123",
          metadata: { width: 1920, height: 1080 },
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: "消息发送成功",
        data: mockMessage,
      });

      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: "https://example.com/image.jpg",
        type: "image",
        chatId: "chat-123",
        senderId: "user-123",
        metadata: { width: 1920, height: 1080 },
      });
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          // Missing type and chatId
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "验证错误：缺少必填字段",
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
    });

    it("should validate message type", async () => {
      const response = await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          type: "INVALID_TYPE",
          chatId: "chat-123",
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "消息类型无效",
      });

      expect(messageService.createMessage).not.toHaveBeenCalled();
    });

    it("should handle chat not found error", async () => {
      messageService.createMessage.mockRejectedValue(new Error("聊天不存在"));

      const response = await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          type: "text",
          chatId: "non-existent-chat",
        })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "聊天不存在",
      });
    });

    it("should handle service errors", async () => {
      messageService.createMessage.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          type: "text",
          chatId: "chat-123",
        })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "发送消息失败",
      });
    });
  });

  describe("PUT /messages/:messageId", () => {
    it("should update message successfully", async () => {
      const mockMessage = {
        id: "message-1",
        content: "Updated message",
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        updatedAt: "2025-10-03T11:02:42.191Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.updateMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .put("/messages/message-1")
        .send({
          content: "Updated message",
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "消息更新成功",
        data: mockMessage,
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith("message-1", {
        content: "Updated message",
      });
    });

    it("should handle message not found error", async () => {
      messageService.updateMessage.mockRejectedValue(new Error("消息不存在"));

      const response = await request(app)
        .put("/messages/non-existent-message")
        .send({
          content: "Updated message",
        })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "消息不存在",
      });
    });

    it("should handle service errors", async () => {
      messageService.updateMessage.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .put("/messages/message-1")
        .send({
          content: "Updated message",
        })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "更新消息失败",
      });
    });
  });

  describe("DELETE /messages/:messageId", () => {
    it("should delete message successfully", async () => {
      messageService.deleteMessage.mockResolvedValue({});

      const response = await request(app)
        .delete("/messages/message-1")
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "消息删除成功",
      });

      expect(messageService.deleteMessage).toHaveBeenCalledWith("message-1");
    });

    it("should handle message not found error", async () => {
      messageService.deleteMessage.mockRejectedValue(new Error("消息不存在"));

      const response = await request(app)
        .delete("/messages/non-existent-message")
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "消息不存在",
      });
    });

    it("should handle service errors", async () => {
      messageService.deleteMessage.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .delete("/messages/message-1")
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "删除消息失败",
      });
    });
  });

  describe("authentication", () => {
    it("should require authentication for all routes", async () => {
      // Mock auth middleware to throw error
      const { authMiddleware } = await import("@/middleware/auth");
      vi.mocked(authMiddleware).mockImplementation((req, res, next) => {
        res.status(401).json({ message: "Unauthorized" });
      });

      // Re-create app with mocked auth middleware
      app = express();
      app.use(express.json());
      app.use("/messages", messageRoutes);

      await request(app).get("/messages/chat-123").expect(401);

      await request(app)
        .post("/messages")
        .send({
          content: "Hello world",
          type: "text",
          chatId: "chat-123",
        })
        .expect(401);

      await request(app)
        .put("/messages/message-1")
        .send({
          content: "Updated message",
        })
        .expect(401);

      await request(app).delete("/messages/message-1").expect(401);
    });
  });

  describe("input validation", () => {
    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);

      // Express will handle JSON parsing errors
      expect(response.body).toBeDefined();
    });

    it("should handle empty request body", async () => {
      const response = await request(app)
        .post("/messages")
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "验证错误：缺少必填字段",
      });
    });

    it("should handle null values in request body", async () => {
      const response = await request(app)
        .post("/messages")
        .send({
          content: null,
          type: null,
          chatId: null,
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "验证错误：缺少必填字段",
      });
    });

    it("should handle undefined values in request body", async () => {
      const response = await request(app)
        .post("/messages")
        .send({
          content: undefined,
          type: undefined,
          chatId: undefined,
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "验证错误：缺少必填字段",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle very long content", async () => {
      const longContent = "a".repeat(10000);
      const mockMessage = {
        id: "message-1",
        content: longContent,
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: longContent,
          type: "text",
          chatId: "chat-123",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(messageService.createMessage).toHaveBeenCalledWith({
        content: longContent,
        type: "text",
        chatId: "chat-123",
        senderId: "user-123",
        metadata: undefined,
      });
    });

    it("should handle empty content", async () => {
      const mockMessage = {
        id: "message-1",
        content: "",
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: "",
          type: "text",
          chatId: "chat-123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("验证错误");
    });

    it("should handle special characters in content", async () => {
      const specialContent = "Hello! @#$%^&*()_+-=[]{}|;':\",./<>?`~";
      const mockMessage = {
        id: "message-1",
        content: specialContent,
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: specialContent,
          type: "text",
          chatId: "chat-123",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it("should handle Unicode characters in content", async () => {
      const unicodeContent = "Hello 世界! 🌍 你好！";
      const mockMessage = {
        id: "message-1",
        content: unicodeContent,
        type: "text",
        senderId: "user-123",
        chatId: "chat-123",
        createdAt: "2025-10-03T11:04:26.581Z",
        sender: {
          id: "user-123",
          username: "testuser",
          avatar: null,
        },
      };

      messageService.createMessage.mockResolvedValue(mockMessage);

      const response = await request(app)
        .post("/messages")
        .send({
          content: unicodeContent,
          type: "text",
          chatId: "chat-123",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
