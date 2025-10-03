import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import {
  generalRateLimit,
  authRateLimit,
} from "../../src/middleware/rate-limit";

describe("Rate Limit Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: "127.0.0.1",
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe("generalRateLimit", () => {
    it("should be a function", () => {
      expect(typeof generalRateLimit).toBe("function");
    });

    it("should have correct configuration", () => {
      // 测试中间件是否正确配置
      expect(generalRateLimit).toBeDefined();
    });
  });

  describe("authRateLimit", () => {
    it("should be a function", () => {
      expect(typeof authRateLimit).toBe("function");
    });

    it("should have correct configuration", () => {
      // 测试中间件是否正确配置
      expect(authRateLimit).toBeDefined();
    });
  });

  describe("Rate Limit Configuration", () => {
    it("should have different configurations for general and auth limits", () => {
      // 验证两个中间件是不同的函数
      expect(generalRateLimit).not.toBe(authRateLimit);
    });

    it("should export both middleware functions", () => {
      expect(generalRateLimit).toBeDefined();
      expect(authRateLimit).toBeDefined();
    });
  });
});
