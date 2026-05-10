import { describe, it, expect, vi, beforeEach } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { FollowService } from "@/application/services/follow.service";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { RedisService } from "@/infrastructure/database/redis.service";

vi.mock("@/infrastructure/database/redis.service", () => ({
  RedisService: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

describe("FollowService", () => {
  let followService: FollowService;
  let mockPrisma: Partial<PrismaService>;
  let mockRedis: Partial<RedisService>;

  const mockUser = {
    id: "user-1",
    username: "testuser",
    avatar: null,
  };

  beforeEach(() => {
    mockPrisma = {
      userFollow: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    mockRedis = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    followService = new FollowService(
      mockPrisma as PrismaService,
      mockRedis as RedisService
    );
  });

  describe("follow", () => {
    it("should create a follow relationship", async () => {
      mockPrisma.userFollow!.upsert = vi.fn().mockResolvedValue({
        followerId: "user-1",
        followingId: "user-2",
      });

      const result = await followService.follow("user-1", "user-2");

      expect(result).toEqual({
        followerId: "user-1",
        followingId: "user-2",
        isFollowing: true,
      });
      expect(mockPrisma.userFollow!.upsert).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId: "user-1", followingId: "user-2" },
        },
        create: { followerId: "user-1", followingId: "user-2" },
        update: {},
      });
    });

    it("should throw BadRequestException when following self", async () => {
      await expect(followService.follow("user-1", "user-1")).rejects.toThrow(
        BadRequestException
      );
      await expect(followService.follow("user-1", "user-1")).rejects.toThrow(
        "Cannot follow self"
      );
    });
  });

  describe("unfollow", () => {
    it("should remove a follow relationship", async () => {
      mockPrisma.userFollow!.deleteMany = vi.fn().mockResolvedValue({ count: 1 });

      const result = await followService.unfollow("user-1", "user-2");

      expect(result).toEqual({
        followerId: "user-1",
        followingId: "user-2",
        isFollowing: false,
      });
      expect(mockPrisma.userFollow!.deleteMany).toHaveBeenCalledWith({
        where: { followerId: "user-1", followingId: "user-2" },
      });
    });
  });

  describe("checkFollowing", () => {
    it("should return set of following users", async () => {
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followingId: "user-2" },
        { followingId: "user-3" },
      ]);

      const result = await followService.checkFollowing("user-1", ["user-2", "user-3", "user-4"]);

      expect(result).toBeInstanceOf(Set);
      expect(result.has("user-2")).toBe(true);
      expect(result.has("user-3")).toBe(true);
      expect(result.has("user-4")).toBe(false);
    });

    it("should return empty set for empty input", async () => {
      const result = await followService.checkFollowing("user-1", []);

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it("should filter out current user from input", async () => {
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followingId: "user-2" },
      ]);

      const result = await followService.checkFollowing("user-1", ["user-1", "user-2"]);

      expect(result.has("user-1")).toBe(false);
    });
  });

  describe("getSuggestions", () => {
    it("should return cached suggestions if available", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(["user-2", "user-3"]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
        { id: "user-3", username: "user3", avatar: "avatar.jpg" },
      ]);

      const result = await followService.getSuggestions("user-1", 10);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("username");
      expect(result[0]).toHaveProperty("description");
    });

    it("should generate suggestions from friend-of-friends", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.userFollow!.findMany = vi
        .fn()
        .mockResolvedValueOnce([{ followingId: "user-2" }])
        .mockResolvedValueOnce([
          { followingId: "user-3", followerId: "user-2" },
          { followingId: "user-4", followerId: "user-2" },
        ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-3", username: "user3", avatar: null },
        { id: "user-4", username: "user4", avatar: null },
      ]);

      const result = await followService.getSuggestions("user-1", 10);

      expect(result.length).toBeGreaterThan(0);
      expect(mockPrisma.userFollow!.findMany).toHaveBeenCalledTimes(2);
    });

    it("should call Prisma with cached user IDs", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([
        "user-2", "user-3", "user-4", "user-5", "user-6",
      ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
        { id: "user-3", username: "user3", avatar: null },
        { id: "user-4", username: "user4", avatar: null },
        { id: "user-5", username: "user5", avatar: null },
        { id: "user-6", username: "user6", avatar: null },
      ]);

      await followService.getSuggestions("user-1", 3);

      expect(mockPrisma.user!.findMany).toHaveBeenCalledWith({
        where: { id: { in: ["user-2", "user-3", "user-4"] } },
        select: { id: true, username: true, avatar: true },
      });
    });

    it("should include fallback users when friend-of-friends insufficient", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.userFollow!.findMany = vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
      ]);

      const result = await followService.getSuggestions("user-1", 10);

      expect(result).toBeDefined();
    });
  });

  describe("getFollowersCount", () => {
    it("should return follower count", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(100);

      const result = await followService.getFollowersCount("user-1");

      expect(result).toBe(100);
      expect(mockPrisma.userFollow!.count).toHaveBeenCalledWith({
        where: { followingId: "user-1" },
      });
    });
  });

  describe("getFollowingCount", () => {
    it("should return following count", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(50);

      const result = await followService.getFollowingCount("user-1");

      expect(result).toBe(50);
      expect(mockPrisma.userFollow!.count).toHaveBeenCalledWith({
        where: { followerId: "user-1" },
      });
    });
  });

  describe("getFollowers", () => {
    it("should return paginated followers list", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(25);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followerId: "user-2" },
        { followerId: "user-3" },
      ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
        { id: "user-3", username: "user3", avatar: "avatar.jpg" },
      ]);

      const result = await followService.getFollowers("user-1", 20);

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.list[0]).toHaveProperty("id");
      expect(result.list[0]).toHaveProperty("username");
    });

    it("should indicate following status when currentUserId provided", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(1);
      mockPrisma.userFollow!.findMany = vi
        .fn()
        .mockResolvedValueOnce([{ followerId: "user-2" }])
        .mockResolvedValueOnce([{ followingId: "user-2" }]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
      ]);

      const result = await followService.getFollowers("user-1", 20, undefined, "user-1");

      expect(result.list[0]).toHaveProperty("isFollowing", true);
    });

    it("should calculate next pageState when more results exist", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(50);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followerId: "user-2" },
        { followerId: "user-3" },
      ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
        { id: "user-3", username: "user3", avatar: null },
      ]);

      const result = await followService.getFollowers("user-1", 2);

      expect(result.pageState).toBe("2");
    });

    it("should return empty list when no followers", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(0);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);

      const result = await followService.getFollowers("user-1", 20);

      expect(result.list).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("getFollowing", () => {
    it("should return paginated following list", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(15);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followingId: "user-2" },
        { followingId: "user-3" },
      ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2", username: "user2", avatar: null },
        { id: "user-3", username: "user3", avatar: "avatar.jpg" },
      ]);

      const result = await followService.getFollowing("user-1", 20);

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(15);
    });

    it("should parse pageState for cursor pagination", async () => {
      mockPrisma.userFollow!.count = vi.fn().mockResolvedValue(100);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followingId: "user-20" },
        { followingId: "user-21" },
      ]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-20", username: "user20", avatar: null },
        { id: "user-21", username: "user21", avatar: null },
      ]);

      const result = await followService.getFollowing("user-1", 20, "20");

      expect(mockPrisma.userFollow!.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20 })
      );
    });
  });
});
