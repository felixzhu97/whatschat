import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import request from "supertest";
import express from "express";
import { createApp } from "../../src/app";
import { prisma } from "../../src/database/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock Prisma for integration tests
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
      findMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe.skip("API Integration Tests", () => {
  let app: express.Application;
  let testUser: any;
  let authToken: string;
  let testChat: any;

  beforeAll(async () => {
    // Set up test environment
    process.env.JWT_SECRET = "test-secret-key";
    process.env.JWT_EXPIRES_IN = "7d";

    // Create app instance
    app = createApp();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.message.deleteMany({
      where: { senderId: { contains: "test-" } },
    });
    await prisma.chatParticipant.deleteMany({
      where: { userId: { contains: "test-" } },
    });
    await prisma.chat.deleteMany({
      where: { name: { contains: "Test Chat" } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: "test@" } },
    });
  });

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    testUser = {
      id: "test-user-1",
      email: "test@example.com",
      username: "testuser",
      password: hashedPassword,
      phone: "+1234567890",
      status: "online",
    };

    // Mock Prisma user creation
    vi.mocked(prisma.user.create).mockResolvedValue(testUser);

    // Generate auth token
    authToken = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Create test chat
    testChat = {
      id: "test-chat-1",
      name: "Test Chat",
      type: "private",
    };

    // Mock Prisma chat creation
    vi.mocked(prisma.chat.create).mockResolvedValue(testChat);

    // Mock chat participant creation
    vi.mocked(prisma.chatParticipant.create).mockResolvedValue({
      chatId: testChat.id,
      userId: testUser.id,
      role: "member",
    });

    // Mock deleteMany operations
    vi.mocked(prisma.message.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.chatParticipant.deleteMany).mockResolvedValue({
      count: 0,
    });
    vi.mocked(prisma.chat.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.user.deleteMany).mockResolvedValue({ count: 0 });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.message.deleteMany({
      where: { chatId: testChat.id },
    });
  });

  describe("Authentication Flow", () => {
    it("should complete full authentication flow", async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          email: "newuser@example.com",
          password: "password123",
          username: "newuser",
          phone: "+1234567891",
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe("newuser@example.com");
      expect(registerResponse.body.data.token).toBeDefined();

      const newUserToken = registerResponse.body.data.token;

      // 2. Login with new user
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "newuser@example.com",
        password: "password123",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.user.email).toBe("newuser@example.com");

      // 3. Get current user
      const meResponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${newUserToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data.email).toBe("newuser@example.com");

      // 4. Update profile
      const updateResponse = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${newUserToken}`)
        .send({
          username: "updateduser",
          phone: "+1234567892",
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.username).toBe("updateduser");

      // 5. Change password
      const changePasswordResponse = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${newUserToken}`)
        .send({
          currentPassword: "password123",
          newPassword: "newpassword123",
        });

      expect(changePasswordResponse.status).toBe(200);
      expect(changePasswordResponse.body.success).toBe(true);

      // 6. Login with new password
      const newLoginResponse = await request(app).post("/api/auth/login").send({
        email: "newuser@example.com",
        password: "newpassword123",
      });

      expect(newLoginResponse.status).toBe(200);
      expect(newLoginResponse.body.success).toBe(true);

      // 7. Logout
      const logoutResponse = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${newUserToken}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);

      // Clean up
      await prisma.user.delete({
        where: { email: "newuser@example.com" },
      });
    });

    it("should handle authentication errors", async () => {
      // Invalid login
      const invalidLoginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        });

      expect(invalidLoginResponse.status).toBe(401);
      expect(invalidLoginResponse.body.success).toBe(false);

      // Invalid token
      const invalidTokenResponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(invalidTokenResponse.status).toBe(401);
      expect(invalidTokenResponse.body.success).toBe(false);

      // Missing token
      const missingTokenResponse = await request(app).get("/api/auth/me");

      expect(missingTokenResponse.status).toBe(401);
      expect(missingTokenResponse.body.success).toBe(false);
    });
  });

  describe("Message Flow", () => {
    it("should complete full message flow", async () => {
      // 1. Send message
      const sendMessageResponse = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Hello, world!",
          type: "text",
          chatId: testChat.id,
        });

      expect(sendMessageResponse.status).toBe(201);
      expect(sendMessageResponse.body.success).toBe(true);
      expect(sendMessageResponse.body.data.content).toBe("Hello, world!");

      const messageId = sendMessageResponse.body.data.id;

      // 2. Get messages
      const getMessagesResponse = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 });

      expect(getMessagesResponse.status).toBe(200);
      expect(getMessagesResponse.body.success).toBe(true);
      expect(getMessagesResponse.body.data).toHaveLength(1);
      expect(getMessagesResponse.body.data[0].content).toBe("Hello, world!");

      // 3. Update message
      const updateMessageResponse = await request(app)
        .put(`/api/messages/${messageId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Updated message!",
        });

      expect(updateMessageResponse.status).toBe(200);
      expect(updateMessageResponse.body.success).toBe(true);
      expect(updateMessageResponse.body.data.content).toBe("Updated message!");

      // 4. Search messages
      const searchResponse = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ search: "Updated" });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data).toHaveLength(1);
      expect(searchResponse.body.data[0].content).toBe("Updated message!");

      // 5. Delete message
      const deleteMessageResponse = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteMessageResponse.status).toBe(200);
      expect(deleteMessageResponse.body.success).toBe(true);

      // 6. Verify message is deleted
      const verifyDeleteResponse = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(verifyDeleteResponse.status).toBe(200);
      expect(verifyDeleteResponse.body.data).toHaveLength(0);
    });

    it("should handle message errors", async () => {
      // Send message to non-existent chat
      const invalidChatResponse = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Hello!",
          type: "text",
          chatId: "non-existent-chat",
        });

      expect(invalidChatResponse.status).toBe(404);
      expect(invalidChatResponse.body.success).toBe(false);

      // Send message without required fields
      const missingFieldsResponse = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: "Hello!",
          // Missing type and chatId
        });

      expect(missingFieldsResponse.status).toBe(400);
      expect(missingFieldsResponse.body.success).toBe(false);

      // Get messages from non-existent chat
      const invalidGetResponse = await request(app)
        .get("/api/messages/non-existent-chat")
        .set("Authorization", `Bearer ${authToken}`);

      expect(invalidGetResponse.status).toBe(404);
      expect(invalidGetResponse.body.success).toBe(false);
    });
  });

  describe("Chat Management", () => {
    it("should create and manage chats", async () => {
      // 1. Create new chat
      const createChatResponse = await request(app)
        .post("/api/chats")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "New Test Chat",
          type: "private",
          participantIds: [testUser.id],
        });

      expect(createChatResponse.status).toBe(201);
      expect(createChatResponse.body.success).toBe(true);
      expect(createChatResponse.body.data.name).toBe("New Test Chat");

      const newChatId = createChatResponse.body.data.id;

      // 2. Get user chats
      const getChatsResponse = await request(app)
        .get("/api/chats")
        .set("Authorization", `Bearer ${authToken}`);

      expect(getChatsResponse.status).toBe(200);
      expect(getChatsResponse.body.success).toBe(true);
      expect(getChatsResponse.body.data.length).toBeGreaterThan(0);

      // 3. Get specific chat
      const getChatResponse = await request(app)
        .get(`/api/chats/${newChatId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(getChatResponse.status).toBe(200);
      expect(getChatResponse.body.success).toBe(true);
      expect(getChatResponse.body.data.name).toBe("New Test Chat");

      // 4. Update chat
      const updateChatResponse = await request(app)
        .put(`/api/chats/${newChatId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Updated Chat Name",
        });

      expect(updateChatResponse.status).toBe(200);
      expect(updateChatResponse.body.success).toBe(true);
      expect(updateChatResponse.body.data.name).toBe("Updated Chat Name");

      // 5. Delete chat
      const deleteChatResponse = await request(app)
        .delete(`/api/chats/${newChatId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteChatResponse.status).toBe(200);
      expect(deleteChatResponse.body.success).toBe(true);
    });
  });

  describe("User Management", () => {
    it("should manage user profiles and contacts", async () => {
      // 1. Search users
      const searchResponse = await request(app)
        .get("/api/users/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ q: "test" });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);

      // 2. Get user profile
      const profileResponse = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe("test@example.com");

      // 3. Update user status
      const statusResponse = await request(app)
        .put(`/api/users/${testUser.id}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "away",
        });

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data.status).toBe("away");
    });
  });

  describe("File Upload", () => {
    it("should handle file uploads", async () => {
      // Mock file upload
      const fileContent = Buffer.from("test file content");

      const uploadResponse = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("file", fileContent, "test.txt");

      expect(uploadResponse.status).toBe(200);
      expect(uploadResponse.body.success).toBe(true);
      expect(uploadResponse.body.data.url).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle server errors gracefully", async () => {
      // Test with invalid data that might cause server errors
      const invalidResponse = await request(app)
        .post("/api/messages")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          content: null,
          type: "invalid-type",
          chatId: null,
        });

      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body.success).toBe(false);
    });

    it("should handle rate limiting", async () => {
      // Send multiple requests rapidly
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app)
            .post("/api/messages")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
              content: "Rate limit test",
              type: "text",
              chatId: testChat.id,
            })
        );

      const responses = await Promise.all(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe("Database Transactions", () => {
    it("should handle database transactions correctly", async () => {
      // Test that related operations are atomic
      const createChatWithMessageResponse = await request(app)
        .post("/api/chats")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Transaction Test Chat",
          type: "private",
          participantIds: [testUser.id],
          initialMessage: {
            content: "Initial message",
            type: "text",
          },
        });

      expect(createChatWithMessageResponse.status).toBe(201);
      expect(createChatWithMessageResponse.body.success).toBe(true);

      const chatId = createChatWithMessageResponse.body.data.id;

      // Verify chat was created
      const chatResponse = await request(app)
        .get(`/api/chats/${chatId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(chatResponse.status).toBe(200);

      // Verify message was created
      const messagesResponse = await request(app)
        .get(`/api/messages/${chatId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(messagesResponse.status).toBe(200);
      expect(messagesResponse.body.data).toHaveLength(1);
      expect(messagesResponse.body.data[0].content).toBe("Initial message");

      // Clean up
      await prisma.message.deleteMany({
        where: { chatId },
      });
      await prisma.chatParticipant.deleteMany({
        where: { chatId },
      });
      await prisma.chat.delete({
        where: { id: chatId },
      });
    });
  });

  describe("Performance Tests", () => {
    it("should handle large message lists efficiently", async () => {
      // Create many messages
      const messagePromises = Array(50)
        .fill(null)
        .map((_, index) =>
          request(app)
            .post("/api/messages")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
              content: `Message ${index}`,
              type: "text",
              chatId: testChat.id,
            })
        );

      await Promise.all(messagePromises);

      // Test pagination
      const page1Response = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 });

      expect(page1Response.status).toBe(200);
      expect(page1Response.body.data).toHaveLength(20);

      const page2Response = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 2, limit: 20 });

      expect(page2Response.status).toBe(200);
      expect(page2Response.body.data).toHaveLength(20);

      // Test search performance
      const searchResponse = await request(app)
        .get(`/api/messages/${testChat.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .query({ search: "Message 25" });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data).toHaveLength(1);
    });
  });
});
