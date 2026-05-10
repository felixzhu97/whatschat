import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedCacheService, FeedEntryDto } from "@/infrastructure/cache/feed-cache.service";
import { CacheService } from "@/infrastructure/cache/cache.service";
import { CassandraFeedRepository } from "@/infrastructure/database/cassandra-feed.repository";

describe("FeedCacheService", () => {
  let service: FeedCacheService;
  let mockCacheService: Partial<CacheService>;
  let mockFeedRepo: Partial<CassandraFeedRepository>;

  beforeEach(() => {
    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };
    mockFeedRepo = {
      getFeedPage: vi.fn(),
    };
    service = new FeedCacheService(
      mockCacheService as CacheService,
      mockFeedRepo as CassandraFeedRepository
    );
    vi.clearAllMocks();
  });

  describe("getFeedPage", () => {
    it("should return cached feed when available and no pageState", async () => {
      const cachedFeed = {
        entries: [
          { postId: "post1", authorId: "user1", createdAt: new Date() },
          { postId: "post2", authorId: "user2", createdAt: new Date() },
        ] as FeedEntryDto[],
      };
      (mockCacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(cachedFeed);

      const result = await service.getFeedPage("user123", 10);

      expect(result).toEqual(cachedFeed);
      expect(mockFeedRepo.getFeedPage).not.toHaveBeenCalled();
    });

    it("should fetch from repository when cache miss and no pageState", async () => {
      const repoResult = {
        entries: [
          { post_id: "post1", author_id: "user1", created_at: new Date("2024-01-01") },
        ],
        pageState: "cursor123",
      };
      (mockCacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockFeedRepo.getFeedPage as ReturnType<typeof vi.fn>).mockResolvedValue(repoResult);
      (mockCacheService.set as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.getFeedPage("user123", 10);

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].postId).toBe("post1");
      expect(result.entries[0].authorId).toBe("user1");
      expect(result.pageState).toBe("cursor123");
      expect(mockFeedRepo.getFeedPage).toHaveBeenCalledWith("user123", 10, undefined);
    });

    it("should bypass cache and fetch from repository when pageState provided", async () => {
      const repoResult = {
        entries: [{ post_id: "post2", author_id: "user2", created_at: new Date() }],
        pageState: "cursor456",
      };
      (mockFeedRepo.getFeedPage as ReturnType<typeof vi.fn>).mockResolvedValue(repoResult);

      const result = await service.getFeedPage("user123", 10, "cursor123");

      expect(result.entries).toHaveLength(1);
      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(mockFeedRepo.getFeedPage).toHaveBeenCalledWith("user123", 10, "cursor123");
    });

    it("should not cache result when fetching with empty entries", async () => {
      const repoResult = { entries: [], pageState: undefined };
      (mockCacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockFeedRepo.getFeedPage as ReturnType<typeof vi.fn>).mockResolvedValue(repoResult);

      await service.getFeedPage("user123", 10);

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it("should not cache result when fetching with pageState", async () => {
      const repoResult = { entries: [{ post_id: "p1", author_id: "u1", created_at: new Date() }] };
      (mockFeedRepo.getFeedPage as ReturnType<typeof vi.fn>).mockResolvedValue(repoResult);

      await service.getFeedPage("user123", 10, "someCursor");

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it("should not cache result when cache already has entries", async () => {
      const cachedFeed = { entries: [{ postId: "cached", authorId: "user1", createdAt: new Date() }] };
      (mockCacheService.get as ReturnType<typeof vi.fn>).mockResolvedValue(cachedFeed);

      await service.getFeedPage("user123", 10);

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });
  });

  describe("invalidateFeed", () => {
    it("should delete cached feed for user", async () => {
      (mockCacheService.del as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.invalidateFeed("user123");

      expect(mockCacheService.del).toHaveBeenCalledWith("feed:user123");
    });
  });
});
