import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../src/middleware/auth";
import { prisma } from "../../src/database/client";

// Mock Prisma
vi.mock("../../src/database/client", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock jwt
vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();

    // Set up environment variables
    process.env.JWT_SECRET = "test-secret";

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("successful authentication", () => {
    it("should authenticate user with valid token", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        phone: "+1234567890",
        avatar: null,
        status: "online",
        lastSeen: new Date(),
      };

      const mockDecodedToken = {
        userId: "user-1",
        exp: Date.now() / 1000 + 3600,
      };

      mockRequest.headers = {
        authorization: "Bearer valid-jwt-token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith("valid-jwt-token", "test-secret");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: {
          id: true,
          email: true,
          username: true,
          phone: true,
          avatar: true,
          status: true,
          lastSeen: true,
        },
      });
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("authentication failures", () => {
    it("should reject request without authorization header", async () => {
      mockRequest.headers = {};

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "未提供认证令牌",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with malformed authorization header", async () => {
      mockRequest.headers = {
        authorization: "InvalidFormat",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌格式错误",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with wrong auth scheme", async () => {
      mockRequest.headers = {
        authorization: "Basic token123",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌格式错误",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with missing JWT_SECRET", async () => {
      delete process.env.JWT_SECRET;

      mockRequest.headers = {
        authorization: "Bearer token123",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器配置错误：缺少 JWT_SECRET",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid JWT token", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌无效",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with expired JWT token", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      const expiredError = new Error("Token expired");
      expiredError.name = "TokenExpiredError";
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw expiredError;
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌已过期",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request when user does not exist", async () => {
      const mockDecodedToken = {
        userId: "non-existent-user",
        exp: Date.now() / 1000 + 3600,
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      vi.mocked(jwt.verify).mockReturnValue(mockDecodedToken as never);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "用户不存在",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Mock request.headers to throw an error when accessed
      Object.defineProperty(mockRequest, "headers", {
        get: () => {
          throw new Error("Database connection error");
        },
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器内部错误",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty authorization header", async () => {
      mockRequest.headers = {
        authorization: "",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "未提供认证令牌",
      });
    });

    it("should handle authorization header with only Bearer", async () => {
      mockRequest.headers = {
        authorization: "Bearer",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌格式错误",
      });
    });

    it("should handle authorization header with extra spaces", async () => {
      mockRequest.headers = {
        authorization: "Bearer  valid-jwt-token  ",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌格式错误",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle case-insensitive Bearer", async () => {
      mockRequest.headers = {
        authorization: "bearer valid-jwt-token",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "认证令牌格式错误",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
