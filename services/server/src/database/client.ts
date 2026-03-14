import { PrismaClient } from "@prisma/client";

// 创建 Prisma 客户端实例
export const prisma = new PrismaClient({
  log:
    process.env["NODE_ENV"] === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// 连接数据库
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// 断开数据库连接
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
};

// 优雅关闭处理
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});

// 错误日志
prisma.$on("error" as never, (e: any) => {
  console.error(`Database error: ${e.message}`);
});

export default prisma;
