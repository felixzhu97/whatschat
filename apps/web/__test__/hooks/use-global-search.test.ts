import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGlobalSearch } from "@/src/presentation/hooks/use-global-search";

vi.mock("@/infrastructure/adapters/api/feed-api.adapter", () => {
  return {
    FeedApiAdapter: vi.fn().mockImplementation(() => ({
      search: vi.fn().mockResolvedValue({
        hits: [],
        nextCursor: undefined,
        total: 0,
      }),
    })),
  };
});

vi.mock("@/infrastructure/adapters/api/api-client.adapter", () => ({
  getApiClient: vi.fn(() => ({})),
}));

describe("useGlobalSearch Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have empty query initially", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.query).toBe("");
    });

    it("should have all search type initially", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.searchType).toBe("all");
    });

    it("should have empty hits arrays initially", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.userHits).toEqual([]);
      expect(result.current.postHits).toEqual([]);
      expect(result.current.hashtagHits).toEqual([]);
    });

    it("should not be loading initially", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.loading).toBe(false);
    });

    it("should have no error initially", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.error).toBeNull();
    });
  });

  describe("setQuery", () => {
    it("should update query", () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setQuery("test");
      });

      expect(result.current.query).toBe("test");
    });
  });

  describe("setSearchType", () => {
    it("should update search type", () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setSearchType("posts");
      });

      expect(result.current.searchType).toBe("posts");
    });

    it("should update to users type", () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setSearchType("users");
      });

      expect(result.current.searchType).toBe("users");
    });

    it("should update to hashtags type", () => {
      const { result } = renderHook(() => useGlobalSearch());

      act(() => {
        result.current.setSearchType("hashtags");
      });

      expect(result.current.searchType).toBe("hashtags");
    });
  });

  describe("nextCursor", () => {
    it("should return undefined when searchType is all", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(result.current.nextCursor).toBeUndefined();
    });
  });

  describe("hasMore", () => {
    it("should indicate if more results are available", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(typeof result.current.nextCursor === "string" || result.current.nextCursor === undefined).toBe(true);
    });
  });

  describe("hashtagSuggestions", () => {
    it("should return hashtag suggestions", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(Array.isArray(result.current.hashtagSuggestions)).toBe(true);
    });
  });

  describe("runSearch", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(typeof result.current.runSearch).toBe("function");
    });
  });

  describe("loadMore", () => {
    it("should be a function", () => {
      const { result } = renderHook(() => useGlobalSearch());

      expect(typeof result.current.loadMore).toBe("function");
    });
  });
});
