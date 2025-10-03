import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import chatRoutes from "../../src/routes/chats";

describe("Chat Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/chats", chatRoutes);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /chats", () => {
    it("should return chat list message", async () => {
      const response = await request(app).get("/chats").expect(200);

      expect(response.body).toEqual({
        message: "获取聊天列表",
      });
    });
  });

  describe("POST /chats", () => {
    it("should return create chat message", async () => {
      const response = await request(app)
        .post("/chats")
        .send({
          name: "Test Chat",
          type: "group",
        })
        .expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });

    it("should handle empty request body", async () => {
      const response = await request(app).post("/chats").send({}).expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });

    it("should handle request with data", async () => {
      const chatData = {
        name: "New Group Chat",
        type: "group",
        participants: ["user-1", "user-2"],
      };

      const response = await request(app)
        .post("/chats")
        .send(chatData)
        .expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });
  });

  describe("GET /chats/:id", () => {
    it("should return chat details with ID", async () => {
      const chatId = "chat-123";

      const response = await request(app).get(`/chats/${chatId}`).expect(200);

      expect(response.body).toEqual({
        message: "获取聊天详情",
        chatId: chatId,
      });
    });

    it("should handle different chat IDs", async () => {
      const chatIds = ["chat-1", "chat-2", "chat-abc", "chat-xyz"];

      for (const chatId of chatIds) {
        const response = await request(app).get(`/chats/${chatId}`).expect(200);

        expect(response.body).toEqual({
          message: "获取聊天详情",
          chatId: chatId,
        });
      }
    });

    it("should handle special characters in chat ID", async () => {
      const specialIds = ["chat-123-456", "chat_123", "chat.123", "chat@123"];

      for (const chatId of specialIds) {
        const response = await request(app).get(`/chats/${chatId}`).expect(200);

        expect(response.body).toEqual({
          message: "获取聊天详情",
          chatId: chatId,
        });
      }
    });
  });

  describe("PUT /chats/:id", () => {
    it("should return update chat message with ID", async () => {
      const chatId = "chat-123";
      const updateData = {
        name: "Updated Chat Name",
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/chats/${chatId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新聊天信息",
        chatId: chatId,
      });
    });

    it("should handle empty request body", async () => {
      const chatId = "chat-123";

      const response = await request(app)
        .put(`/chats/${chatId}`)
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        message: "更新聊天信息",
        chatId: chatId,
      });
    });

    it("should handle different update data", async () => {
      const chatId = "chat-123";
      const updateData = {
        name: "New Name",
        type: "private",
        avatar: "https://example.com/avatar.jpg",
        settings: {
          notifications: true,
          mute: false,
        },
      };

      const response = await request(app)
        .put(`/chats/${chatId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新聊天信息",
        chatId: chatId,
      });
    });
  });

  describe("DELETE /chats/:id", () => {
    it("should return delete chat message with ID", async () => {
      const chatId = "chat-123";

      const response = await request(app)
        .delete(`/chats/${chatId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除聊天",
        chatId: chatId,
      });
    });

    it("should handle different chat IDs", async () => {
      const chatIds = ["chat-1", "chat-2", "chat-abc", "chat-xyz"];

      for (const chatId of chatIds) {
        const response = await request(app)
          .delete(`/chats/${chatId}`)
          .expect(200);

        expect(response.body).toEqual({
          message: "删除聊天",
          chatId: chatId,
        });
      }
    });
  });

  describe("POST /chats/:id/archive", () => {
    it("should return archive chat message with ID", async () => {
      const chatId = "chat-123";

      const response = await request(app)
        .post(`/chats/${chatId}/archive`)
        .expect(200);

      expect(response.body).toEqual({
        message: "归档聊天",
        chatId: chatId,
      });
    });

    it("should handle different chat IDs", async () => {
      const chatIds = ["chat-1", "chat-2", "chat-abc", "chat-xyz"];

      for (const chatId of chatIds) {
        const response = await request(app)
          .post(`/chats/${chatId}/archive`)
          .expect(200);

        expect(response.body).toEqual({
          message: "归档聊天",
          chatId: chatId,
        });
      }
    });

    it("should handle request with data", async () => {
      const chatId = "chat-123";
      const archiveData = {
        reason: "No longer needed",
        permanent: false,
      };

      const response = await request(app)
        .post(`/chats/${chatId}/archive`)
        .send(archiveData)
        .expect(200);

      expect(response.body).toEqual({
        message: "归档聊天",
        chatId: chatId,
      });
    });
  });

  describe("POST /chats/:id/mute", () => {
    it("should return mute chat message with ID", async () => {
      const chatId = "chat-123";

      const response = await request(app)
        .post(`/chats/${chatId}/mute`)
        .expect(200);

      expect(response.body).toEqual({
        message: "静音聊天",
        chatId: chatId,
      });
    });

    it("should handle different chat IDs", async () => {
      const chatIds = ["chat-1", "chat-2", "chat-abc", "chat-xyz"];

      for (const chatId of chatIds) {
        const response = await request(app)
          .post(`/chats/${chatId}/mute`)
          .expect(200);

        expect(response.body).toEqual({
          message: "静音聊天",
          chatId: chatId,
        });
      }
    });

    it("should handle request with mute settings", async () => {
      const chatId = "chat-123";
      const muteData = {
        duration: 24, // hours
        notifications: false,
        sound: false,
      };

      const response = await request(app)
        .post(`/chats/${chatId}/mute`)
        .send(muteData)
        .expect(200);

      expect(response.body).toEqual({
        message: "静音聊天",
        chatId: chatId,
      });
    });
  });

  describe("error handling", () => {
    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .post("/chats")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);

      // Express will handle JSON parsing errors
      expect(response.body).toBeDefined();
    });

    it("should handle malformed URLs", async () => {
      // Test with invalid characters in URL
      const response = await request(app)
        .get("/chats/invalid%20chat%20id")
        .expect(200);

      expect(response.body).toEqual({
        message: "获取聊天详情",
        chatId: "invalid chat id",
      });
    });
  });

  describe("HTTP methods", () => {
    it("should handle OPTIONS request", async () => {
      const response = await request(app).options("/chats").expect(200);

      // Express handles OPTIONS automatically
      expect(response.status).toBe(200);
    });

    it("should handle HEAD request", async () => {
      const response = await request(app).head("/chats").expect(200);

      expect(response.status).toBe(200);
    });

    it("should handle PATCH request", async () => {
      const chatId = "chat-123";
      const patchData = {
        name: "Patched Name",
      };

      const response = await request(app)
        .patch(`/chats/${chatId}`)
        .send(patchData)
        .expect(404); // PATCH is not implemented

      expect(response.status).toBe(404);
    });
  });

  describe("concurrent requests", () => {
    it("should handle multiple simultaneous requests", async () => {
      const requests = [
        request(app).get("/chats"),
        request(app).get("/chats/chat-1"),
        request(app).get("/chats/chat-2"),
        request(app).post("/chats").send({ name: "Test" }),
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].body.message).toBe("获取聊天列表");
      expect(responses[1].body.message).toBe("获取聊天详情");
      expect(responses[2].body.message).toBe("获取聊天详情");
      expect(responses[3].body.message).toBe("创建聊天");
    });
  });

  describe("edge cases", () => {
    it("should handle very long chat IDs", async () => {
      const longChatId = "chat-" + "a".repeat(1000);

      const response = await request(app)
        .get(`/chats/${longChatId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取聊天详情",
        chatId: longChatId,
      });
    });

    it("should handle empty chat ID", async () => {
      const response = await request(app).get("/chats/").expect(200);

      expect(response.status).toBe(200);
    });

    it("should handle special characters in chat ID", async () => {
      const specialChatId = "chat-123!@#$%^&*()";

      const response = await request(app)
        .get(`/chats/${specialChatId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取聊天详情",
        chatId: "chat-123!@",
      });
    });

    it("should handle Unicode characters in chat ID", async () => {
      const unicodeChatId = encodeURIComponent("chat-世界-123");

      const response = await request(app)
        .get(`/chats/${unicodeChatId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取聊天详情",
        chatId: "chat-世界-123",
      });
    });
  });

  describe("request body handling", () => {
    it("should handle large request bodies", async () => {
      const largeData = {
        name: "Large Chat",
        description: "a".repeat(10000),
        participants: Array.from({ length: 1000 }, (_, i) => `user-${i}`),
        settings: {
          notifications: true,
          mute: false,
          customSettings: Array.from({ length: 100 }, (_, i) => ({
            key: `setting-${i}`,
            value: `value-${i}`,
          })),
        },
      };

      const response = await request(app)
        .post("/chats")
        .send(largeData)
        .expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });

    it("should handle nested objects in request body", async () => {
      const nestedData = {
        name: "Nested Chat",
        settings: {
          notifications: {
            sound: true,
            vibration: false,
            desktop: true,
          },
          privacy: {
            showLastSeen: true,
            showReadReceipts: false,
            allowInvites: true,
          },
        },
        metadata: {
          createdBy: "user-123",
          tags: ["work", "important"],
          customFields: {
            department: "Engineering",
            priority: "high",
          },
        },
      };

      const response = await request(app)
        .post("/chats")
        .send(nestedData)
        .expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });

    it("should handle arrays in request body", async () => {
      const arrayData = {
        name: "Array Chat",
        participants: ["user-1", "user-2", "user-3"],
        tags: ["tag1", "tag2", "tag3"],
        permissions: [
          { userId: "user-1", role: "admin" },
          { userId: "user-2", role: "member" },
          { userId: "user-3", role: "member" },
        ],
      };

      const response = await request(app)
        .post("/chats")
        .send(arrayData)
        .expect(200);

      expect(response.body).toEqual({
        message: "创建聊天",
      });
    });
  });
});
