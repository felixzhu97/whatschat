import { describe, it, expect } from "vitest";
import { Message } from "@/src/domain/entities/message.entity";

describe("Message Entity", () => {
  describe("create", () => {
    it("should create a message with required fields", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello world",
        timestamp: "2024-01-15T10:30:00Z",
      });

      expect(message.id).toBe("msg-1");
      expect(message.senderId).toBe("user-1");
      expect(message.senderName).toBe("John Doe");
      expect(message.content).toBe("Hello world");
      expect(message.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(message.type).toBe("text");
      expect(message.status).toBe("sending");
    });

    it("should create a message with all optional fields", () => {
      const message = Message.create({
        id: "msg-2",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Image message",
        timestamp: "2024-01-15T10:30:00Z",
        type: "image",
        status: "delivered",
        replyTo: "msg-0",
        isEdited: true,
        editedAt: "2024-01-15T11:00:00Z",
        isStarred: true,
        isForwarded: true,
        mediaUrl: "https://example.com/image.jpg",
        fileName: "image.jpg",
        fileSize: "1.2MB",
        duration: 30,
      });

      expect(message.type).toBe("image");
      expect(message.status).toBe("delivered");
      expect(message.replyTo).toBe("msg-0");
      expect(message.isEdited).toBe(true);
      expect(message.editedAt).toBe("2024-01-15T11:00:00Z");
      expect(message.isStarred).toBe(true);
      expect(message.isForwarded).toBe(true);
      expect(message.mediaUrl).toBe("https://example.com/image.jpg");
      expect(message.fileName).toBe("image.jpg");
      expect(message.fileSize).toBe("1.2MB");
      expect(message.duration).toBe(30);
    });

    it("should create message with attachments", () => {
      const attachments = [
        {
          id: "att-1",
          type: "image" as const,
          url: "https://example.com/image.jpg",
          name: "image.jpg",
          size: 1024,
          mimeType: "image/jpeg",
        },
      ];

      const message = Message.create({
        id: "msg-3",
        senderId: "user-1",
        senderName: "John Doe",
        content: "With attachments",
        timestamp: "2024-01-15T10:30:00Z",
        attachments,
      });

      expect(message.attachments).toEqual(attachments);
      expect(message.attachments).toHaveLength(1);
    });

    it("should create message with location", () => {
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA",
      };

      const message = Message.create({
        id: "msg-4",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Location",
        timestamp: "2024-01-15T10:30:00Z",
        location,
      });

      expect(message.location).toEqual(location);
    });

    it("should default to text type", () => {
      const message = Message.create({
        id: "msg-5",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Test",
        timestamp: "2024-01-15T10:30:00Z",
      });

      expect(message.type).toBe("text");
    });

    it("should default to sending status", () => {
      const message = Message.create({
        id: "msg-6",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Test",
        timestamp: "2024-01-15T10:30:00Z",
      });

      expect(message.status).toBe("sending");
    });

    it("should handle all message types", () => {
      const types = ["text", "image", "video", "audio", "file", "location", "contact", "voice"] as const;

      types.forEach((type) => {
        const message = Message.create({
          id: `msg-${type}`,
          senderId: "user-1",
          senderName: "John Doe",
          content: "Test",
          timestamp: "2024-01-15T10:30:00Z",
          type,
        });

        expect(message.type).toBe(type);
      });
    });

    it("should handle all message statuses", () => {
      const statuses = ["sending", "sent", "delivered", "read", "failed"] as const;

      statuses.forEach((status) => {
        const message = Message.create({
          id: `msg-${status}`,
          senderId: "user-1",
          senderName: "John Doe",
          content: "Test",
          timestamp: "2024-01-15T10:30:00Z",
          status,
        });

        expect(message.status).toBe(status);
      });
    });
  });

  describe("updateStatus", () => {
    it("should update message status", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        status: "sending",
      });

      const updatedMessage = message.updateStatus("sent");

      expect(updatedMessage.status).toBe("sent");
      expect(updatedMessage.id).toBe(message.id);
      expect(updatedMessage.content).toBe(message.content);
    });

    it("should return new instance", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
      });

      const updatedMessage = message.updateStatus("delivered");

      expect(updatedMessage).not.toBe(message);
    });

    it("should preserve all other fields", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        type: "image",
        mediaUrl: "https://example.com/image.jpg",
        isStarred: true,
      });

      const updatedMessage = message.updateStatus("delivered");

      expect(updatedMessage.id).toBe(message.id);
      expect(updatedMessage.content).toBe(message.content);
      expect(updatedMessage.type).toBe(message.type);
      expect(updatedMessage.mediaUrl).toBe(message.mediaUrl);
      expect(updatedMessage.isStarred).toBe(message.isStarred);
    });
  });

  describe("edit", () => {
    it("should update content and mark as edited", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Original content",
        timestamp: "2024-01-15T10:30:00Z",
      });

      const editedMessage = message.edit("Updated content");

      expect(editedMessage.content).toBe("Updated content");
      expect(editedMessage.isEdited).toBe(true);
      expect(editedMessage.editedAt).toBeDefined();
    });

    it("should return new instance", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
      });

      const editedMessage = message.edit("Updated");

      expect(editedMessage).not.toBe(message);
    });

    it("should preserve other message properties", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        isStarred: true,
        isForwarded: true,
        mediaUrl: "https://example.com/image.jpg",
      });

      const editedMessage = message.edit("Updated");

      expect(editedMessage.id).toBe(message.id);
      expect(editedMessage.senderId).toBe(message.senderId);
      expect(editedMessage.timestamp).toBe(message.timestamp);
      expect(editedMessage.isStarred).toBe(message.isStarred);
      expect(editedMessage.isForwarded).toBe(message.isForwarded);
      expect(editedMessage.mediaUrl).toBe(message.mediaUrl);
    });
  });

  describe("toggleStar", () => {
    it("should toggle isStarred from false to true", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        isStarred: false,
      });

      const starredMessage = message.toggleStar();

      expect(starredMessage.isStarred).toBe(true);
    });

    it("should toggle isStarred from true to false", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        isStarred: true,
      });

      const unstarredMessage = message.toggleStar();

      expect(unstarredMessage.isStarred).toBe(false);
    });

    it("should return new instance", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
      });

      const toggledMessage = message.toggleStar();

      expect(toggledMessage).not.toBe(message);
    });

    it("should preserve other message properties", () => {
      const message = Message.create({
        id: "msg-1",
        senderId: "user-1",
        senderName: "John Doe",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        type: "image",
        mediaUrl: "https://example.com/image.jpg",
        isEdited: true,
        isForwarded: true,
      });

      const starredMessage = message.toggleStar();

      expect(starredMessage.id).toBe(message.id);
      expect(starredMessage.content).toBe(message.content);
      expect(starredMessage.type).toBe(message.type);
      expect(starredMessage.mediaUrl).toBe(message.mediaUrl);
      expect(starredMessage.isEdited).toBe(message.isEdited);
      expect(starredMessage.isForwarded).toBe(message.isForwarded);
    });
  });
});
