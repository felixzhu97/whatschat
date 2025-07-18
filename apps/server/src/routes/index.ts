import { Application } from "express";
import authRoutes from "./auth";
import { authRateLimit } from "@/middleware/rate-limit";

export function setupRoutes(app: Application): void {
  // API版本前缀
  const API_PREFIX = "/api/v1";

  // 认证路由 (带有严格的速率限制)
  app.use(`${API_PREFIX}/auth`, authRateLimit, authRoutes);

  // 未来的路由可以在这里添加
  // app.use(`${API_PREFIX}/users`, userRoutes);
  // app.use(`${API_PREFIX}/chats`, chatRoutes);
  // app.use(`${API_PREFIX}/messages`, messageRoutes);
}