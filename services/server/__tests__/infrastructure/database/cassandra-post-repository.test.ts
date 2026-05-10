import { describe, it, expect, beforeEach, vi } from "vitest";
import { CassandraPostRepository, CreatePostInput } from "../../../src/infrastructure/database/cassandra-post.repository";
import { CassandraService } from "../../../src/infrastructure/database/cassandra.service";

describe("CassandraPostRepository", () => {
  let repository: CassandraPostRepository;
  let mockCassandraService: Partial<CassandraService>;
  let mockClient: any;

  const createMockPostInput = (overrides: Partial<CreatePostInput> = {}): CreatePostInput => ({
    postId: "post-123",
    userId: "user-456",
    caption: "Test caption",
    type: "image",
    mediaUrls: ["https://example.com/image.jpg"],
    location: "New York",
    coverUrl: "https://example.com/cover.jpg",
    ...overrides,
  });

  beforeEach(() => {
    mockClient = {
      execute: vi.fn(),
    };
    mockCassandraService = {
      getClient: vi.fn(() => mockClient),
    };
    repository = new CassandraPostRepository(mockCassandraService as CassandraService);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with CassandraService", () => {
      expect(repository).toBeDefined();
    });
  });

  describe("insertPost", () => {
    it("should insert post into posts table", async () => {
      const input = createMockPostInput();
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      expect(mockClient.execute).toHaveBeenCalledTimes(2);
      const postsCall = mockClient.execute.mock.calls[0];
      expect(postsCall[0]).toContain("INSERT INTO posts");
    });

    it("should insert post into post_by_id table", async () => {
      const input = createMockPostInput();
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      const postByIdCall = mockClient.execute.mock.calls[1];
      expect(postByIdCall[0]).toContain("INSERT INTO post_by_id");
    });

    it("should pass correct parameters to posts insert", async () => {
      const input = createMockPostInput();
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      const postsCall = mockClient.execute.mock.calls[0];
      const params = postsCall[1];
      expect(params[0]).toBe(input.userId);
      expect(params[2]).toBe(input.postId);
      expect(params[3]).toBe(input.caption);
    });

    it("should use prepare option for query execution", async () => {
      const input = createMockPostInput();
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      const postsCall = mockClient.execute.mock.calls[0];
      expect(postsCall[2]).toEqual({ prepare: true });
    });

    it("should handle null coverUrl", async () => {
      const input = createMockPostInput({ coverUrl: undefined });
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      const postsCall = mockClient.execute.mock.calls[0];
      expect(postsCall[1][7]).toBeNull();
    });

    it("should handle null location", async () => {
      const input = createMockPostInput({ location: undefined });
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.insertPost(input);

      const postsCall = mockClient.execute.mock.calls[0];
      expect(postsCall[1][6]).toBeNull();
    });

    it("should return early when client is null", async () => {
      mockCassandraService.getClient = vi.fn(() => null);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      const input = createMockPostInput();

      await repo.insertPost(input);

      expect(mockClient.execute).not.toHaveBeenCalled();
    });

    it("should throw error when execute fails", async () => {
      const input = createMockPostInput();
      mockClient.execute.mockRejectedValue(new Error("Cassandra error"));

      await expect(repository.insertPost(input)).rejects.toThrow("Cassandra error");
    });
  });

  describe("getPostById", () => {
    it("should query post_by_id table", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getPostById("post-123");

      const call = mockClient.execute.mock.calls[0];
      expect(call[0]).toContain("SELECT");
      expect(call[0]).toContain("post_by_id");
    });

    it("should pass postId as parameter", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getPostById("post-abc");

      const call = mockClient.execute.mock.calls[0];
      expect(call[1]).toEqual(["post-abc"]);
    });

    it("should return null when no rows returned", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      const result = await repository.getPostById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when rows is undefined", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      const result = await repository.getPostById("post-123");

      expect(result).toBeNull();
    });

    it("should map row to PostRow correctly", async () => {
      const mockRow = {
        post_id: "post-123",
        user_id: "user-456",
        created_at: new Date("2024-01-15"),
        caption: "Test caption",
        type: "video",
        media_urls: ["https://example.com/video.mp4"],
        location: "Los Angeles",
        cover_url: "https://example.com/thumb.jpg",
      };
      mockClient.execute.mockResolvedValue({ rows: [mockRow] });

      const result = await repository.getPostById("post-123");

      expect(result).toEqual({
        post_id: "post-123",
        user_id: "user-456",
        created_at: new Date("2024-01-15"),
        caption: "Test caption",
        type: "video",
        media_urls: ["https://example.com/video.mp4"],
        location: "Los Angeles",
        cover_url: "https://example.com/thumb.jpg",
      });
    });

    it("should handle null caption", async () => {
      const mockRow = {
        post_id: "post-123",
        user_id: "user-456",
        created_at: new Date(),
        caption: null,
        type: "image",
        media_urls: ["url"],
        location: null,
        cover_url: null,
      };
      mockClient.execute.mockResolvedValue({ rows: [mockRow] });

      const result = await repository.getPostById("post-123");

      expect(result?.caption).toBeNull();
    });

    it("should handle null media_urls", async () => {
      const mockRow = {
        post_id: "post-123",
        user_id: "user-456",
        created_at: new Date(),
        caption: "Test",
        type: "image",
        media_urls: null,
        location: null,
        cover_url: null,
      };
      mockClient.execute.mockResolvedValue({ rows: [mockRow] });

      const result = await repository.getPostById("post-123");

      expect(result?.media_urls).toEqual([]);
    });

    it("should handle null cover_url", async () => {
      const mockRow = {
        post_id: "post-123",
        user_id: "user-456",
        created_at: new Date(),
        caption: "Test",
        type: "image",
        media_urls: ["url"],
        location: null,
        cover_url: null,
      };
      mockClient.execute.mockResolvedValue({ rows: [mockRow] });

      const result = await repository.getPostById("post-123");

      expect(result?.cover_url).toBeNull();
    });

    it("should return null when client is null", async () => {
      mockCassandraService.getClient = vi.fn(() => null);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);

      const result = await repo.getPostById("post-123");

      expect(result).toBeNull();
    });

    it("should throw error when execute fails", async () => {
      mockClient.execute.mockRejectedValue(new Error("Query failed"));

      await expect(repository.getPostById("post-123")).rejects.toThrow("Query failed");
    });
  });

  describe("getPostsByUserId", () => {
    it("should query posts table", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getPostsByUserId("user-456", 10);

      const call = mockClient.execute.mock.calls[0];
      expect(call[0]).toContain("SELECT");
      expect(call[0]).toContain("FROM posts");
    });

    it("should pass userId as parameter", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getPostsByUserId("user-abc", 20);

      const call = mockClient.execute.mock.calls[0];
      expect(call[1]).toContain("user-abc");
    });

    it("should pass limit as fetchSize", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      await repository.getPostsByUserId("user-456", 25);

      const call = mockClient.execute.mock.calls[0];
      expect(call[2].fetchSize).toBe(25);
    });

    it("should pass pageState when provided", async () => {
      mockClient.execute.mockResolvedValue({ rows: [], pageState: "cursor-abc" });

      await repository.getPostsByUserId("user-456", 10, "cursor-xyz");

      const call = mockClient.execute.mock.calls[0];
      expect(call[2].pageState).toBe("cursor-xyz");
    });

    it("should return empty rows when no results", async () => {
      mockClient.execute.mockResolvedValue({ rows: [] });

      const result = await repository.getPostsByUserId("user-456", 10);

      expect(result.rows).toEqual([]);
    });

    it("should map rows to PostRow array", async () => {
      const mockRows = [
        {
          user_id: "user-456",
          created_at: new Date("2024-01-15"),
          post_id: "post-1",
          caption: "First post",
          type: "image",
          media_urls: ["url1"],
          location: "NYC",
          cover_url: null,
        },
        {
          user_id: "user-456",
          created_at: new Date("2024-01-16"),
          post_id: "post-2",
          caption: "Second post",
          type: "video",
          media_urls: ["url2"],
          location: null,
          cover_url: "cover2",
        },
      ];
      mockClient.execute.mockResolvedValue({ rows: mockRows });

      const result = await repository.getPostsByUserId("user-456", 10);

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].post_id).toBe("post-1");
      expect(result.rows[1].post_id).toBe("post-2");
    });

    it("should include pageState in result when returned by query", async () => {
      mockClient.execute.mockResolvedValue({ rows: [], pageState: "next-cursor" });

      const result = await repository.getPostsByUserId("user-456", 10);

      expect(result.pageState).toBe("next-cursor");
    });

    it("should return empty rows when client is null", async () => {
      mockCassandraService.getClient = vi.fn(() => null);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);

      const result = await repo.getPostsByUserId("user-456", 10);

      expect(result.rows).toEqual([]);
    });

    it("should throw error when execute fails", async () => {
      mockClient.execute.mockRejectedValue(new Error("Query failed"));

      await expect(repository.getPostsByUserId("user-456", 10)).rejects.toThrow("Query failed");
    });
  });

  describe("deletePost", () => {
    it("should return early when client is null", async () => {
      mockCassandraService.getClient = vi.fn(() => null);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);

      await repo.deletePost("post-123", "user-456");

      expect(mockClient.execute).not.toHaveBeenCalled();
    });

    it("should return early when post does not exist", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      mockClient.execute.mockResolvedValueOnce({ rows: [] });

      await repo.deletePost("post-123", "user-456");

      expect(mockClient.execute).toHaveBeenCalledTimes(1);
    });

    it("should return early when user does not own post", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      mockClient.execute.mockResolvedValueOnce({
        rows: [{ post_id: "post-123", user_id: "different-user" }],
      });

      await repo.deletePost("post-123", "user-456");

      expect(mockClient.execute).toHaveBeenCalledTimes(1);
    });

    it("should delete from posts table when user owns post", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      mockClient.execute
        .mockResolvedValueOnce({
          rows: [{
            post_id: "post-123",
            user_id: "user-456",
            created_at: new Date("2024-01-15"),
            caption: null,
            type: "image",
            media_urls: [],
            location: null,
            cover_url: null,
          }],
        })
        .mockResolvedValue({ rows: [] });

      await repo.deletePost("post-123", "user-456");

      const deleteCall = mockClient.execute.mock.calls[1];
      expect(deleteCall[0]).toContain("DELETE FROM posts");
    });

    it("should delete from post_by_id table when user owns post", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      mockClient.execute
        .mockResolvedValueOnce({
          rows: [{
            post_id: "post-123",
            user_id: "user-456",
            created_at: new Date("2024-01-15"),
            caption: null,
            type: "image",
            media_urls: [],
            location: null,
            cover_url: null,
          }],
        })
        .mockResolvedValue({ rows: [] });

      await repo.deletePost("post-123", "user-456");

      const deleteCall = mockClient.execute.mock.calls[2];
      expect(deleteCall[0]).toContain("DELETE FROM post_by_id");
    });

    it("should pass correct parameters to delete queries", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      const createdAt = new Date("2024-01-15");
      mockClient.execute
        .mockResolvedValueOnce({
          rows: [{
            post_id: "post-123",
            user_id: "user-456",
            created_at: createdAt,
            caption: null,
            type: "image",
            media_urls: [],
            location: null,
            cover_url: null,
          }],
        })
        .mockResolvedValue({ rows: [] });

      await repo.deletePost("post-123", "user-456");

      const postsDeleteCall = mockClient.execute.mock.calls[1];
      expect(postsDeleteCall[1]).toContain("user-456");
      expect(postsDeleteCall[1]).toContain(createdAt);
      expect(postsDeleteCall[1]).toContain("post-123");

      const postByIdDeleteCall = mockClient.execute.mock.calls[2];
      expect(postByIdDeleteCall[1]).toEqual(["post-123"]);
    });

    it("should throw error when getPostById fails", async () => {
      mockCassandraService.getClient = vi.fn(() => mockClient);
      const repo = new CassandraPostRepository(mockCassandraService as CassandraService);
      mockClient.execute.mockRejectedValue(new Error("Query failed"));

      await expect(repo.deletePost("post-123", "user-456")).rejects.toThrow("Query failed");
    });
  });
});
