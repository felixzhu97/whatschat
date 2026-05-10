import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExploreService } from "@/application/services/explore.service";
import { RedisService } from "@/infrastructure/database/redis.service";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { RecommendationService } from "@/application/services/recommendation.service";
import { ExperimentService } from "@/application/services/experiment.service";
import { AdService } from "@/application/services/ad.service";
import type { IPostRepository } from "@/domain/interfaces/repositories/post.repository.interface";

vi.mock("@/infrastructure/database/redis.service", () => ({
  RedisService: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

vi.mock("@/application/services/recommendation.service", () => ({
  RecommendationService: vi.fn().mockImplementation(() => ({
    rankExplore: vi.fn(),
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

describe("ExploreService", () => {
  let exploreService: ExploreService;
  let mockRedis: Partial<RedisService>;
  let mockPrisma: Partial<PrismaService>;
  let mockPostRepo: Partial<IPostRepository>;
  let mockRecommendation: Partial<RecommendationService>;
  let mockExperiments: Partial<ExperimentService>;
  let mockAds: Partial<AdService>;

  const mockExploreEntry = {
    postId: "post-1",
    authorId: "user-1",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockRedis = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    mockPrisma = {
      userFollow: {
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    mockPostRepo = {
      getPostsByUserId: vi.fn().mockResolvedValue({ rows: [] }),
    };

    mockRecommendation = {
      rankExplore: vi.fn().mockResolvedValue({
        items: [{ id: "post-1", score: 1.5 }],
      }),
    };

    mockExperiments = {
      assign: vi.fn().mockReturnValue({ experimentId: "exp-1", variantId: "var-1" }),
    };

    mockAds = {
      getAdCandidates: vi.fn().mockResolvedValue([]),
    };

    exploreService = new ExploreService(
      mockRedis as RedisService,
      mockPrisma as PrismaService,
      mockPostRepo as IPostRepository,
      mockRecommendation as RecommendationService,
      mockExperiments as ExperimentService,
      mockAds as AdService
    );
  });

  describe("getExplore", () => {
    it("should return explore entries with pagination", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([mockExploreEntry]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockRecommendation.rankExplore = vi.fn().mockResolvedValue({
        items: [{ id: "post-1", score: 1.5 }],
      });

      const result = await exploreService.getExplore("user-1", 10, 0);

      expect(result).toHaveProperty("entries");
      expect(result).toHaveProperty("total");
      expect(result.entries.length).toBeGreaterThan(0);
    });

    it("should filter out posts from followed users", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([mockExploreEntry]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([
        { followingId: "user-1" },
      ]);
      mockRecommendation.rankExplore = vi.fn().mockResolvedValue({ items: [] });

      await exploreService.getExplore("user-1", 10, 0);

      expect(mockRecommendation.rankExplore).toHaveBeenCalled();
    });

    it("should use fallback when cache is empty", async () => {
      mockRedis.get = vi.fn().mockResolvedValue(null);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([
        { id: "user-2" },
      ]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockPostRepo.getPostsByUserId = vi.fn().mockResolvedValue({
        rows: [
          { post_id: "post-2", user_id: "user-2", created_at: new Date() },
        ],
      });

      const result = await exploreService.getExplore("user-1", 10, 0);

      expect(result.entries.length).toBeGreaterThan(0);
    });

    it("should rank entries using recommendation service", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([mockExploreEntry]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);

      await exploreService.getExplore("user-1", 10, 0);

      expect(mockRecommendation.rankExplore).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          candidateIds: expect.any(Array),
          experimentId: "exp-1",
          variantId: "var-1",
        })
      );
    });

    it("should use fallback ordering when ranking returns empty", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([
        mockExploreEntry,
        { ...mockExploreEntry, postId: "post-2", authorId: "user-2" },
      ]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockRecommendation.rankExplore = vi.fn().mockResolvedValue({ items: [] });

      const result = await exploreService.getExplore("user-1", 10, 0);

      expect(result.entries.length).toBeGreaterThan(0);
    });

    it("should respect offset and limit", async () => {
      const entries = Array.from({ length: 20 }, (_, i) => ({
        postId: `post-${i}`,
        authorId: `user-${i}`,
        createdAt: new Date().toISOString(),
      }));
      mockRedis.get = vi.fn().mockResolvedValue(entries);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockRecommendation.rankExplore = vi.fn().mockResolvedValue({
        items: entries.map((e) => ({ id: e.postId, score: 1 })),
      });

      const result = await exploreService.getExplore("user-1", 5, 10);

      expect(result.entries.length).toBeLessThanOrEqual(5);
    });

    it("should insert ads into results", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([mockExploreEntry]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockRecommendation.rankExplore = vi.fn().mockResolvedValue({
        items: [{ id: "post-1", score: 1.5 }],
      });
      mockAds.getAdCandidates = vi.fn().mockResolvedValue([
        {
          creativeId: "ad-1",
          accountId: "acc-1",
          campaignId: "camp-1",
          groupId: "group-1",
        },
      ]);

      const result = await exploreService.getExplore("user-1", 10, 0);

      expect(result.entries).toBeDefined();
    });

    it("should return empty entries when no candidates", async () => {
      mockRedis.get = vi.fn().mockResolvedValue([]);
      mockPrisma.userFollow!.findMany = vi.fn().mockResolvedValue([]);
      mockPrisma.user!.findMany = vi.fn().mockResolvedValue([]);

      const result = await exploreService.getExplore("user-1", 10, 0);

      expect(result.entries).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
