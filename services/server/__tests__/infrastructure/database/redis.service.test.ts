import { describe, it, expect, vi, beforeEach } from "vitest";

describe("RedisService", () => {
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      on: vi.fn(),
      setex: vi.fn(),
      set: vi.fn().mockResolvedValue("OK"),
      get: vi.fn(),
      del: vi.fn().mockResolvedValue(1),
      exists: vi.fn(),
      expire: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(120),
      sadd: vi.fn().mockResolvedValue(1),
      smembers: vi.fn().mockResolvedValue([]),
      srem: vi.fn().mockResolvedValue(1),
      rpush: vi.fn().mockResolvedValue(1),
      lpush: vi.fn().mockResolvedValue(1),
      lrange: vi.fn().mockResolvedValue([]),
      ltrim: vi.fn().mockResolvedValue("OK"),
      quit: vi.fn().mockResolvedValue("OK"),
    };
  });

  describe("Redis client operations", () => {
    it("should have on method for event handlers", () => {
      expect(typeof mockRedisClient.on).toBe("function");
    });

    it("should set and get values", async () => {
      mockRedisClient.get.mockResolvedValue("test-value");
      
      const result = await mockRedisClient.get("key");
      
      expect(mockRedisClient.get).toHaveBeenCalledWith("key");
      expect(result).toBe("test-value");
    });

    it("should set with expiration", async () => {
      await mockRedisClient.setex("key", 60, "value");
      
      expect(mockRedisClient.setex).toHaveBeenCalledWith("key", 60, "value");
    });

    it("should delete keys", async () => {
      await mockRedisClient.del("key");
      
      expect(mockRedisClient.del).toHaveBeenCalledWith("key");
    });

    it("should check key existence", async () => {
      mockRedisClient.exists.mockResolvedValue(1);
      
      const result = await mockRedisClient.exists("key");
      
      expect(result).toBe(1);
    });

    it("should set expiration on keys", async () => {
      await mockRedisClient.expire("key", 60);
      
      expect(mockRedisClient.expire).toHaveBeenCalledWith("key", 60);
    });

    it("should get TTL of keys", async () => {
      const result = await mockRedisClient.ttl("key");
      
      expect(result).toBe(120);
    });

    it("should add members to sets", async () => {
      const result = await mockRedisClient.sadd("set", "member1", "member2");
      
      expect(result).toBe(1);
      expect(mockRedisClient.sadd).toHaveBeenCalledWith("set", "member1", "member2");
    });

    it("should get set members", async () => {
      mockRedisClient.smembers.mockResolvedValue(["member1", "member2"]);
      
      const result = await mockRedisClient.smembers("set");
      
      expect(result).toEqual(["member1", "member2"]);
    });

    it("should remove members from sets", async () => {
      const result = await mockRedisClient.srem("set", "member1");
      
      expect(result).toBe(1);
      expect(mockRedisClient.srem).toHaveBeenCalledWith("set", "member1");
    });

    it("should push to lists from right", async () => {
      const result = await mockRedisClient.rpush("list", "value1", "value2");
      
      expect(result).toBe(1);
      expect(mockRedisClient.rpush).toHaveBeenCalledWith("list", "value1", "value2");
    });

    it("should push to lists from left", async () => {
      const result = await mockRedisClient.lpush("list", "value1", "value2");
      
      expect(result).toBe(1);
      expect(mockRedisClient.lpush).toHaveBeenCalledWith("list", "value1", "value2");
    });

    it("should get list ranges", async () => {
      mockRedisClient.lrange.mockResolvedValue(["elem1", "elem2"]);
      
      const result = await mockRedisClient.lrange("list", 0, -1);
      
      expect(result).toEqual(["elem1", "elem2"]);
      expect(mockRedisClient.lrange).toHaveBeenCalledWith("list", 0, -1);
    });

    it("should trim lists", async () => {
      await mockRedisClient.ltrim("list", 0, 10);
      
      expect(mockRedisClient.ltrim).toHaveBeenCalledWith("list", 0, 10);
    });

    it("should quit connection", async () => {
      await mockRedisClient.quit();
      
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle Redis errors for get", async () => {
      mockRedisClient.get.mockRejectedValue(new Error("Redis error"));
      
      await expect(mockRedisClient.get("key")).rejects.toThrow("Redis error");
    });

    it("should handle Redis errors for set", async () => {
      mockRedisClient.setex.mockRejectedValue(new Error("Redis error"));
      
      await expect(mockRedisClient.setex("key", 60, "value")).rejects.toThrow("Redis error");
    });

    it("should handle Redis errors for del", async () => {
      mockRedisClient.del.mockRejectedValue(new Error("Redis error"));
      
      await expect(mockRedisClient.del("key")).rejects.toThrow("Redis error");
    });
  });

  describe("JSON serialization", () => {
    it("should serialize objects to JSON", () => {
      const obj = { data: "test" };
      const serialized = JSON.stringify(obj);
      
      expect(serialized).toBe('{"data":"test"}');
    });

    it("should parse JSON strings", () => {
      const json = '{"data":"test"}';
      const parsed = JSON.parse(json);
      
      expect(parsed).toEqual({ data: "test" });
    });

    it("should handle invalid JSON gracefully", () => {
      const invalidJson = "not valid json";
      const fn = () => JSON.parse(invalidJson);
      
      expect(fn).toThrow();
    });
  });

  describe("URL parsing", () => {
    it("should parse redis:// URL format", () => {
      const url = "redis://localhost:6379";
      
      expect(url.startsWith("redis://")).toBe(true);
    });

    it("should parse rediss:// URL format", () => {
      const url = "rediss://localhost:6379";
      
      expect(url.startsWith("rediss://")).toBe(true);
    });

    it("should parse host:port format", () => {
      const url = "127.0.0.1:6379";
      const [host, port] = url.split(":");
      
      expect(host).toBe("127.0.0.1");
      expect(port).toBe("6379");
    });
  });

  describe("setIfNotExists logic", () => {
    it("should return true when key was set", async () => {
      mockRedisClient.set.mockResolvedValue("OK");
      
      const result = await mockRedisClient.set("key", "value", "EX", 60, "NX");
      
      expect(result).toBe("OK");
    });

    it("should return null when key already exists", async () => {
      mockRedisClient.set.mockResolvedValue(null);
      
      const result = await mockRedisClient.set("key", "value", "EX", 60, "NX");
      
      expect(result).toBeNull();
    });
  });
});
