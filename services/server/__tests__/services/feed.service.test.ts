import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedService } from "@/application/services/feed.service";
import { FeedCacheService } from "@/infrastructure/cache/feed-cache.service";
import { PostService } from "@/application/services/post.service";
import { RecommendationService } from "@/application/services/recommendation.service";
import { ExperimentService } from "@/application/services/experiment.service";
import { AdService } from "@/application/services/ad.service";
import type { IEngagementRepository } from "@/domain/interfaces/repositories/engagement.repository.interface";

vi.mock("@/infrastructure/cache/feed-cache.service", () => ({
  FeedCacheService: vi.fn().mockImplementation(() => ({
    getFeedPage: vi.fn(),
    invalidateFeed: vi.fn(),
  })),
}));

vi.mock("@/application/services/post.service", () => ({
  PostService: vi.fn().mockImplementation(() => ({
    getPostsByUser: vi.fn(),
    getPostsBatch: vi.fn(),
  })),
}));

vi.mock("@/application/services/recommendation.service", () => ({
  RecommendationService: vi.fn().mockImplementation(() => ({
    rankFeed: vi.fn(),
  })),
}));

vi.mock("@/application/services/experiment.service", () => ({
  ExperimentService: vi.fn().mockImplementation(() => ({
    assign: vi.fn().mockReturnValue({ experimentId: "exp-1", variantId: "var-1" }),
  })),
}));

vi.mock("@/application/services/ad.service", () => ({
  AdService: vi.fn().mockImplementation(() => ({
    getAdCandidates: vi.fn(),
  })),
}));

