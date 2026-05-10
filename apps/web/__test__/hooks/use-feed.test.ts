import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFeed } from "@/src/presentation/hooks/use-feed";

vi.mock("@/infrastructure/adapters/api/feed-api.adapter", () => {
  return {
    FeedApiAdapter: vi.fn().mockImplementation(() => ({
      getFeedGraphql: vi.fn().mockResolvedValue({ entries: [], pageState: undefined }),
      checkFollowingUsers: vi.fn().mockResolvedValue([]),
      getSuggestions: vi.fn().mockResolvedValue([]),
      followUser: vi.fn().mockResolvedValue({ success: true }),
      unfollowUser: vi.fn().mockResolvedValue({ success: true }),
      likePost: vi.fn().mockResolvedValue({ success: true }),
      unlikePost: vi.fn().mockResolvedValue({ success: true }),
      savePost: vi.fn().mockResolvedValue({ success: true }),
      unsavePost: vi.fn().mockResolvedValue({ success: true }),
      uploadMedia: vi.fn().mockResolvedValue({ url: "https://example.com/media.jpg" }),
      createPost: vi.fn().mockResolvedValue({ postId: "new-post-id" }),
      getPost: vi.fn().mockResolvedValue({
        postId: "new-post-id",
        userId: "user-1",
        username: "testuser",
        avatar: "https://example.com/avatar.jpg",
        createdAt: new Date().toISOString(),
        mediaUrls: [],
        caption: "New post",
        type: "TEXT",
      }),
    })),
  };
});

vi.mock("@/infrastructure/adapters/api/api-client.adapter", () => ({
  getApiClient: vi.fn(() => ({})),
}));

describe("useFeed Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have empty posts array initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.posts).toEqual([]);
    });

    it("should not be loading initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.loading).toBe(false);
    });

    it("should have no error initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.error).toBeNull();
    });

    it("should have hasMore as true initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("loadFeed", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.loadFeed).toBe("function");
    });

    it("should not load when currentUserId is undefined", async () => {
      const { result } = renderHook(() => useFeed(undefined));

      await act(async () => {
        await result.current.loadFeed();
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("createPost", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.createPost).toBe("function");
    });
  });

  describe("suggestions", () => {
    it("should return empty suggestions initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.suggestions).toEqual([]);
    });

    it("should have suggestionsLoading as false initially", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.suggestionsLoading).toBe(false);
    });
  });

  describe("loadSuggestions", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.loadSuggestions).toBe("function");
    });
  });

  describe("followUser", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.followUser).toBe("function");
    });
  });

  describe("followSuggestion", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.followSuggestion).toBe("function");
    });
  });

  describe("unfollowUser", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.unfollowUser).toBe("function");
    });
  });

  describe("toggleLike", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.toggleLike).toBe("function");
    });
  });

  describe("toggleSave", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(typeof result.current.toggleSave).toBe("function");
    });
  });

  describe("initialLoading", () => {
    it("should be false when loading is false", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.initialLoading).toBe(false);
    });
  });

  describe("loadingMore", () => {
    it("should be false when loading is false", () => {
      const { result } = renderHook(() => useFeed(undefined));

      expect(result.current.loadingMore).toBe(false);
    });
  });
});
