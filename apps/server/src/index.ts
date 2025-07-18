import { createServer } from "http";
import { createApp } from "@/app";
import config, { validateConfig } from "@/config";
import logger from "@/utils/logger";
import SocketManager from "@/services/socket-manager";

// 验证配置
validateConfig();

// 创建Express应用
const app = createApp();
const server = createServer(app);

// 初始化Socket.IO
const socketManager = SocketManager.getInstance();
const io = socketManager.initialize(server);

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