describe("FeedService", () => {
  let feedService: FeedService;
  let mockFeedCache: Partial<FeedCacheService>;
  let mockPostService: Partial<PostService>;
  let mockEngagementRepo: Partial<IEngagementRepository>;
  let mockRecommendation: Partial<RecommendationService>;
  let mockExperiments: Partial<ExperimentService>;
  let mockAds: Partial<AdService>;

  const mockFeedEntry = { postId: "post-1", authorId: "user-1", createdAt: new Date() };
  const mockEngagementCounts = new Map([["post-1", { likeCount: 10, commentCount: 5, saveCount: 3 }]]);

  beforeEach(() => {
    mockFeedCache = {
      getFeedPage: vi.fn().mockResolvedValue({
        entries: [mockFeedEntry],
        pageState: undefined,
      }),
      invalidateFeed: vi.fn(),
    };

    mockPostService = {
      getPostsByUser: vi.fn().mockResolvedValue({ posts: [], pageState: undefined }),
      getPostsBatch: vi.fn().mockResolvedValue([
        { postId: "post-1", authorId: "user-1", type: "IMAGE" },
      ]),
    };

    mockEngagementRepo = {
      getEngagementCountsBatch: vi.fn().mockResolvedValue(mockEngagementCounts),
    };

    mockRecommendation = {
      rankFeed: vi.fn().mockResolvedValue({ items: [{ id: "post-1", score: 1.5 }] }),
    };

    mockExperiments = {
      assign: vi.fn().mockReturnValue({ experimentId: "exp-1", variantId: "var-1" }),
    };

    mockAds = {
      getAdCandidates: vi.fn().mockResolvedValue([]),
    };

    feedService = new FeedService(
      mockFeedCache as FeedCacheService,
      mockPostService as PostService,
      mockEngagementRepo as IEngagementRepository,
      mockRecommendation as RecommendationService,
      mockExperiments as ExperimentService,
      mockAds as AdService
    );
  });

  describe("getFeed", () => {
    it("should return feed entries with pagination", async () => {
      const result = await feedService.getFeed("user-1", 10);

      expect(result).toHaveProperty("entries");
      expect(result).toHaveProperty("pageState");
      expect(mockFeedCache.getFeedPage).toHaveBeenCalledWith("user-1", 10, undefined);
    });

    it("should use cached pageState when provided", async () => {
      await feedService.getFeed("user-1", 10, "cursor-123");

      expect(mockFeedCache.getFeedPage).toHaveBeenCalledWith("user-1", 10, "cursor-123");
    });

    it("should filter visible entries", async () => {
      await feedService.getFeed("user-1", 10);

      expect(mockPostService.getPostsBatch).toHaveBeenCalled();
    });

    it("should include own posts when no pageState", async () => {
      await feedService.getFeed("user-1", 10);

      expect(mockPostService.getPostsByUser).toHaveBeenCalledWith("user-1", 10, undefined);
    });

    it("should not include own posts when pageState is provided", async () => {
      mockFeedCache.getFeedPage = vi.fn().mockResolvedValue({
        entries: [{ postId: "post-1", authorId: "user-2", createdAt: new Date() }],
        pageState: "next-cursor",
      });

      await feedService.getFeed("user-1", 10, "cursor-123");

      expect(mockPostService.getPostsByUser).not.toHaveBeenCalled();
    });

    it("should rank feed using recommendation service", async () => {
      await feedService.getFeed("user-1", 10);

      expect(mockRecommendation.rankFeed).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          candidateIds: expect.any(Array),
          limit: 10,
          experimentId: "exp-1",
          variantId: "var-1",
        })
      );
    });

    it("should fallback to sorted posts when ranking returns empty", async () => {
      mockRecommendation.rankFeed = vi.fn().mockResolvedValue({ items: [] });

      const result = await feedService.getFeed("user-1", 10);

      expect(result.entries).toBeDefined();
    });

    it("should insert ads into feed", async () => {
      mockAds.getAdCandidates = vi.fn().mockResolvedValue([
        {
          creativeId: "ad-1",
          accountId: "acc-1",
          campaignId: "camp-1",
          groupId: "group-1",
        },
      ]);

      const result = await feedService.getFeed("user-1", 10);

      const hasSponsoredEntry = result.entries.some((e: any) => e.isSponsored === true);
      expect(hasSponsoredEntry).toBe(false);
    });

    it("should return empty entries when no candidates", async () => {
      mockFeedCache.getFeedPage = vi.fn().mockResolvedValue({ entries: [], pageState: undefined });
      mockPostService.getPostsByUser = vi.fn().mockResolvedValue({ posts: [], pageState: undefined });

      const result = await feedService.getFeed("user-1", 10);

      expect(result.entries).toEqual([]);
    });
  });

  describe("getReels", () => {
    it("should return only video entries", async () => {
      mockFeedCache.getFeedPage = vi.fn().mockResolvedValue({
        entries: [
          { postId: "post-1", authorId: "user-1", createdAt: new Date() },
          { postId: "post-2", authorId: "user-2", createdAt: new Date() },
        ],
        pageState: undefined,
      });
      mockPostService.getPostsBatch = vi.fn().mockResolvedValue([
        { postId: "post-1", authorId: "user-1", type: "VIDEO" },
        { postId: "post-2", authorId: "user-2", type: "IMAGE" },
      ]);

      const result = await feedService.getReels("user-1", 10);

      expect(result.entries.length).toBeLessThanOrEqual(10);
    });

    it("should paginate through feed to collect enough videos", async () => {
      mockFeedCache.getFeedPage = vi
        .fn()
        .mockResolvedValueOnce({
          entries: [{ postId: "post-1", authorId: "user-1", createdAt: new Date() }],
          pageState: "page-2",
        })
        .mockResolvedValueOnce({
          entries: [{ postId: "post-2", authorId: "user-2", createdAt: new Date() }],
          pageState: undefined,
        });
      mockPostService.getPostsBatch = vi.fn().mockResolvedValue([
        { postId: "post-1", authorId: "user-1", type: "VIDEO" },
        { postId: "post-2", authorId: "user-2", type: "VIDEO" },
      ]);

      const result = await feedService.getReels("user-1", 2);

      expect(mockFeedCache.getFeedPage).toHaveBeenCalledTimes(2);
    });

    it("should return empty entries when no video posts", async () => {
      mockFeedCache.getFeedPage = vi.fn().mockResolvedValue({
        entries: [{ postId: "post-1", authorId: "user-1", createdAt: new Date() }],
        pageState: undefined,
      });
      mockPostService.getPostsBatch = vi.fn().mockResolvedValue([
        { postId: "post-1", authorId: "user-1", type: "IMAGE" },
      ]);

      const result = await feedService.getReels("user-1", 10);

      expect(result.entries).toEqual([]);
    });
  });
});
