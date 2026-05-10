import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeedSeenService } from "@/application/services/feed-seen.service";

describe("FeedSeenService", () => {
  let service: FeedSeenService;
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRedis = {
      sadd: vi.fn(),
      lpush: vi.fn(),
      ltrim: vi.fn(),
      lrange: vi.fn(),
      smembers: vi.fn(),
      expire: vi.fn(),
      del: vi.fn(),
    };

    service = new FeedSeenService(mockRedis);
  });

  describe("markSeen", () => {
    it("should return early for empty userId", async () => {
      await service.markSeen("", "post-1");
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it("should return early for empty postId", async () => {
      await service.markSeen("user-1", "");
      expect(mockRedis.sadd).not.toHaveBeenCalled();
    });

    it("should add post to seen set", async () => {
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.lpush.mockResolvedValue(1);
      mockRedis.ltrim.mockResolvedValue("OK");
      mockRedis.expire.mockResolvedValue(1);

      await service.markSeen("user-1", "post-1");

      expect(mockRedis.sadd).toHaveBeenCalledWith("feed:seen:set:user-1", "post-1");
    });

    it("should add to list when post is newly seen", async () => {
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.lpush.mockResolvedValue(1);
      mockRedis.ltrim.mockResolvedValue("OK");
      mockRedis.expire.mockResolvedValue(1);

      await service.markSeen("user-1", "post-1");

      expect(mockRedis.lpush).toHaveBeenCalledWith("feed:seen:list:user-1", "post-1");
      expect(mockRedis.ltrim).toHaveBeenCalled();
    });

    it("should not add to list when post was already seen", async () => {
      mockRedis.sadd.mockResolvedValue(0);
      mockRedis.expire.mockResolvedValue(1);

      await service.markSeen("user-1", "post-1");

      expect(mockRedis.lpush).not.toHaveBeenCalled();
    });

    it("should set TTL on both keys", async () => {
      mockRedis.sadd.mockResolvedValue(1);
      mockRedis.lpush.mockResolvedValue(1);
      mockRedis.ltrim.mockResolvedValue("OK");
      mockRedis.expire.mockResolvedValue(1);

      await service.markSeen("user-1", "post-1");

      expect(mockRedis.expire).toHaveBeenCalledTimes(2);
    });
  });

  describe("getRecentSeenIds", () => {
    it("should return empty array for empty userId", async () => {
      const result = await service.getRecentSeenIds("");
      expect(result).toEqual([]);
      expect(mockRedis.lrange).not.toHaveBeenCalled();
    });

    it("should return seen post IDs", async () => {
      mockRedis.lrange.mockResolvedValue(["post-1", "post-2", "post-3"]);

      const result = await service.getRecentSeenIds("user-1");

      expect(result).toEqual(["post-1", "post-2", "post-3"]);
    });

    it("should respect limit parameter", async () => {
      mockRedis.lrange.mockResolvedValue(["post-1", "post-2"]);

      await service.getRecentSeenIds("user-1", 2);

      expect(mockRedis.lrange).toHaveBeenCalledWith("feed:seen:list:user-1", 0, 1);
    });

    it("should filter out falsy values", async () => {
      mockRedis.lrange.mockResolvedValue(["post-1", null, "", "post-2", undefined]);

      const result = await service.getRecentSeenIds("user-1");

      expect(result).toEqual(["post-1", "post-2"]);
    });

    it("should return empty array when lrange returns null", async () => {
      mockRedis.lrange.mockResolvedValue(null);

      const result = await service.getRecentSeenIds("user-1");

      expect(result).toEqual([]);
    });

    it("should use default limit of 200", async () => {
      mockRedis.lrange.mockResolvedValue([]);

      await service.getRecentSeenIds("user-1");

      expect(mockRedis.lrange).toHaveBeenCalledWith("feed:seen:list:user-1", 0, 199);
    });
  });

  describe("isSeen", () => {
    it("should return false for empty userId", async () => {
      const result = await service.isSeen("", "post-1");
      expect(result).toBe(false);
    });

    it("should return false for empty postId", async () => {
      const result = await service.isSeen("user-1", "");
      expect(result).toBe(false);
    });

    it("should return true when post is seen", async () => {
      mockRedis.smembers.mockResolvedValue(["post-1", "post-2"]);

      const result = await service.isSeen("user-1", "post-1");

      expect(result).toBe(true);
    });

    it("should return false when post is not seen", async () => {
      mockRedis.smembers.mockResolvedValue(["post-1", "post-2"]);

      const result = await service.isSeen("user-1", "post-3");

      expect(result).toBe(false);
    });
  });

  describe("filterUnseen", () => {
    it("should return empty array for empty userId", async () => {
      const result = await service.filterUnseen("", ["post-1", "post-2"]);
      expect(result).toEqual(["post-1", "post-2"]);
    });

    it("should return empty array for empty postIds", async () => {
      const result = await service.filterUnseen("user-1", []);
      expect(result).toEqual([]);
    });

    it("should return empty array when postIds is not an array", async () => {
      const result = await service.filterUnseen("user-1", null as any);
      expect(result).toEqual([]);
    });

    it("should return all posts when none are seen", async () => {
      mockRedis.lrange.mockResolvedValue([]);

      const result = await service.filterUnseen("user-1", ["post-1", "post-2"]);

      expect(result).toEqual(["post-1", "post-2"]);
    });

    it("should filter out seen posts", async () => {
      mockRedis.lrange.mockResolvedValue(["post-1", "post-3"]);

      const result = await service.filterUnseen("user-1", ["post-1", "post-2", "post-3"]);

      expect(result).toEqual(["post-2"]);
    });

    it("should return all posts when all are seen", async () => {
      mockRedis.lrange.mockResolvedValue(["post-1", "post-2", "post-3"]);

      const result = await service.filterUnseen("user-1", ["post-1", "post-2"]);

      expect(result).toEqual([]);
    });
  });
});
