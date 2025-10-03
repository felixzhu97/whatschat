import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { errorHandler, notFound } from "../../src/middleware/error";

// Mock logger to reduce test output noise
vi.mock("../../src/utils/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Error Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("notFound middleware", () => {
    it("should return 404 error for unknown routes", () => {
      notFound(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: expect.stringContaining("路径"),
        })
      );
    });
  });

  describe("errorHandler middleware", () => {
    it("should handle validation errors", () => {
      const error = {
        name: "ValidationError",
        message: "Validation failed",
        errors: {
          email: { message: "Invalid email format" },
          password: { message: "Password too short" },
        },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email format, Password too short",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle JWT errors", () => {
      const error = {
        name: "JsonWebTokenError",
        message: "jwt malformed",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "无效的令牌",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle JWT expired errors", () => {
      const error = {
        name: "TokenExpiredError",
        message: "jwt expired",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "令牌已过期",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle Prisma errors", () => {
      const error = {
        code: "P2002",
        meta: { target: ["email"] },
        message: "Unique constraint failed",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Unique constraint failed",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle Prisma not found errors", () => {
      const error = {
        code: "P2025",
        message: "Record not found",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Record not found",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle Prisma foreign key errors", () => {
      const error = {
        code: "P2003",
        message: "Foreign key constraint failed",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Foreign key constraint failed",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle rate limit errors", () => {
      const error = {
        status: 429,
        message: "Too many requests",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Too many requests",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle file upload errors", () => {
      const error = {
        code: "LIMIT_FILE_SIZE",
        message: "File too large",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "File too large",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle multer errors", () => {
      const error = {
        code: "LIMIT_UNEXPECTED_FILE",
        message: "Unexpected field",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected field",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle generic errors", () => {
      const error = new Error("Something went wrong");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Something went wrong",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle errors with custom status", () => {
      const error = {
        status: 422,
        message: "Custom error",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Custom error",
        error: undefined,
        timestamp: expect.any(Date),
      });
    });

    it("should handle errors in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new Error("Sensitive error information");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Sensitive error information",
        error: undefined,
        timestamp: expect.any(Date),
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle errors with stack trace in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new Error("Development error");
      error.stack = "Error: Development error\n    at test.js:1:1";

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Development error",
        error: "Error: Development error\n    at test.js:1:1",
        timestamp: expect.any(Date),
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
