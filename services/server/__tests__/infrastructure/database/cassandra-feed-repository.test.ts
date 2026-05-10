import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraFeedRepository, FeedEntry } from "../../../src/infrastructure/database/cassandra-feed.repository";
import { CassandraService } from "../../../src/infrastructure/database/cassandra.service";

describe("CassandraFeedRepository", () => {
  let repository: CassandraFeedRepository;
  let mockCassandraService: Partial<CassandraService>;
  let mockClient: any;

  const createMockFeedEntry = (overrides: Partial<FeedEntry> = {}): FeedEntry => ({
    user_id: "user-123",
    created_at: new Date("2024-01-15T10:30:00Z"),
    post_id: "post-456",
    author_id: "author-789",
    ...overrides,
  });

  beforeEach(() => {
    mockClient = {
      execute: vi.fn(),
    };
    mockCassandraService = {
      getClient: vi.fn(() => mockClient),
    };
    repository = new CassandraFeedRepository(mockCassandraService as CassandraService);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with CassandraService", () => {
      expect(repository).toBeDefined();
    });
  });

  describe("insertFeedEntry", () => {
    it("should insert feed entry into feed_by_user table", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });
      const createdAt = new Date();

      await repository.insertFeedEntry("follower-123", "author-456", "post-789", createdAt);

      expect(mockClient.execute).toHaveBeenCalledTimes(1);
      const call = mockClient.execute.mock.calls[0];
      expect(call[0]).toContain("INSERT INTO feed_by_user");
      expect(call[0]).toContain("user_id");
      expect(call[0]).toContain("created_at");
      expect(call[0]).toContain("post_id");
      expect(call[0]).toContain("author_id");
    });

    it("should pass correct parameters to insert query", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });
      const createdAt = new Date("2024-06-20T15:00:00Z");

      await repository.insertFeedEntry("follower-123", "author-456", "post-789", createdAt);

      const call = mockClient.execute.mock.calls[0];
      const params = call[1];
      expect(params[0]).toBe("follower-123");
      expect(params[1]).toBe(createdAt);
      expect(params[2]).toBe("post-789");
      expect(params[3]).toBe("author-456");
    });

    it("should use prepare option for query execution", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertFeedEntry("follower", "author", "post", new Date());

      const call = mockClient.execute.mock.calls[0];
      expect(call[2]).toEqual({ prepare: true });
    });

    it("should return early when client is null", async () => {
      mockCassandraService.getClient = vi.fn(() => null);
      const repo = new CassandraFeedRepository(mockCassandraService as CassandraService);

      await repo.insertFeedEntry("follower", "author", "post", new Date());

      expect(mockClient.execute).not.toHaveBeenCalled();
    });

    it("should throw error when execute fails", async () => {
      mockClient.execute.mockRejectedValue(new Error("Cassandra error"));

      await expect(
        repository.insertFeedEntry("follower", "author", "post", new Date())
      ).rejects.toThrow("Cassandra error");
    });
  });

  describe("getFeedPage", () => {
    it("should query feed_by_user table", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getFeedPage("user-123", 10);

      const call = mockClient.execute.mock.calls[0];
      expect(call[0]).toContain("SELECT");
      expect(call[0]).toContain("feed_by_user");
      expect(call[0]).toContain("user_id");
      expect(call[0]).toContain("created_at");
      expect(call[0]).toContain("post_id");
      expect(call[0]).toContain("author_id");
    });

    it("should pass userId as parameter", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getFeedPage("user-abc", 10);

      const call = mockClient.execute.mock.calls[0];
      expect(call[1]).toEqual(["user-abc"]);
    });

    it("should pass limit as fetchSize", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getFeedPage("user-123", 25);

      const call = mockClient.execute.mock.calls[0];
      expect(call[2].fetchSize).toBe(25);
    });

    it("should pass pageState when provided", async () => {
      mockClient.execute.mockResolvedValue({ rows: [], pageState: "cursor-abc" });

      await repository.getFeedPage("user-123", 10, "cursor-xyz");

      const call = mockClient.execute.mock.calls[0];
      expect(call[2].pageState).toBe("cursor-xyz");
    });

    it("should not include pageState in options when not provided", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getFeedPage("user-123", 10);

      const call = mockClient.execute.mock.calls[0];
      expect(call[2].pageState).toBeUndefined();
    });

    describe("result mapping", () => {
      it("should return empty entries when no results", async () => {
        mockClient.execute.mockResolvedValue({ rows: [] });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.entries).toEqual([]);
      });

      it("should return empty entries when rows is undefined", async () => {
        mockClient.execute.mockResolvedValue({ rows: undefined });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.entries).toEqual([]);
      });

      it("should map single row to FeedEntry", async () => {
        const mockRow: Record<string, unknown> = {
          user_id: "user-123",
          created_at: new Date("2024-01-15"),
          post_id: "post-456",
          author_id: "author-789",
        };
        mockClient.execute.mockResolvedValue({ rows: [mockRow] });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0]).toEqual({
          user_id: "user-123",
          created_at: new Date("2024-01-15"),
          post_id: "post-456",
          author_id: "author-789",
        });
      });

      it("should map multiple rows to FeedEntry array", async () => {
        const mockRows: Record<string, unknown>[] = [
          {
            user_id: "user-123",
            created_at: new Date("2024-01-15"),
            post_id: "post-1",
            author_id: "author-1",
          },
          {
            user_id: "user-123",
            created_at: new Date("2024-01-16"),
            post_id: "post-2",
            author_id: "author-2",
          },
          {
            user_id: "user-123",
            created_at: new Date("2024-01-17"),
            post_id: "post-3",
            author_id: "author-3",
          },
        ];
        mockClient.execute.mockResolvedValue({ rows: mockRows });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.entries).toHaveLength(3);
        expect(result.entries[0].post_id).toBe("post-1");
        expect(result.entries[1].post_id).toBe("post-2");
        expect(result.entries[2].post_id).toBe("post-3");
      });

      it("should preserve Date objects in mapping", async () => {
        const createdAt = new Date("2024-06-20T15:00:00Z");
        const mockRow: Record<string, unknown> = {
          user_id: "user-123",
          created_at: createdAt,
          post_id: "post-456",
          author_id: "author-789",
        };
        mockClient.execute.mockResolvedValue({ rows: [mockRow] });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.entries[0].created_at).toBe(createdAt);
        expect(result.entries[0].created_at).toBeInstanceOf(Date);
      });
    });

    describe("pageState handling", () => {
      it("should include pageState in result when returned by query", async () => {
        mockClient.execute.mockResolvedValue({ rows: [], pageState: "next-cursor-123" });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.pageState).toBe("next-cursor-123");
      });

      it("should not include pageState when null", async () => {
        mockClient.execute.mockResolvedValue({ rows: [], pageState: null });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.pageState).toBeUndefined();
      });

      it("should not include pageState when undefined", async () => {
        mockClient.execute.mockResolvedValue({ rows: [], pageState: undefined });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result.pageState).toBeUndefined();
      });

      it("should return correct structure with pageState", async () => {
        const mockRows: Record<string, unknown>[] = [
          {
            user_id: "user-123",
            created_at: new Date(),
            post_id: "post-1",
            author_id: "author-1",
          },
        ];
        mockClient.execute.mockResolvedValue({ rows: mockRows, pageState: "cursor-xyz" });

        const result = await repository.getFeedPage("user-123", 10);

        expect(result).toHaveProperty("entries");
        expect(result).toHaveProperty("pageState");
        expect(result.entries).toHaveLength(1);
        expect(result.pageState).toBe("cursor-xyz");
      });
    });

    describe("edge cases", () => {
      it("should handle empty user id", async () => {
        mockClient.execute.mockResolvedValue({ rows: [] });

        await repository.getFeedPage("", 10);

        const call = mockClient.execute.mock.calls[0];
        expect(call[1]).toEqual([""]);
      });

      it("should handle limit of 1", async () => {
        mockClient.execute.mockResolvedValue({ rows: [] });

        await repository.getFeedPage("user-123", 1);

        const call = mockClient.execute.mock.calls[0];
        expect(call[2].fetchSize).toBe(1);
      });

      it("should handle large limit values", async () => {
        mockClient.execute.mockResolvedValue({ rows: [] });

        await repository.getFeedPage("user-123", 1000);

        const call = mockClient.execute.mock.calls[0];
        expect(call[2].fetchSize).toBe(1000);
      });
    });

    describe("client null handling", () => {
      it("should return empty entries when client is null", async () => {
        mockCassandraService.getClient = vi.fn(() => null);
        const repo = new CassandraFeedRepository(mockCassandraService as CassandraService);

        const result = await repo.getFeedPage("user-123", 10);

        expect(result.entries).toEqual([]);
      });
    });

    describe("error handling", () => {
      it("should throw error when execute fails", async () => {
        mockClient.execute.mockRejectedValue(new Error("Query failed"));

        await expect(repository.getFeedPage("user-123", 10)).rejects.toThrow("Query failed");
      });
    });
  });
});
