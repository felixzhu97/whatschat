import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "@/application/services/notification.service";
import type {
  INotificationRepository,
  NotificationItem,
} from "@/domain/interfaces/repositories/notification.repository.interface";

const mockNotificationItem: NotificationItem = {
  id: "notif-1",
  recipientId: "user-1",
  type: "LIKE",
  actorId: "user-2",
  postId: "post-1",
  commentId: null,
  readAt: null,
  createdAt: new Date(),
};

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let mockRepo: Partial<INotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      findByRecipient: vi.fn(),
      markRead: vi.fn(),
      markReadMany: vi.fn(),
      markAllRead: vi.fn(),
      upsertLike: vi.fn(),
      deleteLike: vi.fn(),
      insertComment: vi.fn(),
      deleteByCommentId: vi.fn(),
    };

    notificationService = new NotificationService(mockRepo as INotificationRepository);
  });

  describe("list", () => {
    it("should return notifications for recipient", async () => {
      const notifications = [mockNotificationItem];
      mockRepo.findByRecipient = vi.fn().mockResolvedValue(notifications);

      const result = await notificationService.list("user-1", 20);

      expect(result).toEqual(notifications);
      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 20, undefined);
    });

    it("should pass cursor to repository", async () => {
      mockRepo.findByRecipient = vi.fn().mockResolvedValue([]);

      await notificationService.list("user-1", 20, "cursor-123");

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 20, "cursor-123");
    });

    it("should clamp limit to valid range", async () => {
      mockRepo.findByRecipient = vi.fn().mockResolvedValue([]);

      await notificationService.list("user-1", 100);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 50, undefined);
    });

    it("should enforce minimum limit of 1", async () => {
      mockRepo.findByRecipient = vi.fn().mockResolvedValue([]);

      await notificationService.list("user-1", -5);

      expect(mockRepo.findByRecipient).toHaveBeenCalledWith("user-1", 1, undefined);
    });
  });

  describe("markRead", () => {
    it("should mark single notification as read", async () => {
      mockRepo.markRead = vi.fn().mockResolvedValue(true);

      const result = await notificationService.markRead("user-1", "notif-1");

      expect(result).toEqual({ success: true });
      expect(mockRepo.markRead).toHaveBeenCalledWith("user-1", "notif-1");
    });

    it("should return success even when notification not found", async () => {
      mockRepo.markRead = vi.fn().mockResolvedValue(false);

      const result = await notificationService.markRead("user-1", "nonexistent");

      expect(result).toEqual({ success: false });
    });
  });

  describe("markReadMany", () => {
    it("should mark multiple notifications as read", async () => {
      mockRepo.markReadMany = vi.fn().mockResolvedValue(3);

      const result = await notificationService.markReadMany("user-1", ["n1", "n2", "n3"]);

      expect(result).toEqual({ success: true, modified: 3 });
      expect(mockRepo.markReadMany).toHaveBeenCalledWith("user-1", ["n1", "n2", "n3"]);
    });
  });

  describe("markAllRead", () => {
    it("should mark all notifications as read", async () => {
      mockRepo.markAllRead = vi.fn().mockResolvedValue(10);

      const result = await notificationService.markAllRead("user-1");

      expect(result).toEqual({ success: true, modified: 10 });
      expect(mockRepo.markAllRead).toHaveBeenCalledWith("user-1");
    });
  });

  describe("upsertLike", () => {
    it("should create like notification", async () => {
      mockRepo.upsertLike = vi.fn().mockResolvedValue(mockNotificationItem);

      const result = await notificationService.upsertLike("user-1", "user-2", "post-1");

      expect(result).toEqual(mockNotificationItem);
      expect(mockRepo.upsertLike).toHaveBeenCalledWith("user-1", "user-2", "post-1");
    });

    it("should return null when upsert fails", async () => {
      mockRepo.upsertLike = vi.fn().mockResolvedValue(null);

      const result = await notificationService.upsertLike("user-1", "user-2", "post-1");

      expect(result).toBeNull();
    });
  });

  describe("deleteLike", () => {
    it("should delete like notification", async () => {
      mockRepo.deleteLike = vi.fn().mockResolvedValue(true);

      const result = await notificationService.deleteLike("user-2", "post-1");

      expect(result).toBe(true);
      expect(mockRepo.deleteLike).toHaveBeenCalledWith("user-2", "post-1");
    });

    it("should return false when delete fails", async () => {
      mockRepo.deleteLike = vi.fn().mockResolvedValue(false);

      const result = await notificationService.deleteLike("user-2", "post-1");

      expect(result).toBe(false);
    });
  });

  describe("insertComment", () => {
    it("should create comment notification", async () => {
      const commentNotification = { ...mockNotificationItem, type: "COMMENT" as const };
      mockRepo.insertComment = vi.fn().mockResolvedValue(commentNotification);

      const result = await notificationService.insertComment(
        "user-1",
        "user-2",
        "post-1",
        "comment-1",
        "Great post!"
      );

      expect(result).toEqual(commentNotification);
    });

    it("should truncate long content", async () => {
      const longContent = "a".repeat(150);
      mockRepo.insertComment = vi.fn().mockImplementation(
        (_recipientId, _actorId, _postId, _commentId, content) => {
          expect(content).toHaveLength(120);
          return Promise.resolve(null);
        }
      );

      await notificationService.insertComment(
        "user-1",
        "user-2",
        "post-1",
        "comment-1",
        longContent
      );
    });

    it("should handle undefined content", async () => {
      mockRepo.insertComment = vi.fn().mockResolvedValue({ ...mockNotificationItem, type: "COMMENT" as const });

      const result = await notificationService.insertComment(
        "user-1",
        "user-2",
        "post-1",
        "comment-1"
      );

      expect(mockRepo.insertComment).toHaveBeenCalledWith(
        "user-1",
        "user-2",
        "post-1",
        "comment-1",
        undefined
      );
    });
  });

  describe("deleteByCommentId", () => {
    it("should delete notification by comment ID", async () => {
      mockRepo.deleteByCommentId = vi.fn().mockResolvedValue(true);

      const result = await notificationService.deleteByCommentId("comment-1");

      expect(result).toBe(true);
      expect(mockRepo.deleteByCommentId).toHaveBeenCalledWith("comment-1");
    });

    it("should return false when notification not found", async () => {
      mockRepo.deleteByCommentId = vi.fn().mockResolvedValue(false);

      const result = await notificationService.deleteByCommentId("nonexistent");

      expect(result).toBe(false);
    });
  });
});
