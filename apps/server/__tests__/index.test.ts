import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";

// Mock NestFactory
vi.mock("@nestjs/core", () => ({
  NestFactory: {
    create: vi.fn(),
  },
}));

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
};

vi.mock("../src/utils/logger", () => ({
  default: mockLogger,
}));

describe("Main Application Bootstrap", () => {
  let mockApp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    mockApp = {
      setGlobalPrefix: vi.fn(),
      use: vi.fn(),
      enableCors: vi.fn(),
      useGlobalPipes: vi.fn(),
      useGlobalInterceptors: vi.fn(),
      useGlobalFilters: vi.fn(),
      listen: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(NestFactory.create).mockResolvedValue(mockApp as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("应用启动", () => {
    it("应该创建NestJS应用实例", async () => {
      await NestFactory.create(AppModule);

      expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    });

    it("应该设置全局前缀", async () => {
      const app = await NestFactory.create(AppModule);
      app.setGlobalPrefix("api/v1");

      expect(app.setGlobalPrefix).toHaveBeenCalledWith("api/v1");
    });

    it("应该启动服务器监听指定端口", async () => {
      const app = await NestFactory.create(AppModule);
      const port = 3001;
      const host = "localhost";

      await app.listen(port, host);

      expect(app.listen).toHaveBeenCalledWith(port, host);
    });
  });

  describe("优雅关闭", () => {
    it("应该处理SIGTERM信号", async () => {
      const app = await NestFactory.create(AppModule);
      const gracefulShutdown = vi.fn();

      process.on("SIGTERM", gracefulShutdown);
      process.emit("SIGTERM" as any);

      expect(gracefulShutdown).toHaveBeenCalled();
    });

    it("应该处理SIGINT信号", async () => {
      const app = await NestFactory.create(AppModule);
      const gracefulShutdown = vi.fn();

      process.on("SIGINT", gracefulShutdown);
      process.emit("SIGINT" as any);

      expect(gracefulShutdown).toHaveBeenCalled();
    });

    it("应该能够关闭应用", async () => {
      const app = await NestFactory.create(AppModule);
      await app.close();

      expect(app.close).toHaveBeenCalled();
    });
  });
});
