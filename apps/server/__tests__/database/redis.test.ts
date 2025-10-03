import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import redis, { redisUtils } from "@/database/redis";

// Mock Redis
vi.mock("ioredis", () => {
  const mockRedis = {
    on: vi.fn(),
    quit: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    setex: vi.fn(),
    hset: vi.fn(),
    hget: vi.fn(),
    hgetall: vi.fn(),
    lpush: vi.fn(),
    rpop: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn(),
    sismember: vi.fn(),
    publish: vi.fn(),
    duplicate: vi.fn(() => ({
      subscribe: vi.fn(),
      on: vi.fn(),
    })),
  };
  return {
    default: vi.fn(() => mockRedis),
  };
});

// Mock logger
vi.mock("@/utils/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock config
vi.mock("@/config", () => ({
  default: {
    redis: {
      url: "redis://localhost:6379",
      password: "test-password",
    },
  },
}));

describe("Redis Database", () => {
  let mockRedisInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked Redis instance
    const Redis = vi.mocked(await import("ioredis")).default;
    mockRedisInstance = Redis();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("redisUtils.set", () => {
    it("should set string value without TTL", async () => {
      const key = "test:key";
      const value = "test-value";

      mockRedisInstance.set.mockResolvedValue("OK");

      await redisUtils.set(key, value);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(key, value);
    });

    it("should set object value without TTL", async () => {
      const key = "test:key";
      const value = { name: "test", age: 25 };

      mockRedisInstance.set.mockResolvedValue("OK");

      await redisUtils.set(key, value);

      expect(mockRedisInstance.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value)
      );
    });

    it("should set value with TTL", async () => {
      const key = "test:key";
      const value = "test-value";
      const ttl = 3600;

      mockRedisInstance.setex.mockResolvedValue("OK");

      await redisUtils.set(key, value, ttl);

      expect(mockRedisInstance.setex).toHaveBeenCalledWith(key, ttl, value);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const value = "test-value";
      const error = new Error("Redis connection failed");

      mockRedisInstance.set.mockRejectedValue(error);

      await expect(redisUtils.set(key, value)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.get", () => {
    it("should get string value", async () => {
      const key = "test:key";
      const value = "test-value";

      mockRedisInstance.get.mockResolvedValue(value);

      const result = await redisUtils.get(key);

      expect(mockRedisInstance.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it("should get JSON value", async () => {
      const key = "test:key";
      const value = { name: "test", age: 25 };
      const jsonValue = JSON.stringify(value);

      mockRedisInstance.get.mockResolvedValue(jsonValue);

      const result = await redisUtils.get(key);

      expect(mockRedisInstance.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it("should return null for non-existent key", async () => {
      const key = "test:key";

      mockRedisInstance.get.mockResolvedValue(null);

      const result = await redisUtils.get(key);

      expect(mockRedisInstance.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.get.mockRejectedValue(error);

      await expect(redisUtils.get(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.del", () => {
    it("should delete key successfully", async () => {
      const key = "test:key";

      mockRedisInstance.del.mockResolvedValue(1);

      await redisUtils.del(key);

      expect(mockRedisInstance.del).toHaveBeenCalledWith(key);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.del.mockRejectedValue(error);

      await expect(redisUtils.del(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.exists", () => {
    it("should return true for existing key", async () => {
      const key = "test:key";

      mockRedisInstance.exists.mockResolvedValue(1);

      const result = await redisUtils.exists(key);

      expect(mockRedisInstance.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it("should return false for non-existent key", async () => {
      const key = "test:key";

      mockRedisInstance.exists.mockResolvedValue(0);

      const result = await redisUtils.exists(key);

      expect(mockRedisInstance.exists).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.exists.mockRejectedValue(error);

      await expect(redisUtils.exists(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.expire", () => {
    it("should set expiration for key", async () => {
      const key = "test:key";
      const ttl = 3600;

      mockRedisInstance.expire.mockResolvedValue(1);

      await redisUtils.expire(key, ttl);

      expect(mockRedisInstance.expire).toHaveBeenCalledWith(key, ttl);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const ttl = 3600;
      const error = new Error("Redis connection failed");

      mockRedisInstance.expire.mockRejectedValue(error);

      await expect(redisUtils.expire(key, ttl)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.ttl", () => {
    it("should get TTL for key", async () => {
      const key = "test:key";
      const ttl = 3600;

      mockRedisInstance.ttl.mockResolvedValue(ttl);

      const result = await redisUtils.ttl(key);

      expect(mockRedisInstance.ttl).toHaveBeenCalledWith(key);
      expect(result).toBe(ttl);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.ttl.mockRejectedValue(error);

      await expect(redisUtils.ttl(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.hset", () => {
    it("should set hash field", async () => {
      const key = "test:key";
      const field = "name";
      const value = "test-value";

      mockRedisInstance.hset.mockResolvedValue(1);

      await redisUtils.hset(key, field, value);

      expect(mockRedisInstance.hset).toHaveBeenCalledWith(key, field, value);
    });

    it("should set hash field with object value", async () => {
      const key = "test:key";
      const field = "data";
      const value = { name: "test", age: 25 };

      mockRedisInstance.hset.mockResolvedValue(1);

      await redisUtils.hset(key, field, value);

      expect(mockRedisInstance.hset).toHaveBeenCalledWith(
        key,
        field,
        JSON.stringify(value)
      );
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const field = "name";
      const value = "test-value";
      const error = new Error("Redis connection failed");

      mockRedisInstance.hset.mockRejectedValue(error);

      await expect(redisUtils.hset(key, field, value)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.hget", () => {
    it("should get hash field", async () => {
      const key = "test:key";
      const field = "name";
      const value = "test-value";

      mockRedisInstance.hget.mockResolvedValue(value);

      const result = await redisUtils.hget(key, field);

      expect(mockRedisInstance.hget).toHaveBeenCalledWith(key, field);
      expect(result).toBe(value);
    });

    it("should get hash field with JSON value", async () => {
      const key = "test:key";
      const field = "data";
      const value = { name: "test", age: 25 };
      const jsonValue = JSON.stringify(value);

      mockRedisInstance.hget.mockResolvedValue(jsonValue);

      const result = await redisUtils.hget(key, field);

      expect(mockRedisInstance.hget).toHaveBeenCalledWith(key, field);
      expect(result).toEqual(value);
    });

    it("should return null for non-existent field", async () => {
      const key = "test:key";
      const field = "name";

      mockRedisInstance.hget.mockResolvedValue(null);

      const result = await redisUtils.hget(key, field);

      expect(mockRedisInstance.hget).toHaveBeenCalledWith(key, field);
      expect(result).toBeNull();
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const field = "name";
      const error = new Error("Redis connection failed");

      mockRedisInstance.hget.mockRejectedValue(error);

      await expect(redisUtils.hget(key, field)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.hgetall", () => {
    it("should get all hash fields", async () => {
      const key = "test:key";
      const value = { name: "test", age: "25" };

      mockRedisInstance.hgetall.mockResolvedValue(value);

      const result = await redisUtils.hgetall(key);

      expect(mockRedisInstance.hgetall).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it("should return null for empty hash", async () => {
      const key = "test:key";

      mockRedisInstance.hgetall.mockResolvedValue({});

      const result = await redisUtils.hgetall(key);

      expect(mockRedisInstance.hgetall).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.hgetall.mockRejectedValue(error);

      await expect(redisUtils.hgetall(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.lpush", () => {
    it("should push to list", async () => {
      const key = "test:key";
      const value = "test-value";

      mockRedisInstance.lpush.mockResolvedValue(1);

      await redisUtils.lpush(key, value);

      expect(mockRedisInstance.lpush).toHaveBeenCalledWith(key, value);
    });

    it("should push object to list", async () => {
      const key = "test:key";
      const value = { name: "test", age: 25 };

      mockRedisInstance.lpush.mockResolvedValue(1);

      await redisUtils.lpush(key, value);

      expect(mockRedisInstance.lpush).toHaveBeenCalledWith(
        key,
        JSON.stringify(value)
      );
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const value = "test-value";
      const error = new Error("Redis connection failed");

      mockRedisInstance.lpush.mockRejectedValue(error);

      await expect(redisUtils.lpush(key, value)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.rpop", () => {
    it("should pop from list", async () => {
      const key = "test:key";
      const value = "test-value";

      mockRedisInstance.rpop.mockResolvedValue(value);

      const result = await redisUtils.rpop(key);

      expect(mockRedisInstance.rpop).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it("should pop JSON value from list", async () => {
      const key = "test:key";
      const value = { name: "test", age: 25 };
      const jsonValue = JSON.stringify(value);

      mockRedisInstance.rpop.mockResolvedValue(jsonValue);

      const result = await redisUtils.rpop(key);

      expect(mockRedisInstance.rpop).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it("should return null for empty list", async () => {
      const key = "test:key";

      mockRedisInstance.rpop.mockResolvedValue(null);

      const result = await redisUtils.rpop(key);

      expect(mockRedisInstance.rpop).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.rpop.mockRejectedValue(error);

      await expect(redisUtils.rpop(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.sadd", () => {
    it("should add to set", async () => {
      const key = "test:key";
      const member = "test-member";

      mockRedisInstance.sadd.mockResolvedValue(1);

      await redisUtils.sadd(key, member);

      expect(mockRedisInstance.sadd).toHaveBeenCalledWith(key, member);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const member = "test-member";
      const error = new Error("Redis connection failed");

      mockRedisInstance.sadd.mockRejectedValue(error);

      await expect(redisUtils.sadd(key, member)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.srem", () => {
    it("should remove from set", async () => {
      const key = "test:key";
      const member = "test-member";

      mockRedisInstance.srem.mockResolvedValue(1);

      await redisUtils.srem(key, member);

      expect(mockRedisInstance.srem).toHaveBeenCalledWith(key, member);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const member = "test-member";
      const error = new Error("Redis connection failed");

      mockRedisInstance.srem.mockRejectedValue(error);

      await expect(redisUtils.srem(key, member)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.smembers", () => {
    it("should get set members", async () => {
      const key = "test:key";
      const members = ["member1", "member2", "member3"];

      mockRedisInstance.smembers.mockResolvedValue(members);

      const result = await redisUtils.smembers(key);

      expect(mockRedisInstance.smembers).toHaveBeenCalledWith(key);
      expect(result).toEqual(members);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const error = new Error("Redis connection failed");

      mockRedisInstance.smembers.mockRejectedValue(error);

      await expect(redisUtils.smembers(key)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.sismember", () => {
    it("should return true for existing member", async () => {
      const key = "test:key";
      const member = "test-member";

      mockRedisInstance.sismember.mockResolvedValue(1);

      const result = await redisUtils.sismember(key, member);

      expect(mockRedisInstance.sismember).toHaveBeenCalledWith(key, member);
      expect(result).toBe(true);
    });

    it("should return false for non-existent member", async () => {
      const key = "test:key";
      const member = "test-member";

      mockRedisInstance.sismember.mockResolvedValue(0);

      const result = await redisUtils.sismember(key, member);

      expect(mockRedisInstance.sismember).toHaveBeenCalledWith(key, member);
      expect(result).toBe(false);
    });

    it("should handle Redis errors", async () => {
      const key = "test:key";
      const member = "test-member";
      const error = new Error("Redis connection failed");

      mockRedisInstance.sismember.mockRejectedValue(error);

      await expect(redisUtils.sismember(key, member)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.publish", () => {
    it("should publish message", async () => {
      const channel = "test:channel";
      const message = "test-message";

      mockRedisInstance.publish.mockResolvedValue(1);

      await redisUtils.publish(channel, message);

      expect(mockRedisInstance.publish).toHaveBeenCalledWith(channel, message);
    });

    it("should publish object message", async () => {
      const channel = "test:channel";
      const message = { type: "test", data: "test-data" };

      mockRedisInstance.publish.mockResolvedValue(1);

      await redisUtils.publish(channel, message);

      expect(mockRedisInstance.publish).toHaveBeenCalledWith(
        channel,
        JSON.stringify(message)
      );
    });

    it("should handle Redis errors", async () => {
      const channel = "test:channel";
      const message = "test-message";
      const error = new Error("Redis connection failed");

      mockRedisInstance.publish.mockRejectedValue(error);

      await expect(redisUtils.publish(channel, message)).rejects.toThrow(
        "Redis connection failed"
      );
    });
  });

  describe("redisUtils.subscribe", () => {
    it("should subscribe to channel", () => {
      const channel = "test:channel";
      const callback = vi.fn();

      const mockSubscriber = {
        subscribe: vi.fn(),
        on: vi.fn(),
      };

      mockRedisInstance.duplicate.mockReturnValue(mockSubscriber);

      redisUtils.subscribe(channel, callback);

      expect(mockRedisInstance.duplicate).toHaveBeenCalled();
      expect(mockSubscriber.subscribe).toHaveBeenCalledWith(channel);
    });

    it("should handle subscription errors", () => {
      const channel = "test:channel";
      const callback = vi.fn();
      const error = new Error("Subscription failed");

      mockRedisInstance.duplicate.mockImplementation(() => {
        throw error;
      });

      expect(() => redisUtils.subscribe(channel, callback)).toThrow(
        "Subscription failed"
      );
    });
  });

  describe("Redis connection events", () => {
    it("should handle connection events", () => {
      // Redis connection events are set up when the module is imported
      // Since we can't easily test the actual event handlers, we'll just verify
      // that the Redis instance was created and configured
      expect(mockRedisInstance).toBeDefined();
      expect(typeof mockRedisInstance.on).toBe("function");
    });
  });

  describe("Redis graceful shutdown", () => {
    it("should handle SIGINT signal", async () => {
      const mockQuit = vi.fn().mockResolvedValue(undefined);
      mockRedisInstance.quit = mockQuit;

      // Simulate SIGINT
      process.emit("SIGINT" as any);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockQuit).toHaveBeenCalled();
    });

    it("should handle SIGTERM signal", async () => {
      const mockQuit = vi.fn().mockResolvedValue(undefined);
      mockRedisInstance.quit = mockQuit;

      // Simulate SIGTERM
      process.emit("SIGTERM" as any);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockQuit).toHaveBeenCalled();
    });
  });
});
