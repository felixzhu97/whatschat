import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import userRoutes from "../../src/routes/users";

describe("User Routes", () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use("/users", userRoutes);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /users", () => {
    it("should return user list message", async () => {
      const response = await request(app).get("/users").expect(200);

      expect(response.body).toEqual({
        message: "获取用户列表",
      });
    });

    it("should handle valid pagination parameters", async () => {
      const response = await request(app)
        .get("/users")
        .query({ page: "1", limit: "10" })
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户列表",
      });
    });

    it("should handle search parameter", async () => {
      const response = await request(app)
        .get("/users")
        .query({ search: "john" })
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户列表",
      });
    });

    it("should handle all query parameters", async () => {
      const response = await request(app)
        .get("/users")
        .query({ page: "2", limit: "20", search: "alice" })
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户列表",
      });
    });

    it("should validate page parameter", async () => {
      const response = await request(app)
        .get("/users")
        .query({ page: "0" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should validate limit parameter", async () => {
      const response = await request(app)
        .get("/users")
        .query({ limit: "101" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should validate search parameter", async () => {
      const response = await request(app)
        .get("/users")
        .query({ search: "" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /users/:id", () => {
    it("should return user details with ID", async () => {
      const userId = "user-123";

      const response = await request(app).get(`/users/${userId}`).expect(200);

      expect(response.body).toEqual({
        message: "获取用户详情",
        userId: userId,
      });
    });

    it("should handle different user IDs", async () => {
      const userIds = ["user-1", "user-2", "user-abc", "user-xyz"];

      for (const userId of userIds) {
        const response = await request(app).get(`/users/${userId}`).expect(200);

        expect(response.body).toEqual({
          message: "获取用户详情",
          userId: userId,
        });
      }
    });

    it("should handle special characters in user ID", async () => {
      const specialIds = ["user-123-456", "user_123", "user.123", "user@123"];

      for (const userId of specialIds) {
        const response = await request(app).get(`/users/${userId}`).expect(200);

        expect(response.body).toEqual({
          message: "获取用户详情",
          userId: userId,
        });
      }
    });
  });

  describe("PUT /users/:id", () => {
    it("should return update user message with ID", async () => {
      const userId = "user-123";
      const updateData = {
        username: "newusername",
        email: "newemail@example.com",
        status: "在线",
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: userId,
      });
    });

    it("should handle empty request body", async () => {
      const userId = "user-123";

      const response = await request(app)
        .put(`/users/${userId}`)
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: userId,
      });
    });

    it("should handle different update data", async () => {
      const userId = "user-123";
      const updateData = {
        username: "updateduser",
        email: "updated@example.com",
        phone: "+1234567890",
        avatar: "https://example.com/avatar.jpg",
        status: "忙碌中...",
        settings: {
          notifications: true,
          privacy: "public",
        },
      };

      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: userId,
      });
    });
  });

  describe("DELETE /users/:id", () => {
    it("should return delete user message with ID", async () => {
      const userId = "user-123";

      const response = await request(app)
        .delete(`/users/${userId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "删除用户",
        userId: userId,
      });
    });

    it("should handle different user IDs", async () => {
      const userIds = ["user-1", "user-2", "user-abc", "user-xyz"];

      for (const userId of userIds) {
        const response = await request(app)
          .delete(`/users/${userId}`)
          .expect(200);

        expect(response.body).toEqual({
          message: "删除用户",
          userId: userId,
        });
      }
    });
  });

  describe("POST /users/:id/block", () => {
    it("should return block user message with ID", async () => {
      const userId = "user-123";

      const response = await request(app)
        .post(`/users/${userId}/block`)
        .expect(200);

      expect(response.body).toEqual({
        message: "阻止用户",
        userId: userId,
      });
    });

    it("should handle different user IDs", async () => {
      const userIds = ["user-1", "user-2", "user-abc", "user-xyz"];

      for (const userId of userIds) {
        const response = await request(app)
          .post(`/users/${userId}/block`)
          .expect(200);

        expect(response.body).toEqual({
          message: "阻止用户",
          userId: userId,
        });
      }
    });

    it("should handle request with block data", async () => {
      const userId = "user-123";
      const blockData = {
        reason: "Spam",
        permanent: false,
        duration: 24, // hours
      };

      const response = await request(app)
        .post(`/users/${userId}/block`)
        .send(blockData)
        .expect(200);

      expect(response.body).toEqual({
        message: "阻止用户",
        userId: userId,
      });
    });
  });

  describe("DELETE /users/:id/block", () => {
    it("should return unblock user message with ID", async () => {
      const userId = "user-123";

      const response = await request(app)
        .delete(`/users/${userId}/block`)
        .expect(200);

      expect(response.body).toEqual({
        message: "取消阻止用户",
        userId: userId,
      });
    });

    it("should handle different user IDs", async () => {
      const userIds = ["user-1", "user-2", "user-abc", "user-xyz"];

      for (const userId of userIds) {
        const response = await request(app)
          .delete(`/users/${userId}/block`)
          .expect(200);

        expect(response.body).toEqual({
          message: "取消阻止用户",
          userId: userId,
        });
      }
    });
  });

  describe("validation", () => {
    it("should validate page parameter range", async () => {
      const invalidPages = ["0", "-1", "abc", "1.5"];

      for (const page of invalidPages) {
        const response = await request(app)
          .get("/users")
          .query({ page })
          .expect(400);

        expect(response.body.errors).toBeDefined();
      }
    });

    it("should validate limit parameter range", async () => {
      const invalidLimits = ["0", "101", "abc", "1.5"];

      for (const limit of invalidLimits) {
        const response = await request(app)
          .get("/users")
          .query({ limit })
          .expect(400);

        expect(response.body.errors).toBeDefined();
      }
    });

    it("should validate search parameter length", async () => {
      const response = await request(app)
        .get("/users")
        .query({ search: "" })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should accept valid parameters", async () => {
      const validParams = [
        { page: "1", limit: "1" },
        { page: "999", limit: "100" },
        { search: "a" },
        { search: "a".repeat(100) },
      ];

      for (const params of validParams) {
        const response = await request(app)
          .get("/users")
          .query(params)
          .expect(200);

        expect(response.body.message).toBe("获取用户列表");
      }
    });
  });

  describe("error handling", () => {
    it("should handle invalid JSON in request body", async () => {
      const response = await request(app)
        .put("/users/user-123")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);

      // Express will handle JSON parsing errors
      expect(response.body).toBeDefined();
    });

    it("should handle malformed URLs", async () => {
      const response = await request(app)
        .get("/users/invalid%20user%20id")
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户详情",
        userId: "invalid user id",
      });
    });
  });

  describe("HTTP methods", () => {
    it("should handle OPTIONS request", async () => {
      const response = await request(app).options("/users").expect(200);

      expect(response.status).toBe(200);
    });

    it("should handle HEAD request", async () => {
      const response = await request(app).head("/users").expect(200);

      expect(response.status).toBe(200);
    });

    it("should handle PATCH request", async () => {
      const userId = "user-123";
      const patchData = {
        username: "Patched Username",
      };

      const response = await request(app)
        .patch(`/users/${userId}`)
        .send(patchData)
        .expect(404); // PATCH is not implemented

      expect(response.status).toBe(404);
    });
  });

  describe("concurrent requests", () => {
    it("should handle multiple simultaneous requests", async () => {
      const requests = [
        request(app).get("/users"),
        request(app).get("/users/user-1"),
        request(app).get("/users/user-2"),
        request(app).post("/users/user-1/block"),
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].body.message).toBe("获取用户列表");
      expect(responses[1].body.message).toBe("获取用户详情");
      expect(responses[2].body.message).toBe("获取用户详情");
      expect(responses[3].body.message).toBe("阻止用户");
    });
  });

  describe("edge cases", () => {
    it("should handle very long user IDs", async () => {
      const longUserId = "user-" + "a".repeat(1000);

      const response = await request(app)
        .get(`/users/${longUserId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户详情",
        userId: longUserId,
      });
    });

    it("should handle empty user ID", async () => {
      const response = await request(app).get("/users/").expect(200);

      expect(response.status).toBe(200);
    });

    it("should handle special characters in user ID", async () => {
      const specialUserId = "user-123!@#$%^&*()";

      const response = await request(app)
        .get(`/users/${specialUserId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户详情",
        userId: "user-123!@",
      });
    });

    it("should handle Unicode characters in user ID", async () => {
      const unicodeUserId = encodeURIComponent("user-世界-123");

      const response = await request(app)
        .get(`/users/${unicodeUserId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: "获取用户详情",
        userId: "user-世界-123",
      });
    });
  });

  describe("request body handling", () => {
    it("should handle large request bodies", async () => {
      const largeData = {
        username: "largeuser",
        email: "large@example.com",
        bio: "a".repeat(10000),
        settings: {
          notifications: true,
          privacy: "private",
          customSettings: Array.from({ length: 100 }, (_, i) => ({
            key: `setting-${i}`,
            value: `value-${i}`,
          })),
        },
      };

      const response = await request(app)
        .put("/users/user-123")
        .send(largeData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: "user-123",
      });
    });

    it("should handle nested objects in request body", async () => {
      const nestedData = {
        username: "nesteduser",
        profile: {
          personal: {
            firstName: "John",
            lastName: "Doe",
            age: 30,
          },
          contact: {
            email: "john@example.com",
            phone: "+1234567890",
          },
        },
        preferences: {
          notifications: {
            email: true,
            push: false,
            sms: true,
          },
          privacy: {
            showEmail: false,
            showPhone: true,
            showLastSeen: true,
          },
        },
      };

      const response = await request(app)
        .put("/users/user-123")
        .send(nestedData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: "user-123",
      });
    });

    it("should handle arrays in request body", async () => {
      const arrayData = {
        username: "arrayuser",
        tags: ["tag1", "tag2", "tag3"],
        friends: ["user-1", "user-2", "user-3"],
        permissions: [
          { resource: "profile", action: "read" },
          { resource: "messages", action: "write" },
          { resource: "settings", action: "update" },
        ],
      };

      const response = await request(app)
        .put("/users/user-123")
        .send(arrayData)
        .expect(200);

      expect(response.body).toEqual({
        message: "更新用户信息",
        userId: "user-123",
      });
    });
  });
});
