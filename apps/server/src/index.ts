import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

import config from "@/config";
import logger from "@/utils/logger";
import { errorHandler, notFound } from "@/middleware/error";

// 创建Express应用
const app = express();
const server = createServer(app);

// 创建Socket.IO服务器
const io = new Server(server, {
  cors: {
    origin: config.security.cors.origin,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// 中间件
app.use(helmet());
app.use(compression());
app.use(cors(config.security.cors));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 日志中间件
app.use(morgan("combined"));

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "WhatsChat服务器运行正常",
    timestamp: new Date(),
    version: "1.0.0",
    environment: config.server.nodeEnv,
  });
});

// API路由
app.use("/api/auth", (req, res) => {
  res.json({ message: "认证路由" });
});

// 404处理
app.use(notFound);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = config.server.port;
const HOST = config.server.host;

server.listen(PORT, HOST, () => {
  logger.info(`🚀 WhatsChat服务器启动成功`);
  logger.info(`📍 地址: http://${HOST}:${PORT}`);
  logger.info(`🌍 环境: ${config.server.nodeEnv}`);
});

// 优雅关闭
const gracefulShutdown = (signal: string) => {
  logger.info(`收到 ${signal} 信号，正在优雅关闭服务器...`);

  server.close(() => {
    logger.info("HTTP服务器已关闭");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("强制关闭服务器");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
