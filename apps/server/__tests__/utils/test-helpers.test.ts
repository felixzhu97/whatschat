import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  mockPrismaClient,
  mockRedisClient,
  mockSocketIO,
  mockS3Client,
  mockEmailTransporter,
  mockQueue,
  generateMockUsers,
  generateMockMessages,
  generateMockChats,
  cleanupDatabase,
  seedTestData,
  waitFor,
  waitForCondition,
  simulateNetworkError,
  simulateDatabaseError,
  simulateValidationError,
  createMockFile,
  createMockSocket,
  createMockSocketServer,
} from "../utils/test-helpers";

describe("Test Helpers", () => {
  describe("createMockRequest", () => {
    it("应该创建默认的mock请求对象", () => {
      const req = createMockRequest();

      expect(req).toEqual({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
      });
    });

    it("应该合并提供的覆盖参数", () => {
      const overrides = {
        body: { test: "data" },
        params: { id: "123" },
        user: { id: "user-1" },
      };

      const req = createMockRequest(overrides);

      expect(req.body).toEqual({ test: "data" });
      expect(req.params).toEqual({ id: "123" });
      expect(req.user).toEqual({ id: "user-1" });
      expect(req.query).toEqual({});
      expect(req.headers).toEqual({});
    });
  });

  describe("createMockResponse", () => {
    it("应该创建mock响应对象", () => {
      const res = createMockResponse();

      expect(res.status).toBeDefined();
      expect(res.json).toBeDefined();
      expect(res.send).toBeDefined();
      expect(res.cookie).toBeDefined();
      expect(res.clearCookie).toBeDefined();
    });

    it("应该支持链式调用", () => {
      const res = createMockResponse();

      const result = res.status(200).json({ message: "test" });

      expect(result).toBe(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "test" });
    });
  });

  describe("createMockNext", () => {
    it("应该创建mock next函数", () => {
      const next = createMockNext();

      expect(next).toBeDefined();
      expect(typeof next).toBe("function");
    });
  });

  describe("mockPrismaClient", () => {
    it("应该创建mock Prisma客户端", () => {
      const prisma = mockPrismaClient();

      expect(prisma.user).toBeDefined();
      expect(prisma.message).toBeDefined();
      expect(prisma.chat).toBeDefined();
      expect(prisma.contact).toBeDefined();
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
      expect(prisma.$transaction).toBeDefined();
    });

    it("应该包含所有必要的模型方法", () => {
      const prisma = mockPrismaClient();

      expect(prisma.user.create).toBeDefined();
      expect(prisma.user.findUnique).toBeDefined();
      expect(prisma.user.findMany).toBeDefined();
      expect(prisma.user.update).toBeDefined();
      expect(prisma.user.delete).toBeDefined();
      expect(prisma.user.count).toBeDefined();
    });
  });

  describe("mockRedisClient", () => {
    it("应该创建mock Redis客户端", () => {
      const redis = mockRedisClient();

      expect(redis.connect).toBeDefined();
      expect(redis.disconnect).toBeDefined();
      expect(redis.get).toBeDefined();
      expect(redis.set).toBeDefined();
      expect(redis.del).toBeDefined();
      expect(redis.exists).toBeDefined();
      expect(redis.expire).toBeDefined();
      expect(redis.flushall).toBeDefined();
      expect(redis.hget).toBeDefined();
      expect(redis.hset).toBeDefined();
      expect(redis.hdel).toBeDefined();
      expect(redis.sadd).toBeDefined();
      expect(redis.srem).toBeDefined();
      expect(redis.smembers).toBeDefined();
    });
  });

  describe("mockSocketIO", () => {
    it("应该创建mock Socket.IO服务器", () => {
      const io = mockSocketIO();

      expect(io.on).toBeDefined();
      expect(io.emit).toBeDefined();
      expect(io.to).toBeDefined();
      expect(io.join).toBeDefined();
      expect(io.leave).toBeDefined();
      expect(io.use).toBeDefined();
      expect(io.close).toBeDefined();
    });

    it("to方法应该返回具有emit方法的对象", () => {
      const io = mockSocketIO();
      const room = io.to();

      expect(room.emit).toBeDefined();
    });
  });

  describe("mockS3Client", () => {
    it("应该创建mock S3客户端", () => {
      const s3 = mockS3Client();

      expect(s3.upload).toBeDefined();
      expect(s3.deleteObject).toBeDefined();
      expect(s3.getSignedUrl).toBeDefined();
    });

    it("upload方法应该返回具有promise方法的对象", () => {
      const s3 = mockS3Client();
      const upload = s3.upload();

      expect(upload.promise).toBeDefined();
    });

    it("deleteObject方法应该返回具有promise方法的对象", () => {
      const s3 = mockS3Client();
      const deleteObj = s3.deleteObject();

      expect(deleteObj.promise).toBeDefined();
    });
  });

  describe("mockEmailTransporter", () => {
    it("应该创建mock邮件传输器", () => {
      const transporter = mockEmailTransporter();

      expect(transporter.sendMail).toBeDefined();
      expect(transporter.verify).toBeDefined();
    });
  });

  describe("mockQueue", () => {
    it("应该创建mock队列", () => {
      const queue = mockQueue();

      expect(queue.add).toBeDefined();
      expect(queue.process).toBeDefined();
      expect(queue.close).toBeDefined();
      expect(queue.clean).toBeDefined();
      expect(queue.getJobs).toBeDefined();
    });
  });

  describe("generateMockUsers", () => {
    it("应该生成默认数量的mock用户", () => {
      const users = generateMockUsers();

      expect(users).toHaveLength(3);
      expect(users[0]).toHaveProperty("id", "user-1");
      expect(users[0]).toHaveProperty("email", "user1@example.com");
      expect(users[0]).toHaveProperty("name", "User 1");
    });

    it("应该生成指定数量的mock用户", () => {
      const users = generateMockUsers(5);

      expect(users).toHaveLength(5);
      expect(users[4]).toHaveProperty("id", "user-5");
      expect(users[4]).toHaveProperty("email", "user5@example.com");
    });

    it("应该包含所有必要的用户属性", () => {
      const users = generateMockUsers(1);
      const user = users[0];

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("phone");
      expect(user).toHaveProperty("avatar");
      expect(user).toHaveProperty("status");
      expect(user).toHaveProperty("lastSeen");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");
    });
  });

  describe("generateMockMessages", () => {
    it("应该生成默认数量的mock消息", () => {
      const messages = generateMockMessages();

      expect(messages).toHaveLength(5);
      expect(messages[0]).toHaveProperty("id", "message-1");
      expect(messages[0]).toHaveProperty("content", "Test message 1");
    });

    it("应该生成指定数量的mock消息", () => {
      const messages = generateMockMessages(3);

      expect(messages).toHaveLength(3);
      expect(messages[2]).toHaveProperty("id", "message-3");
    });

    it("应该包含所有必要的消息属性", () => {
      const messages = generateMockMessages(1);
      const message = messages[0];

      expect(message).toHaveProperty("id");
      expect(message).toHaveProperty("content");
      expect(message).toHaveProperty("type");
      expect(message).toHaveProperty("senderId");
      expect(message).toHaveProperty("chatId");
      expect(message).toHaveProperty("readAt");
      expect(message).toHaveProperty("createdAt");
      expect(message).toHaveProperty("updatedAt");
    });
  });

  describe("generateMockChats", () => {
    it("应该生成默认数量的mock聊天", () => {
      const chats = generateMockChats();

      expect(chats).toHaveLength(3);
      expect(chats[0]).toHaveProperty("id", "chat-1");
      expect(chats[0]).toHaveProperty("type", "group");
      expect(chats[0]).toHaveProperty("name", "Group Chat 1");
    });

    it("应该生成指定数量的mock聊天", () => {
      const chats = generateMockChats(2);

      expect(chats).toHaveLength(2);
      expect(chats[1]).toHaveProperty("id", "chat-2");
    });

    it("应该包含所有必要的聊天属性", () => {
      const chats = generateMockChats(1);
      const chat = chats[0];

      expect(chat).toHaveProperty("id");
      expect(chat).toHaveProperty("type");
      expect(chat).toHaveProperty("name");
      expect(chat).toHaveProperty("avatar");
      expect(chat).toHaveProperty("lastMessageId");
      expect(chat).toHaveProperty("createdAt");
      expect(chat).toHaveProperty("updatedAt");
    });
  });

  describe("cleanupDatabase", () => {
    it("应该调用Prisma删除方法", async () => {
      const mockPrisma = {
        message: { deleteMany: vi.fn().mockResolvedValue({}) },
        contact: { deleteMany: vi.fn().mockResolvedValue({}) },
        chatParticipant: { deleteMany: vi.fn().mockResolvedValue({}) },
        chat: { deleteMany: vi.fn().mockResolvedValue({}) },
        user: { deleteMany: vi.fn().mockResolvedValue({}) },
      };

      await cleanupDatabase(mockPrisma);

      expect(mockPrisma.message.deleteMany).toHaveBeenCalledWith({});
      expect(mockPrisma.contact.deleteMany).toHaveBeenCalledWith({});
      expect(mockPrisma.chatParticipant.deleteMany).toHaveBeenCalledWith({});
      expect(mockPrisma.chat.deleteMany).toHaveBeenCalledWith({});
      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({});
    });
  });

  describe("seedTestData", () => {
    it("应该创建测试数据并返回生成的数据", async () => {
      const mockPrisma = {
        user: { create: vi.fn().mockResolvedValue({}) },
        chat: { create: vi.fn().mockResolvedValue({}) },
        message: { create: vi.fn().mockResolvedValue({}) },
      };

      const result = await seedTestData(mockPrisma);

      expect(result).toHaveProperty("users");
      expect(result).toHaveProperty("chats");
      expect(result).toHaveProperty("messages");
      expect(result.users).toHaveLength(3);
      expect(result.chats).toHaveLength(2);
      expect(result.messages).toHaveLength(5);
    });
  });

  describe("waitFor", () => {
    it("应该等待指定的毫秒数", async () => {
      const start = Date.now();
      await waitFor(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe("waitForCondition", () => {
    it("应该在条件满足时立即返回", async () => {
      let count = 0;
      const condition = () => {
        count++;
        return count >= 2;
      };

      const result = await waitForCondition(condition, 1000, 10);

      expect(result).toBe(true);
      expect(count).toBe(2);
    });

    it("应该在超时时抛出错误", async () => {
      const condition = () => false;

      await expect(waitForCondition(condition, 100, 10)).rejects.toThrow(
        "Condition not met within 100ms"
      );
    });

    it("应该支持异步条件", async () => {
      let count = 0;
      const condition = async () => {
        count++;
        await waitFor(10);
        return count >= 2;
      };

      const result = await waitForCondition(condition, 1000, 10);

      expect(result).toBe(true);
      expect(count).toBe(2);
    });
  });

  describe("simulateNetworkError", () => {
    it("应该创建网络错误", () => {
      const error = simulateNetworkError();

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("NetworkError");
      expect(error.message).toBe("Network error");
    });
  });

  describe("simulateDatabaseError", () => {
    it("应该创建数据库错误", () => {
      const error = simulateDatabaseError();

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("DatabaseError");
      expect(error.message).toBe("Database connection failed");
    });
  });

  describe("simulateValidationError", () => {
    it("应该创建验证错误", () => {
      const error = simulateValidationError("email");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe("Validation failed for field: email");
    });
  });

  describe("createMockFile", () => {
    it("应该创建默认的mock文件", () => {
      const file = createMockFile();

      expect(file).toHaveProperty("fieldname", "file");
      expect(file).toHaveProperty("originalname", "test.jpg");
      expect(file).toHaveProperty("encoding", "7bit");
      expect(file).toHaveProperty("mimetype", "image/jpeg");
      expect(file).toHaveProperty("size", 1024);
      expect(file).toHaveProperty("buffer");
      expect(file).toHaveProperty("destination", "/tmp");
      expect(file).toHaveProperty("filename", "test.jpg");
      expect(file).toHaveProperty("path", "/tmp/test.jpg");
    });

    it("应该使用提供的选项覆盖默认值", () => {
      const options = {
        filename: "custom.jpg",
        mimetype: "image/png",
        size: 2048,
        buffer: Buffer.from("custom content"),
      };

      const file = createMockFile(options);

      expect(file.originalname).toBe("custom.jpg");
      expect(file.mimetype).toBe("image/png");
      expect(file.size).toBe(2048);
      expect(file.buffer).toBe(options.buffer);
      expect(file.filename).toBe("custom.jpg");
      expect(file.path).toBe("/tmp/custom.jpg");
    });
  });

  describe("createMockSocket", () => {
    it("应该创建mock socket", () => {
      const socket = createMockSocket();

      expect(socket).toHaveProperty("id", "socket-id");
      expect(socket).toHaveProperty("emit");
      expect(socket).toHaveProperty("on");
      expect(socket).toHaveProperty("join");
      expect(socket).toHaveProperty("leave");
      expect(socket).toHaveProperty("disconnect");
      expect(socket).toHaveProperty("handshake");
      expect(socket).toHaveProperty("data");
    });

    it("应该包含正确的handshake结构", () => {
      const socket = createMockSocket();

      expect(socket.handshake).toHaveProperty("auth");
      expect(socket.handshake).toHaveProperty("headers");
    });
  });

  describe("createMockSocketServer", () => {
    it("应该创建mock socket服务器", () => {
      const server = createMockSocketServer();

      expect(server).toHaveProperty("emit");
      expect(server).toHaveProperty("to");
      expect(server).toHaveProperty("on");
      expect(server).toHaveProperty("use");
      expect(server).toHaveProperty("close");
    });

    it("to方法应该返回具有emit方法的对象", () => {
      const server = createMockSocketServer();
      const room = server.to();

      expect(room.emit).toBeDefined();
    });
  });
});
