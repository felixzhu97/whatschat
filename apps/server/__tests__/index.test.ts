import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServer } from "http";

// Mock process.exit to prevent test termination
const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit called");
});

// Mock dependencies
const mockServer = {
  listen: vi.fn(),
  close: vi.fn(),
};

const mockApp = {
  use: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
};

const mockSocketManager = {
  initialize: vi.fn(),
};

const mockValidateConfig = vi.fn();

vi.mock("http", () => ({
  createServer: vi.fn(() => mockServer),
}));

vi.mock("@/app", () => ({
  createApp: vi.fn(() => mockApp),
}));

vi.mock("@/config", () => ({
  default: {
    server: {
      port: 3000,
      host: "localhost",
      nodeEnv: "test",
    },
  },
  validateConfig: mockValidateConfig,
}));

vi.mock("@/utils/logger", () => ({
  default: mockLogger,
}));

vi.mock("@/services/socket-manager", () => ({
  default: {
    getInstance: vi.fn(() => mockSocketManager),
  },
}));

describe("Index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to ensure fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("服务器启动", () => {
    it("应该创建HTTP服务器", async () => {
      // 导入模块以触发代码执行
      await import("../src/index");

      expect(createServer).toHaveBeenCalledWith(mockApp);
    });

    it("应该初始化Socket管理器", async () => {
      await import("../src/index");

      expect(mockSocketManager.initialize).toHaveBeenCalledWith(mockServer);
    });

    it("应该启动服务器监听指定端口", async () => {
      await import("../src/index");

      expect(mockServer.listen).toHaveBeenCalledWith(
        3000,
        "localhost",
        expect.any(Function)
      );
    });

    it("应该在服务器启动时记录日志", async () => {
      await import("../src/index");

      // 检查是否有调用记录
      if (mockServer.listen.mock.calls.length > 0) {
        // 模拟服务器启动回调
        const listenCallback = mockServer.listen.mock.calls[0][2];
        listenCallback();

        expect(mockLogger.info).toHaveBeenCalledWith(
          "🚀 WhatsChat服务器启动成功"
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          "📍 地址: http://localhost:3000"
        );
      } else {
        // 如果没有调用记录，说明测试有问题
        expect(mockServer.listen).toHaveBeenCalled();
      }
    });
  });

  describe("优雅关闭", () => {
    it("应该处理SIGTERM信号", async () => {
      await import("../src/index");

      // 模拟SIGTERM信号
      process.emit("SIGTERM" as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "收到 SIGTERM 信号，正在优雅关闭服务器..."
      );
    });

    it("应该处理SIGINT信号", async () => {
      await import("../src/index");

      // 模拟SIGINT信号
      process.emit("SIGINT" as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "收到 SIGINT 信号，正在优雅关闭服务器..."
      );
    });

    it("应该在服务器关闭时记录日志", async () => {
      await import("../src/index");

      // 模拟SIGTERM信号
      process.emit("SIGTERM" as any);

      // 检查是否有调用记录
      if (mockServer.close.mock.calls.length > 0) {
        // 模拟服务器关闭回调
        const closeCallback = mockServer.close.mock.calls[0][0];

        // 捕获 process.exit 调用
        try {
          closeCallback();
        } catch (error) {
          // 忽略 process.exit 错误
          expect(error.message).toContain("process.exit");
        }

        expect(mockLogger.info).toHaveBeenCalledWith("HTTP服务器已关闭");
      } else {
        // 如果没有调用记录，说明测试有问题
        expect(mockServer.close).toHaveBeenCalled();
      }
    });

    it("应该在超时时强制关闭", async () => {
      await import("../src/index");

      // 模拟SIGTERM信号
      process.emit("SIGTERM" as any);

      // 等待超时
      setTimeout(() => {
        expect(mockLogger.error).toHaveBeenCalledWith("强制关闭服务器");
      }, 10001);
    });
  });

  describe("配置验证", () => {
    it("应该在启动时验证配置", async () => {
      await import("../src/index");

      expect(mockValidateConfig).toHaveBeenCalled();
    });
  });
});
