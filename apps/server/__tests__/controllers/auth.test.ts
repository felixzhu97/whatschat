import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  authController,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../../src/controllers/auth";
import { prisma } from "../../src/database/client";

// Extend Request interface for testing
interface AuthRequest extends Request {
  user?: any;
}

// Mock Prisma
vi.mock("../../src/database/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock validation utils
vi.mock("../../src/utils/validation", () => ({
  validateEmail: vi.fn(),
  validatePassword: vi.fn(),
}));

describe("Auth Controller", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();

    // Set up environment variables
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "7d";

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const { validateEmail, validatePassword } = await import(
        "../../src/utils/validation"
      );
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
        password: "hashed-password",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock validation functions
      vi.mocked(validateEmail).mockReturnValue(true);
      vi.mocked(validatePassword).mockReturnValue(true);

      // Mock Prisma calls
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // User doesn't exist
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      // Mock bcrypt
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);

      // Mock jwt
      vi.mocked(jwt.sign).mockReturnValue("jwt-token" as never);

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
        username: "testuser",
        phone: "+1234567890",
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(validateEmail).toHaveBeenCalledWith("test@example.com");
      expect(validatePassword).toHaveBeenCalledWith("password123");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: "testuser",
          email: "test@example.com",
          password: "hashed-password",
          phone: "+1234567890",
        },
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "user-1" },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "用户注册成功",
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
            username: "testuser",
            phone: "+1234567890",
            avatar: null,
            status: "online",
          },
          token: "jwt-token",
        },
      });
    });

    it("should reject invalid email format", async () => {
      const { validateEmail } = await import("../../src/utils/validation");
      vi.mocked(validateEmail).mockReturnValue(false);

      mockRequest.body = {
        email: "invalid-email",
        password: "password123",
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "邮箱格式不正确",
      });
    });

    it("should reject weak password", async () => {
      const { validateEmail, validatePassword } = await import(
        "../../src/utils/validation"
      );
      vi.mocked(validateEmail).mockReturnValue(true);
      vi.mocked(validatePassword).mockReturnValue(false);

      mockRequest.body = {
        email: "test@example.com",
        password: "123",
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "密码长度至少6位",
      });
    });

    it("should reject existing user", async () => {
      const { validateEmail, validatePassword } = await import(
        "../../src/utils/validation"
      );
      const existingUser = {
        id: "existing-user",
        email: "test@example.com",
        username: "existing",
        phone: null,
        avatar: null,
        status: "online",
        password: "hashed",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(validateEmail).mockReturnValue(true);
      vi.mocked(validatePassword).mockReturnValue(true);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "用户已存在",
      });
    });

    it("should handle database errors", async () => {
      const { validateEmail, validatePassword } = await import(
        "../../src/utils/validation"
      );
      vi.mocked(validateEmail).mockReturnValue(true);
      vi.mocked(validatePassword).mockReturnValue(true);
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器内部错误",
      });
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
        password: "hashed-password",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.sign).mockReturnValue("jwt-token" as never);

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "user-1" },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "登录成功",
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
            username: "testuser",
            phone: "+1234567890",
            avatar: null,
            status: "online",
          },
          token: "jwt-token",
        },
      });
    });

    it("should reject non-existent user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "邮箱或密码错误",
      });
    });

    it("should reject invalid password", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: null,
        avatar: null,
        status: "online",
        password: "hashed-password",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      mockRequest.body = {
        email: "test@example.com",
        password: "wrong-password",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "邮箱或密码错误",
      });
    });

    it("should handle database errors during login", async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error("Database error")
      );

      mockRequest.body = {
        email: "test@example.com",
        password: "password123",
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器内部错误",
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: null,
        avatar: null,
        status: "online",
        password: "hashed-password",
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDecodedToken = {
        userId: "user-1",
        exp: Date.now() / 1000 + 3600,
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(jwt.sign).mockReturnValue("new-jwt-token" as never);

      mockRequest.body = {
        refreshToken: "valid-refresh-token",
      };

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-refresh-token",
        "test-secret"
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "user-1" },
        "test-secret",
        { expiresIn: "7d" }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Token刷新成功",
        data: {
          token: "new-jwt-token",
        },
      });
    });

    it("should reject invalid refresh token", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      mockRequest.body = {
        refreshToken: "invalid-token",
      };

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Refresh token无效",
      });
    });

    it("should reject non-existent user", async () => {
      const mockDecodedToken = {
        userId: "non-existent-user",
        exp: Date.now() / 1000 + 3600,
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      mockRequest.body = {
        refreshToken: "valid-token",
      };

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Refresh token无效",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
        lastSeen: new Date(),
      };

      mockRequest.user = mockUser;

      await getCurrentUser(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "获取用户信息成功",
        data: {
          user: mockUser,
        },
      });
    });
  });

  describe("updateProfile", () => {
    it("should return not implemented", async () => {
      await updateProfile(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(501);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "未实现",
        code: "NOT_IMPLEMENTED",
      });
    });
  });

  describe("changePassword", () => {
    it("should return not implemented", async () => {
      await changePassword(
        mockRequest as AuthRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(501);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "未实现",
        code: "NOT_IMPLEMENTED",
      });
    });
  });
});
