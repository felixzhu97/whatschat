import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchService } from "@/application/services/search.service";

describe("SearchService", () => {
  let service: SearchService;
  let mockEs: { getClient: ReturnType<typeof vi.fn> };
  let mockPrisma: {
    user: { findMany: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockEs = {
      getClient: vi.fn().mockReturnValue(null),
    };

    mockPrisma = {
      user: { findMany: vi.fn().mockResolvedValue([]) },
    };

    service = new SearchService(mockEs as any, mockPrisma as any);
  });

  describe("searchUsers", () => {
    it("should use fallback when elasticsearch is not available", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "user-1", username: "testuser", avatar: null, createdAt: new Date() },
      ]);

      const result = await service.searchUsers("test", 10);

      expect(result.hits).toHaveLength(1);
    });

    it("should return empty for empty query", async () => {
      const result = await service.searchUsers("", 10);

      expect(result.hits).toEqual([]);
    });

    it("should return empty for whitespace query", async () => {
      const result = await service.searchUsers("   ", 10);

      expect(result.hits).toEqual([]);
    });

    it("should search with elasticsearch when available", async () => {
      const mockClient = {
        search: vi.fn().mockResolvedValue({
          hits: {
            hits: [
              {
                _id: "user-1",
                _source: { username: "testuser", avatar: null },
                sort: [new Date().toISOString(), "user-1"],
              },
            ],
            total: { value: 1 },
          },
        }),
      };
      mockEs.getClient.mockReturnValue(mockClient);

      const result = await service.searchUsers("test", 10);

      expect(mockClient.search).toHaveBeenCalled();
    });
  });

  describe("searchPosts", () => {
    it("should return empty when elasticsearch is not available", async () => {
      const result = await service.searchPosts("test", 10);

      expect(result.hits).toEqual([]);
    });

    it("should search posts with elasticsearch", async () => {
      const mockClient = {
        search: vi.fn().mockResolvedValue({
          hits: {
            hits: [
              {
                _id: "post-1",
                _source: { caption: "Test post", hashtags: ["#test"] },
                sort: [new Date().toISOString(), "post-1"],
              },
            ],
            total: { value: 1 },
          },
        }),
      };
      mockEs.getClient.mockReturnValue(mockClient);

      const result = await service.searchPosts("test", 10);

      expect(mockClient.search).toHaveBeenCalled();
    });
  });

  describe("searchHashtags", () => {
    it("should return empty when elasticsearch is not available", async () => {
      const result = await service.searchHashtags("#test", 10);

      expect(result.hits).toEqual([]);
    });

    it("should search hashtags with elasticsearch", async () => {
      const mockClient = {
        search: vi.fn().mockResolvedValue({
          hits: {
            hits: [
              {
                _source: { tag: "test", count: 100 },
                sort: ["test"],
              },
            ],
          },
        }),
      };
      mockEs.getClient.mockReturnValue(mockClient);

      const result = await service.searchHashtags("#test", 10);

      expect(mockClient.search).toHaveBeenCalled();
    });
  });
});
