import { PrismaClient } from "@prisma/client";
import logger from "@/utils/logger";

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// 开发环境下记录查询日志
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// 错误日志
prisma.$on("error", (e) => {
  logger.error(`Database error: ${e.message}`);
});

// 信息日志
prisma.$on("info", (e) => {
  logger.info(`Database info: ${e.message}`);
});

// 警告日志
prisma.$on("warn", (e) => {
  logger.warn(`Database warning: ${e.message}`);
});

// 优雅关闭
const gracefulShutdown = async () => {
  logger.info("正在关闭数据库连接...");
  await prisma.$disconnect();
  logger.info("数据库连接已关闭");
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default prisma;
