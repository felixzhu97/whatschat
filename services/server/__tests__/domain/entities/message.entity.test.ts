import { describe, it, expect } from "vitest";
import { Message, MessageType } from "@/domain/entities/message.entity";
import type { MessageReaction, ContactInfo } from "@whatschat/shared-types";

describe("Message Entity", () => {
  const createTestMessage = (overrides?: Partial<ConstructorParameters<typeof Message>[0]>) => {
    return Message.create({
      id: "msg-1",
      chatId: "chat-1",
      senderId: "sender-1",
      type: "TEXT",
      content: "Hello, World!",
      ...overrides,
    });
  };

  describe("constructor", () => {
    it("should create a message with all required fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-01");
      const reactions: MessageReaction[] = [
        { userId: "user-1", emoji: "👍", createdAt: new Date() },
      ];
      const message = new Message(
        "msg-1",
        "chat-1",
        "sender-1",
        "TEXT",
        "Hello!",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        false,
        false,
        undefined,
        undefined,
        reactions,
        ["user-2"],
        createdAt,
        updatedAt
      );

      expect(message.id).toBe("msg-1");
      expect(message.chatId).toBe("chat-1");
      expect(message.senderId).toBe("sender-1");
      expect(message.type).toBe("TEXT");
      expect(message.content).toBe("Hello!");
      expect(message.reactions).toHaveLength(1);
      expect(message.readBy).toContain("user-2");
    });

    it("should use default values for optional fields", () => {
      const message = new Message(
        "msg-1",
        "chat-1",
        "sender-1",
        "TEXT",
        "Hello!"
      );

      expect(message.mediaUrl).toBeUndefined();
      expect(message.thumbnailUrl).toBeUndefined();
      expect(message.isEdited).toBe(false);
      expect(message.isDeleted).toBe(false);
      expect(message.isForwarded).toBe(false);
      expect(message.reactions).toEqual([]);
      expect(message.readBy).toEqual([]);
      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Message.create", () => {
    it("should create a text message", () => {
      const message = createTestMessage({ type: "TEXT", content: "Hello!" });

      expect(message.type).toBe("TEXT");
      expect(message.content).toBe("Hello!");
    });

    it("should create an image message with media", () => {
      const message = createTestMessage({
        type: "IMAGE",
        content: "Check this out!",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
        size: 1024000,
      });

      expect(message.type).toBe("IMAGE");
      expect(message.mediaUrl).toBe("https://example.com/image.jpg");
      expect(message.thumbnailUrl).toBe("https://example.com/thumb.jpg");
      expect(message.size).toBe(1024000);
    });

    it("should create a video message with duration", () => {
      const message = createTestMessage({
        type: "VIDEO",
        content: "Watch this video!",
        mediaUrl: "https://example.com/video.mp4",
        duration: 120,
        size: 10240000,
      });

      expect(message.type).toBe("VIDEO");
      expect(message.mediaUrl).toBe("https://example.com/video.mp4");
      expect(message.duration).toBe(120);
      expect(message.size).toBe(10240000);
    });

    it("should create a location message with coordinates", () => {
      const message = createTestMessage({
        type: "LOCATION",
        content: "I'm here!",
        latitude: 37.7749,
        longitude: -122.4194,
      });

      expect(message.type).toBe("LOCATION");
      expect(message.latitude).toBe(37.7749);
      expect(message.longitude).toBe(-122.4194);
    });

    it("should create a contact message", () => {
      const contactInfo: ContactInfo = {
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
      };
      const message = createTestMessage({
        type: "CONTACT",
        content: "Sharing contact",
        contactInfo,
      });

      expect(message.type).toBe("CONTACT");
      expect(message.contactInfo?.name).toBe("John Doe");
      expect(message.contactInfo?.phone).toBe("+1234567890");
    });

    it("should create a forwarded message", () => {
      const message = createTestMessage({
        isForwarded: true,
        originalMessageId: "original-msg-1",
      });

      expect(message.isForwarded).toBe(true);
      expect(message.originalMessageId).toBe("original-msg-1");
    });

    it("should create a reply message", () => {
      const message = createTestMessage({
        replyToMessageId: "reply-to-msg",
        content: "Replying to your message",
      });

      expect(message.replyToMessageId).toBe("reply-to-msg");
    });

    it("should create a message with reactions", () => {
      const reactions: MessageReaction[] = [
        { userId: "user-1", emoji: "👍", createdAt: new Date() },
        { userId: "user-2", emoji: "❤️", createdAt: new Date() },
      ];
      const message = createTestMessage({ reactions });

      expect(message.reactions).toHaveLength(2);
      expect(message.reactions[0].emoji).toBe("👍");
      expect(message.reactions[1].emoji).toBe("❤️");
    });

    it("should create a message with readBy list", () => {
      const message = createTestMessage({ readBy: ["user-1", "user-2", "user-3"] });

      expect(message.readBy).toHaveLength(3);
      expect(message.readBy).toContain("user-1");
      expect(message.readBy).toContain("user-2");
      expect(message.readBy).toContain("user-3");
    });

    it("should set custom dates when provided", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const message = createTestMessage({ createdAt, updatedAt });

      expect(message.createdAt).toBe(createdAt);
      expect(message.updatedAt).toBe(updatedAt);
    });
  });

  describe("edit", () => {
    it("should return a new message with edited content", () => {
      const message = createTestMessage({ content: "Original content" });

      const editedMessage = message.edit("Edited content");

      expect(editedMessage.id).toBe(message.id);
      expect(editedMessage.content).toBe("Edited content");
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should preserve other message properties", () => {
      const message = createTestMessage({
        type: "IMAGE",
        mediaUrl: "https://example.com/image.jpg",
        reactions: [{ userId: "user-1", emoji: "👍" }],
      });

      const editedMessage = message.edit("New caption");

      expect(editedMessage.type).toBe("IMAGE");
      expect(editedMessage.mediaUrl).toBe("https://example.com/image.jpg");
      expect(editedMessage.reactions).toHaveLength(1);
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should preserve original message unchanged", () => {
      const message = createTestMessage({ content: "Original" });

      const editedMessage = message.edit("Edited");

      expect(message.content).toBe("Original");
      expect(message.isEdited).toBe(false);
      expect(editedMessage.content).toBe("Edited");
      expect(editedMessage.isEdited).toBe(true);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createTestMessage({ updatedAt: originalDate });

      const beforeEdit = new Date();
      const editedMessage = message.edit("Edited");

      expect(editedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeEdit.getTime() - 1000);
    });
  });

  describe("delete", () => {
    it("should return a new deleted message", () => {
      const message = createTestMessage({ content: "Message to delete" });

      const deletedMessage = message.delete();

      expect(deletedMessage.id).toBe(message.id);
      expect(deletedMessage.isDeleted).toBe(true);
    });

    it("should preserve original message unchanged", () => {
      const message = createTestMessage({ content: "Original" });

      const deletedMessage = message.delete();

      expect(message.isDeleted).toBe(false);
      expect(deletedMessage.isDeleted).toBe(true);
    });

    it("should preserve content and other properties", () => {
      const message = createTestMessage({
        type: "IMAGE",
        mediaUrl: "https://example.com/image.jpg",
        reactions: [{ userId: "user-1", emoji: "👍" }],
      });

      const deletedMessage = message.delete();

      expect(deletedMessage.content).toBe("Hello, World!");
      expect(deletedMessage.mediaUrl).toBe("https://example.com/image.jpg");
      expect(deletedMessage.reactions).toHaveLength(1);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createTestMessage({ updatedAt: originalDate });

      const beforeDelete = new Date();
      const deletedMessage = message.delete();

      expect(deletedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime() - 1000);
    });
  });

  describe("addReaction", () => {
    it("should add a new reaction to the message", () => {
      const message = createTestMessage();

      const reactedMessage = message.addReaction("user-1", "👍");

      expect(reactedMessage.reactions).toHaveLength(1);
      expect(reactedMessage.reactions[0].userId).toBe("user-1");
      expect(reactedMessage.reactions[0].emoji).toBe("👍");
    });

    it("should add multiple reactions from different users", () => {
      let message = createTestMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-2", "❤️");
      message = message.addReaction("user-3", "😂");

      expect(message.reactions).toHaveLength(3);
    });

    it("should not add duplicate reaction from same user with same emoji", () => {
      let message = createTestMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-1", "👍");

      expect(message.reactions).toHaveLength(1);
    });

    it("should allow same user to add different emojis", () => {
      let message = createTestMessage();

      message = message.addReaction("user-1", "👍");
      message = message.addReaction("user-1", "❤️");

      expect(message.reactions).toHaveLength(2);
    });

    it("should preserve original message unchanged", () => {
      const message = createTestMessage();

      const reactedMessage = message.addReaction("user-1", "👍");

      expect(message.reactions).toHaveLength(0);
      expect(reactedMessage.reactions).toHaveLength(1);
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createTestMessage({ updatedAt: originalDate });

      const beforeReaction = new Date();
      const reactedMessage = message.addReaction("user-1", "👍");

      expect(reactedMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeReaction.getTime() - 1000);
    });
  });

  describe("markAsRead", () => {
    it("should add user to readBy list", () => {
      const message = createTestMessage();

      const readMessage = message.markAsRead("user-1");

      expect(readMessage.readBy).toContain("user-1");
      expect(readMessage.readBy).toHaveLength(1);
    });

    it("should add multiple users to readBy list", () => {
      let message = createTestMessage();

      message = message.markAsRead("user-1");
      message = message.markAsRead("user-2");
      message = message.markAsRead("user-3");

      expect(message.readBy).toHaveLength(3);
      expect(message.readBy).toContain("user-1");
      expect(message.readBy).toContain("user-2");
      expect(message.readBy).toContain("user-3");
    });

    it("should not add duplicate user to readBy list", () => {
      let message = createTestMessage({ readBy: ["user-1"] });

      message = message.markAsRead("user-1");

      expect(message.readBy).toHaveLength(1);
    });

    it("should preserve original message unchanged", () => {
      const message = createTestMessage();

      const readMessage = message.markAsRead("user-1");

      expect(message.readBy).toHaveLength(0);
      expect(readMessage.readBy).toHaveLength(1);
    });

    it("should preserve existing readBy entries when adding new one", () => {
      const message = createTestMessage({ readBy: ["user-1", "user-2"] });

      const readMessage = message.markAsRead("user-3");

      expect(readMessage.readBy).toHaveLength(3);
      expect(readMessage.readBy).toContain("user-1");
      expect(readMessage.readBy).toContain("user-2");
      expect(readMessage.readBy).toContain("user-3");
    });

    it("should update the updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const message = createTestMessage({ updatedAt: originalDate });

      const beforeRead = new Date();
      const readMessage = message.markAsRead("user-1");

      expect(readMessage.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeRead.getTime() - 1000);
    });
  });

  describe("MessageType", () => {
    it("should support all standard message types", () => {
      const types: MessageType[] = ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "LOCATION", "CONTACT", "VOICE"];

      types.forEach((type) => {
        const message = createTestMessage({ type });
        expect(message.type).toBe(type);
      });
    });
  });
});
