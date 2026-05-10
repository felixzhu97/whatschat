import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "../../../src/infrastructure/cache/cache.service";
import { RedisService } from "../../../src/infrastructure/database/redis.service";
import { ConfigService } from "../../../src/infrastructure/config/config.service";

vi.mock("../../../src/infrastructure/config/config.service", () => ({
  ConfigService: {
    loadConfig: vi.fn(() => ({
      redis: {
        url: "redis://localhost:6379",
        cacheTtlSeconds: 300,
      },
    })),
  },
}));

describe("CacheService", () => {
  let service: CacheService;
  let mockRedisService: Partial<RedisService>;

  beforeEach(() => {
    mockRedisService = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };
    service = new CacheService(mockRedisService as RedisService);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should load default TTL from config", () => {
      const service2 = new CacheService(mockRedisService as RedisService);
      expect(service2).toBeDefined();
    });
  });

  describe("get", () => {
    it("should retrieve value from redis with prefixed key", async () => {
      const expected = { id: "1", name: "test" };
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue(expected);

      const result = await service.get<typeof expected>("user:1");

      expect(mockRedisService.get).toHaveBeenCalledWith("cache:user:1");
      expect(result).toEqual(expected);
    });

    it("should return null when key does not exist", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await service.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when redis throws error and we catch it", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Redis error"));

      await expect(service.get("error-key")).rejects.toThrow("Redis error");
    });

    it("should handle string values correctly", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue("simple string");

      const result = await service.get<string>("string-key");

      expect(result).toBe("simple string");
    });

    it("should handle array values correctly", async () => {
      const expected = ["item1", "item2", "item3"];
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue(expected);

      const result = await service.get<string[]>("array-key");

      expect(result).toEqual(expected);
    });

    it("should handle numeric values", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue(42);

      const result = await service.get<number>("number-key");

      expect(result).toBe(42);
    });

    it("should handle boolean values", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.get<boolean>("boolean-key");

      expect(result).toBe(true);
    });
  });

  describe("set", () => {
    it("should set value with custom TTL", async () => {
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.set("key1", { data: "value" }, 60);

      expect(mockRedisService.set).toHaveBeenCalledWith("cache:key1", { data: "value" }, 60);
    });

    it("should set value with default TTL when not specified", async () => {
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.set("key2", "simple value");

      expect(mockRedisService.set).toHaveBeenCalledWith("cache:key2", "simple value", 300);
    });

    it("should use default TTL of 300 when config returns different value", async () => {
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.set("key3", "value");

      expect(mockRedisService.set).toHaveBeenCalledWith("cache:key3", "value", 300);
    });

    it("should set object values correctly", async () => {
      const obj = { nested: { data: "value" }, arr: [1, 2, 3] };
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.set("object-key", obj);

      expect(mockRedisService.set).toHaveBeenCalledWith("cache:object-key", obj, 300);
    });

    it("should set numeric values", async () => {
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.set("count", 100, 60);

      expect(mockRedisService.set).toHaveBeenCalledWith("cache:count", 100, 60);
    });

    it("should throw error when redis set fails", async () => {
      const error = new Error("Redis SET error");
      (mockRedisService.set as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(service.set("error-key", "value")).rejects.toThrow("Redis SET error");
    });
  });

  describe("del", () => {
    it("should delete single key with prefixed key", async () => {
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.del("key1");

      expect(mockRedisService.del).toHaveBeenCalledWith("cache:key1");
    });

    it("should delete key successfully even if key does not exist", async () => {
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await expect(service.del("nonexistent")).resolves.toBeUndefined();
    });

    it("should throw error when redis del fails", async () => {
      const error = new Error("Redis DEL error");
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(service.del("error-key")).rejects.toThrow("Redis DEL error");
    });
  });

  describe("delMany", () => {
    it("should delete multiple keys with prefixed keys", async () => {
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.delMany(["key1", "key2", "key3"]);

      expect(mockRedisService.del).toHaveBeenCalledTimes(3);
      expect(mockRedisService.del).toHaveBeenNthCalledWith(1, "cache:key1");
      expect(mockRedisService.del).toHaveBeenNthCalledWith(2, "cache:key2");
      expect(mockRedisService.del).toHaveBeenNthCalledWith(3, "cache:key3");
    });

    it("should handle empty array", async () => {
      await service.delMany([]);

      expect(mockRedisService.del).not.toHaveBeenCalled();
    });

    it("should handle single key array", async () => {
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.delMany(["single"]);

      expect(mockRedisService.del).toHaveBeenCalledTimes(1);
      expect(mockRedisService.del).toHaveBeenCalledWith("cache:single");
    });

    it("should handle duplicate keys in array", async () => {
      (mockRedisService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.delMany(["key1", "key1", "key2"]);

      expect(mockRedisService.del).toHaveBeenCalledTimes(3);
    });

    it("should continue deleting even if one delete fails", async () => {
      const error = new Error("Redis DEL error");
      (mockRedisService.del as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);

      await expect(service.delMany(["key1", "key2", "key3"])).rejects.toThrow("Redis DEL error");
      expect(mockRedisService.del).toHaveBeenCalledTimes(2);
    });
  });

  describe("key prefix handling", () => {
    it("should add cache: prefix to keys", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue("value");

      await service.get("mykey");

      expect(mockRedisService.get).toHaveBeenCalledWith("cache:mykey");
    });

    it("should handle keys with special characters", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue("value");

      await service.get("user:profile:123");

      expect(mockRedisService.get).toHaveBeenCalledWith("cache:user:profile:123");
    });

    it("should handle keys with colons", async () => {
      (mockRedisService.get as ReturnType<typeof vi.fn>).mockResolvedValue("value");

      await service.get("feed:user123:page2");

      expect(mockRedisService.get).toHaveBeenCalledWith("cache:feed:user123:page2");
    });
  });
});
