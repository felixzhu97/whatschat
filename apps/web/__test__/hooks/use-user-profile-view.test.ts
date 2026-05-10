import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUserProfileView } from "@/src/presentation/hooks/use-user-profile-view";

vi.mock("@/src/infrastructure/adapters/api/feed-api.adapter", () => {
  return {
    FeedApiAdapter: vi.fn().mockImplementation(() => ({
      getPostsByUser: vi.fn().mockResolvedValue({ posts: [] }),
    })),
  };
});

vi.mock("@/src/infrastructure/adapters/api/api-client.adapter", () => ({
  getApiClient: vi.fn(() => ({})),
}));

vi.mock("@/src/application/services/users.service", () => ({
  getUsersService: vi.fn(() => ({
    getUserById: vi.fn().mockResolvedValue({
      id: "user-1",
      username: "testuser",
      name: "Test User",
      avatar: "https://example.com/avatar.jpg",
    }),
  })),
}));

describe("useUserProfileView Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have null user initially", () => {
      const { result } = renderHook(() =>
        useUserProfileView(undefined, false)
      );

      expect(result.current.user).toBeNull();
    });

    it("should have empty posts array initially", () => {
      const { result } = renderHook(() =>
        useUserProfileView(undefined, false)
      );

      expect(result.current.posts).toEqual([]);
    });

    it("should not be loading initially when disabled", () => {
      const { result } = renderHook(() =>
        useUserProfileView(undefined, false)
      );

      expect(result.current.loading).toBe(false);
    });

    it("should have no error initially", () => {
      const { result } = renderHook(() =>
        useUserProfileView(undefined, false)
      );

      expect(result.current.error).toBeNull();
    });
  });

  describe("reload", () => {
    it("should be a function", () => {
      const { result } = renderHook(() =>
        useUserProfileView(undefined, false)
      );

      expect(typeof result.current.reload).toBe("function");
    });
  });

  describe("when enabled with userId", () => {
    it("should attempt to load user profile", async () => {
      const { result } = renderHook(() =>
        useUserProfileView("user-1", true)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
