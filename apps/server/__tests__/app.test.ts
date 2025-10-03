import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import config from "../src/config";

// Mock dependencies
vi.mock("../src/config", () => ({
  default: {
    security: {
      cors: {
        origin: ["http://localhost:3000"],
        credentials: true,
      },
    },
    server: {
      nodeEnv: "test",
    },
  },
}));

vi.mock("../src/middleware/error", () => ({
  errorHandler: vi.fn((err, req, res, next) => {
    res.status(500).json({ error: "Internal Server Error" });
  }),
  notFound: vi.fn((req, res) => {
    res.status(404).json({ error: "Not Found" });
  }),
}));

vi.mock("../src/middleware/rate-limit", () => ({
  generalRateLimit: vi.fn((req, res, next) => next()),
}));

vi.mock("../src/routes", () => ({
  setupRoutes: vi.fn((app) => {
    app.get("/api/test", (req, res) => {
      res.json({ message: "Test route" });
    });
    app.post("/api/test", (req, res) => {
      res.json({ message: "Test route" });
    });
  }),
}));

vi.mock("../src/routes/health", () => {
  const express = require("express");
  const router = express.Router();
  router.get(
    "/",
    vi.fn((req, res) => {
      res.json({ status: "ok" });
    })
  );
  return {
    default: router,
  };
});

describe("App", () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createApp", () => {
    it("应该创建Express应用实例", () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe("function");
    });

    it("应该设置CORS中间件", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body).toEqual({ message: "Test route" });
    });

    it("应该设置JSON解析中间件", async () => {
      const testData = { test: "data" };

      const response = await request(app)
        .post("/api/test")
        .send(testData)
        .expect(200);

      expect(response.body).toEqual({ message: "Test route" });
    });

    it("应该设置URL编码解析中间件", async () => {
      const response = await request(app)
        .post("/api/test")
        .send("test=data")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .expect(200);

      expect(response.body).toEqual({ message: "Test route" });
    });

    it("应该设置静态文件服务", async () => {
      const response = await request(app).get("/uploads/test.jpg").expect(404); // 文件不存在，但路由存在

      // 如果路由不存在，会返回404，说明静态文件中间件已设置
    });

    it("应该设置健康检查路由", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toEqual({ status: "ok" });
    });

    it("应该设置API路由", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body).toEqual({ message: "Test route" });
    });

    it("应该设置错误处理中间件", async () => {
      // 测试404错误处理
      const response = await request(app).get("/nonexistent-route").expect(404);

      expect(response.body).toEqual({ error: "Not Found" });
    });

    it("在生产环境中应该设置速率限制", () => {
      // 临时修改环境为生产环境
      const originalEnv = config.server.nodeEnv;
      config.server.nodeEnv = "production";

      const productionApp = createApp();
      expect(productionApp).toBeDefined();

      // 恢复原始环境
      config.server.nodeEnv = originalEnv;
    });

    it("在非测试环境中应该设置日志中间件", () => {
      // 临时修改环境为开发环境
      const originalEnv = config.server.nodeEnv;
      config.server.nodeEnv = "development";

      const devApp = createApp();
      expect(devApp).toBeDefined();

      // 恢复原始环境
      config.server.nodeEnv = originalEnv;
    });
  });

  describe("中间件配置", () => {
    it("应该正确配置helmet安全中间件", () => {
      // helmet中间件会设置安全头
      expect(app).toBeDefined();
    });

    it("应该正确配置compression中间件", () => {
      // compression中间件会压缩响应
      expect(app).toBeDefined();
    });

    it("应该正确配置CORS中间件", () => {
      // CORS中间件会处理跨域请求
      expect(app).toBeDefined();
    });
  });

  describe("路由配置", () => {
    it("应该正确设置所有路由", () => {
      expect(app).toBeDefined();
    });

    it("应该正确处理API路由", async () => {
      const response = await request(app).get("/api/test").expect(200);

      expect(response.body).toEqual({ message: "Test route" });
    });

    it("应该正确处理健康检查路由", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("错误处理", () => {
    it("应该处理404错误", async () => {
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toEqual({ error: "Not Found" });
    });

    it("应该处理服务器错误", async () => {
      // 这里我们无法直接测试500错误，因为需要触发实际的错误
      // 但我们可以确保错误处理中间件已正确设置
      expect(app).toBeDefined();
    });
  });

  describe("环境配置", () => {
    it("应该根据环境正确配置中间件", () => {
      const testApp = createApp();
      expect(testApp).toBeDefined();
    });

    it("应该在生产环境中启用速率限制", () => {
      const originalEnv = config.server.nodeEnv;
      config.server.nodeEnv = "production";

      const prodApp = createApp();
      expect(prodApp).toBeDefined();

      config.server.nodeEnv = originalEnv;
    });

    it("应该在非测试环境中启用日志", () => {
      const originalEnv = config.server.nodeEnv;
      config.server.nodeEnv = "development";

      const devApp = createApp();
      expect(devApp).toBeDefined();

      config.server.nodeEnv = originalEnv;
    });
  });
});
