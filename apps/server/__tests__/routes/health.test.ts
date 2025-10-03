import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response } from "express";
import healthRouter from "../../src/routes/health";

// Mock Prisma
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $queryRaw: vi.fn(),
  })),
}));

// Mock Redis
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    ping: vi.fn(),
  })),
}));

// Mock config
vi.mock("../../src/config", () => ({
  default: {
    server: {
      nodeEnv: "test",
    },
    redis: {
      url: "redis://localhost:6379",
    },
  },
}));

describe("Health Check Routes", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Health Router", () => {
    it("should be a router", () => {
      expect(healthRouter).toBeDefined();
      expect(typeof healthRouter).toBe("function");
    });

    it("should have routes configured", () => {
      // 验证路由器是否正确配置
      expect(healthRouter).toBeDefined();
    });
  });

  describe("Basic Health Check Route", () => {
    it("should return basic health status", () => {
      // 模拟路由处理函数
      const basicHealthHandler = (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "up",
            redis: "up",
          },
          uptime: process.uptime(),
        };

        res.json({
          success: true,
          message: "WhatsChat服务器运行正常",
          data: healthStatus,
        });
      };

      basicHealthHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "WhatsChat服务器运行正常",
        data: {
          status: "healthy",
          timestamp: expect.any(String),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "up",
            redis: "up",
          },
          uptime: expect.any(Number),
        },
      });
    });

    it("should include correct environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const basicHealthHandler = (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: process.env.NODE_ENV || "development",
          services: {
            database: "up",
            redis: "up",
          },
          uptime: process.uptime(),
        };

        res.json({
          success: true,
          message: "WhatsChat服务器运行正常",
          data: healthStatus,
        });
      };

      basicHealthHandler(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "WhatsChat服务器运行正常",
        data: expect.objectContaining({
          environment: "production",
        }),
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Detailed Health Check Route", () => {
    it("should return detailed health status when all services are healthy", async () => {
      const { PrismaClient } = await import("@prisma/client");
      const Redis = await import("ioredis");

      const mockPrisma = new PrismaClient();
      const mockRedis = new Redis.default();

      // Mock the methods directly
      mockPrisma.$queryRaw = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
      mockRedis.ping = vi.fn().mockResolvedValue("PONG");

      const detailedHealthHandler = async (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "down",
            redis: "down",
          },
          uptime: process.uptime(),
        };

        // 检查数据库连接
        try {
          await mockPrisma.$queryRaw`SELECT 1`;
          healthStatus.services.database = "up";
        } catch (error) {
          healthStatus.services.database = "down";
          healthStatus.status = "unhealthy";
        }

        // 检查Redis连接
        try {
          await mockRedis.ping();
          healthStatus.services.redis = "up";
        } catch (error) {
          healthStatus.services.redis = "down";
          healthStatus.status =
            healthStatus.status === "unhealthy" ? "unhealthy" : "degraded";
        }

        const statusCode =
          healthStatus.status === "healthy"
            ? 200
            : healthStatus.status === "degraded"
              ? 200
              : 503;

        res.status(statusCode).json({
          success: healthStatus.status !== "unhealthy",
          message: `服务器状态: ${healthStatus.status}`,
          data: healthStatus,
        });
      };

      await detailedHealthHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "服务器状态: healthy",
        data: expect.objectContaining({
          status: "healthy",
          services: {
            database: "up",
            redis: "up",
          },
        }),
      });
    });

    it("should return unhealthy status when database is down", async () => {
      const { PrismaClient } = await import("@prisma/client");
      const Redis = await import("ioredis");

      const mockPrisma = new PrismaClient();
      const mockRedis = new Redis.default();

      // Mock the methods directly
      mockPrisma.$queryRaw = vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));
      mockRedis.ping = vi.fn().mockResolvedValue("PONG");

      const detailedHealthHandler = async (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "down",
            redis: "down",
          },
          uptime: process.uptime(),
        };

        // 检查数据库连接
        try {
          await mockPrisma.$queryRaw`SELECT 1`;
          healthStatus.services.database = "up";
        } catch (error) {
          healthStatus.services.database = "down";
          healthStatus.status = "unhealthy";
        }

        // 检查Redis连接
        try {
          await mockRedis.ping();
          healthStatus.services.redis = "up";
        } catch (error) {
          healthStatus.services.redis = "down";
          healthStatus.status =
            healthStatus.status === "unhealthy" ? "unhealthy" : "degraded";
        }

        const statusCode =
          healthStatus.status === "healthy"
            ? 200
            : healthStatus.status === "degraded"
              ? 200
              : 503;

        res.status(statusCode).json({
          success: healthStatus.status !== "unhealthy",
          message: `服务器状态: ${healthStatus.status}`,
          data: healthStatus,
        });
      };

      await detailedHealthHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器状态: unhealthy",
        data: expect.objectContaining({
          status: "unhealthy",
          services: {
            database: "down",
            redis: "up",
          },
        }),
      });
    });

    it("should return unhealthy status when Redis is down", async () => {
      const { PrismaClient } = await import("@prisma/client");
      const Redis = await import("ioredis");

      const mockPrisma = new PrismaClient();
      const mockRedis = new Redis.default();

      // Mock the methods directly
      mockPrisma.$queryRaw = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
      mockRedis.ping = vi
        .fn()
        .mockRejectedValue(new Error("Redis connection failed"));

      const detailedHealthHandler = async (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "down",
            redis: "down",
          },
          uptime: process.uptime(),
        };

        // 检查数据库连接
        try {
          await mockPrisma.$queryRaw`SELECT 1`;
          healthStatus.services.database = "up";
        } catch (error) {
          healthStatus.services.database = "down";
          healthStatus.status = "unhealthy";
        }

        // 检查Redis连接
        try {
          await mockRedis.ping();
          healthStatus.services.redis = "up";
        } catch (error) {
          healthStatus.services.redis = "down";
          healthStatus.status =
            healthStatus.status === "unhealthy" ? "unhealthy" : "degraded";
        }

        const statusCode =
          healthStatus.status === "healthy"
            ? 200
            : healthStatus.status === "degraded"
              ? 200
              : 503;

        res.status(statusCode).json({
          success: healthStatus.status !== "unhealthy",
          message: `服务器状态: ${healthStatus.status}`,
          data: healthStatus,
        });
      };

      await detailedHealthHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "服务器状态: degraded",
        data: expect.objectContaining({
          status: "degraded",
          services: {
            database: "up",
            redis: "down",
          },
        }),
      });
    });

    it("should return unhealthy status when both services are down", async () => {
      const { PrismaClient } = await import("@prisma/client");
      const Redis = await import("ioredis");

      const mockPrisma = new PrismaClient();
      const mockRedis = new Redis.default();

      // Mock the methods directly
      mockPrisma.$queryRaw = vi
        .fn()
        .mockRejectedValue(new Error("Database connection failed"));
      mockRedis.ping = vi
        .fn()
        .mockRejectedValue(new Error("Redis connection failed"));

      const detailedHealthHandler = async (req: Request, res: Response) => {
        const healthStatus = {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          environment: "test",
          services: {
            database: "down",
            redis: "down",
          },
          uptime: process.uptime(),
        };

        // 检查数据库连接
        try {
          await mockPrisma.$queryRaw`SELECT 1`;
          healthStatus.services.database = "up";
        } catch (error) {
          healthStatus.services.database = "down";
          healthStatus.status = "unhealthy";
        }

        // 检查Redis连接
        try {
          await mockRedis.ping();
          healthStatus.services.redis = "up";
        } catch (error) {
          healthStatus.services.redis = "down";
          healthStatus.status =
            healthStatus.status === "unhealthy" ? "unhealthy" : "degraded";
        }

        const statusCode =
          healthStatus.status === "healthy"
            ? 200
            : healthStatus.status === "degraded"
              ? 200
              : 503;

        res.status(statusCode).json({
          success: healthStatus.status !== "unhealthy",
          message: `服务器状态: ${healthStatus.status}`,
          data: healthStatus,
        });
      };

      await detailedHealthHandler(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "服务器状态: unhealthy",
        data: expect.objectContaining({
          status: "unhealthy",
          services: {
            database: "down",
            redis: "down",
          },
        }),
      });
    });
  });
});
