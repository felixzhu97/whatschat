import Redis from "ioredis";
import logger from "@/utils/logger";
import config from "@/config";

// 创建Redis客户端（使用标准 ioredis 连接参数）
const redis = (() => {
  const url = config.redis.url as string;
  const password = config.redis.password;
  if (url && (url.startsWith("redis://") || url.startsWith("rediss://"))) {
    return new Redis(url, password ? { password } : {});
  }
  // 兼容 host:port 形式
  const [hostRaw, portStr] = (url || "127.0.0.1:6379").split(":");
  const host = hostRaw || "127.0.0.1";
  const port = parseInt(portStr || "6379", 10);
  return new Redis(port, host, password ? { password } : {});
})();

// 连接事件
redis.on("connect", () => {
  logger.info("Redis连接已建立");
});

redis.on("ready", () => {
  logger.info("Redis客户端已准备就绪");
});

redis.on("error", (error) => {
  logger.error(`Redis错误: ${error.message}`);
});

redis.on("close", () => {
  logger.warn("Redis连接已关闭");
});

redis.on("reconnecting", () => {
  logger.info("正在重新连接Redis...");
});

// 优雅关闭
const gracefulShutdown = async () => {
  logger.info("正在关闭Redis连接...");
  await redis.quit();
  logger.info("Redis连接已关闭");
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Redis工具函数
export const redisUtils = {
  // 设置键值对
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }
    } catch (error) {
      logger.error(`Redis SET错误: ${error}`);
      throw error;
    }
  },

  // 获取值
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Redis GET错误: ${error}`);
      throw error;
    }
  },

  // 删除键
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Redis DEL错误: ${error}`);
      throw error;
    }
  },

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS错误: ${error}`);
      throw error;
    }
  },

  // 设置过期时间
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      logger.error(`Redis EXPIRE错误: ${error}`);
      throw error;
    }
  },

  // 获取剩余过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL错误: ${error}`);
      throw error;
    }
  },

  // 哈希表操作
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      await redis.hset(key, field, serializedValue);
    } catch (error) {
      logger.error(`Redis HSET错误: ${error}`);
      throw error;
    }
  },

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await redis.hget(key, field);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Redis HGET错误: ${error}`);
      throw error;
    }
  },

  async hgetall<T = any>(key: string): Promise<T | null> {
    try {
      const value = await redis.hgetall(key);
      if (!value || Object.keys(value).length === 0) return null;
      return value as T;
    } catch (error) {
      logger.error(`Redis HGETALL错误: ${error}`);
      throw error;
    }
  },

  // 列表操作
  async lpush(key: string, value: any): Promise<void> {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      await redis.lpush(key, serializedValue);
    } catch (error) {
      logger.error(`Redis LPUSH错误: ${error}`);
      throw error;
    }
  },

  async rpop<T = any>(key: string): Promise<T | null> {
    try {
      const value = await redis.rpop(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`Redis RPOP错误: ${error}`);
      throw error;
    }
  },

  // 集合操作
  async sadd(key: string, member: string): Promise<void> {
    try {
      await redis.sadd(key, member);
    } catch (error) {
      logger.error(`Redis SADD错误: ${error}`);
      throw error;
    }
  },

  async srem(key: string, member: string): Promise<void> {
    try {
      await redis.srem(key, member);
    } catch (error) {
      logger.error(`Redis SREM错误: ${error}`);
      throw error;
    }
  },

  async smembers(key: string): Promise<string[]> {
    try {
      return await redis.smembers(key);
    } catch (error) {
      logger.error(`Redis SMEMBERS错误: ${error}`);
      throw error;
    }
  },

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await redis.sismember(key, member);
      return result === 1;
    } catch (error) {
      logger.error(`Redis SISMEMBER错误: ${error}`);
      throw error;
    }
  },

  // 发布订阅
  async publish(channel: string, message: any): Promise<void> {
    try {
      const serializedMessage =
        typeof message === "string" ? message : JSON.stringify(message);
      await redis.publish(channel, serializedMessage);
    } catch (error) {
      logger.error(`Redis PUBLISH错误: ${error}`);
      throw error;
    }
  },

  // 订阅
  subscribe(channel: string, callback: (message: any) => void): void {
    try {
      const subscriber = redis.duplicate();
      subscriber.subscribe(channel);

      subscriber.on("message", (ch, message) => {
        if (ch === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch {
            callback(message);
          }
        }
      });
    } catch (error) {
      logger.error(`Redis SUBSCRIBE错误: ${error}`);
      throw error;
    }
  },
};

export default redis;
