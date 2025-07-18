import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import config from "@/config";

const router = Router();
const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: "up" | "down";
    redis: "up" | "down";
    [key: string]: "up" | "down";
  };
  uptime: number;
}

// 基础健康检查
router.get("/", (req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.server.nodeEnv,
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
});

// 详细健康检查
router.get("/detailed", async (req: Request, res: Response) => {
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.server.nodeEnv,
    services: {
      database: "down",
      redis: "down",
    },
    uptime: process.uptime(),
  };

  // 检查数据库连接
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = "up";
  } catch (error) {
    healthStatus.services.database = "down";
    healthStatus.status = "unhealthy";
  }

  // 检查Redis连接
  try {
    await redis.ping();
    healthStatus.services.redis = "up";
  } catch (error) {
    healthStatus.services.redis = "down";
    healthStatus.status = healthStatus.status === "unhealthy" ? "unhealthy" : "degraded";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : 
                    healthStatus.status === "degraded" ? 200 : 503;

  res.status(statusCode).json({
    success: healthStatus.status !== "unhealthy",
    message: `服务器状态: ${healthStatus.status}`,
    data: healthStatus,
  });
});

export default router;