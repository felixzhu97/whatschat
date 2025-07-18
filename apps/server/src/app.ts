import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";

import config from "@/config";
import { errorHandler, notFound } from "@/middleware/error";
import { generalRateLimit } from "@/middleware/rate-limit";
import { setupRoutes } from "@/routes";
import healthRoutes from "@/routes/health";

export function createApp(): express.Application {
  const app = express();

  // 安全中间件
  app.use(helmet());
  app.use(compression());
  app.use(cors(config.security.cors));

  // 速率限制 (在解析中间件之前)
  if (config.server.nodeEnv === "production") {
    app.use(generalRateLimit);
  }

  // 解析中间件
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 日志中间件
  if (config.server.nodeEnv !== "test") {
    app.use(morgan("combined"));
  }

  // 静态文件服务
  app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

  // 健康检查路由
  app.use("/health", healthRoutes);

  // 设置API路由
  setupRoutes(app);

  // 错误处理中间件
  app.use(notFound);
  app.use(errorHandler);

  return app;
}