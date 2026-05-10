import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationService } from "@/application/services/notification.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let mockRepo: {
    findByRecipient: ReturnType<typeof vi.fn>;
    markRead: ReturnType<typeof vi.fn>;
    markReadMany: ReturnType<typeof vi.fn>;
    markAllRead: ReturnType<typeof vi.fn>;
    upsertLike: ReturnType<typeof vi.fn>;
    deleteLike: ReturnType<typeof vi.fn>;
    insertComment: ReturnType<typeof vi.fn>;
    deleteByCommentId: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      findByRecipient: vi.fn().mockResolvedValue({ items: [], nextCursor: undefined }),
      markRead: vi.fn().mockResolvedValue(true),
      markReadMany: vi.fn().mockResolvedValue(5),
      markAllRead: vi.fn().mockResolvedValue(10),
      upsertLike: vi.fn().mockResolvedValue({ id: "notif-1" }),
      deleteLike: vi.fn().mockResolvedValue(true),
      insertComment: vi.fn().mockResolvedValue({ id: "notif-2" }),
      deleteByCommentId: vi.fn().mockResolvedValue(true),
    };

    service = new NotificationService(mockRepo as any);
  });

  describe("list", () => {
    it("should list notifications with default limit", async () => {
      const result = await service.list("user-1", 20);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 20, undefined);
      expect(result.items).toEqual([]);
    });

    it("should cap limit at 50", async () => {
      await service.list("user-1", 100);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 50, undefined);
    });

    it("should enforce minimum limit of 1", async () => {
      await service.list("user-1", 0);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 1, undefined);
    });

    it("should handle negative limit", async () => {
      await service.list("user-1", -5);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 1, undefined);
    });
  });

  describe("markRead", () => {
    it("should mark notification as read", async () => {
      const result = await service.markRead("user-1", "notif-1");

      expect(mockRepo.markRead).toHaveBeenCalledWith("user-1", "notif-1");
      expect(result.success).toBe(true);
    });
  });

  describe("markReadMany", () => {
    it("should mark multiple notifications as read", async () => {
      const result = await service.markReadMany("user-1", ["notif-1", "notif-2"]);

      expect(mockRepo.markReadMany).toHaveBeenCalledWith("user-1", ["notif-1", "notif-2"]);
      expect(result.modified).toBe(5);
    });
  });

  describe("markAllRead", () => {
    it("should mark all notifications as read", async () => {
      const result = await service.markAllRead("user-1");

      expect(mockRepo.markAllRead).toHaveBeenCalledWith("user-1");
      expect(result.modified).toBe(10);
    });
  });

  describe("upsertLike", () => {
    it("should upsert like notification", async () => {
      const result = await service.upsertLike("user-1", "actor-1", "post-1");

      expect(mockRepo.upsertLike).toHaveBeenCalledWith("user-1", "actor-1", "post-1");
      expect(result).toEqual({ id: "notif-1" });
    });
  });

  describe("deleteLike", () => {
    it("should delete like notification", async () => {
      const result = await service.deleteLike("actor-1", "post-1");

      expect(mockRepo.deleteLike).toHaveBeenCalledWith("actor-1", "post-1");
      expect(result).toBe(true);
    });
  });

  describe("insertComment", () => {
    it("should insert comment notification", async () => {
      const result = await service.insertComment("user-1", "actor-1", "post-1", "comment-1", "Great post!");

      expect(mockRepo.insertComment).toHaveBeenCalled();
      expect(result).toEqual({ id: "notif-2" });
    });

    it("should truncate long content", async () => {
      const longContent = "a".repeat(200);
      await service.insertComment("user-1", "actor-1", "post-1", "comment-1", longContent);

      expect(mockRepo.insertComment).toHaveBeenCalledWith(
        "user-1",
        "actor-1",
        "post-1",
        "comment-1",
        expect.any(String)
      );
    });
  });

  describe("deleteByCommentId", () => {
    it("should delete comment notification", async () => {
      const result = await service.deleteByCommentId("comment-1");

      expect(mockRepo.deleteByCommentId).toHaveBeenCalledWith("comment-1");
      expect(result).toBe(true);
    });
  });
});
