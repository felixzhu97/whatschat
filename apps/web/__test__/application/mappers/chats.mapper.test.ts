import { describe, it, expect } from "vitest";
import {
  mapApiChatRowToContact,
  mapApiMessageRowToMessage,
  mapUnknownToContactCreate,
  mapUnknownToMessageCreate,
  type ApiChatRow,
  type ApiMessageRow,
} from "@/src/application/mappers/chats.mapper";

describe("chats.mapper", () => {
  describe("mapApiChatRowToContact", () => {
    it("should map basic chat row to contact", () => {
      const apiChatRow: ApiChatRow = {
        id: "chat-123",
        name: "Test Chat",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: { content: "Hello there" },
        updatedAt: "2024-01-15T10:30:00Z",
        type: "PRIVATE",
        participants: [{ isOnline: true }],
      };

      const contact = mapApiChatRowToContact(apiChatRow);

      expect(contact.id).toBe("chat-123");
      expect(contact.name).toBe("Test Chat");
      expect(contact.avatar).toBe("https://example.com/avatar.jpg");
      expect(contact.lastMessage).toBe("Hello there");
      expect(contact.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(contact.isGroup).toBe(false);
      expect(contact.isOnline).toBe(true);
    });

    it("should handle GROUP type as group chat", () => {
      const apiChatRow: ApiChatRow = {
        id: "group-456",
        name: "Team Group",
        type: "GROUP",
        participants: [{ isOnline: false }],
      };

      const contact = mapApiChatRowToContact(apiChatRow);

      expect(contact.isGroup).toBe(true);
    });

    it("should use default values for missing fields", () => {
      const apiChatRow: ApiChatRow = {
        id: "minimal-chat",
      };

      const contact = mapApiChatRowToContact(apiChatRow);

      expect(contact.id).toBe("minimal-chat");
      expect(contact.name).toBe("Chat");
      expect(contact.avatar).toBe("");
      expect(contact.lastMessage).toBe("");
      expect(contact.timestamp).toBe("");
      expect(contact.unreadCount).toBe(0);
      expect(contact.isOnline).toBe(false);
    });

    it("should check online status from participants", () => {
      const onlineChat: ApiChatRow = {
        id: "online-chat",
        participants: [{ isOnline: true }, { isOnline: false }],
      };

      const offlineChat: ApiChatRow = {
        id: "offline-chat",
        participants: [{ isOnline: false }],
      };

      const emptyParticipantsChat: ApiChatRow = {
        id: "empty-chat",
        participants: [],
      };

      expect(mapApiChatRowToContact(onlineChat).isOnline).toBe(true);
      expect(mapApiChatRowToContact(offlineChat).isOnline).toBe(false);
      expect(mapApiChatRowToContact(emptyParticipantsChat).isOnline).toBe(false);
    });

    it("should handle missing lastMessage content", () => {
      const apiChatRow: ApiChatRow = {
        id: "chat-no-message",
        lastMessage: {},
      };

      const contact = mapApiChatRowToContact(apiChatRow);

      expect(contact.lastMessage).toBe("");
    });
  });

  describe("mapApiMessageRowToMessage", () => {
    it("should map basic message row to message", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        sender: { username: "JohnDoe" },
        content: "Hello, world!",
        timestamp: "2024-01-15T10:30:00Z",
        type: "text",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.id).toBe("msg-123");
      expect(message.senderId).toBe("user-456");
      expect(message.senderName).toBe("JohnDoe");
      expect(message.content).toBe("Hello, world!");
      expect(message.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(message.type).toBe("text");
      expect(message.status).toBe("delivered");
    });

    it("should use createdAt when timestamp is missing", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Hello",
        createdAt: "2024-01-15T12:00:00Z",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.timestamp).toBe("2024-01-15T12:00:00Z");
    });

    it("should use current date string when both timestamps are missing", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Hello",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.timestamp).toBeDefined();
      expect(typeof message.timestamp).toBe("string");
    });

    it("should handle missing sender", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.senderName).toBe("");
    });

    it("should convert type to lowercase", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        type: "IMAGE",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.type).toBe("image");
    });

    it("should default to text type", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.type).toBe("text");
    });

    it("should include mediaUrl when present", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Image",
        timestamp: "2024-01-15T10:30:00Z",
        mediaUrl: "https://example.com/image.jpg",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.mediaUrl).toBe("https://example.com/image.jpg");
    });

    it("should not include mediaUrl when null", () => {
      const apiMessageRow: ApiMessageRow = {
        id: "msg-123",
        senderId: "user-456",
        content: "Text message",
        timestamp: "2024-01-15T10:30:00Z",
      };

      const message = mapApiMessageRowToMessage(apiMessageRow);

      expect(message.mediaUrl).toBeUndefined();
    });
  });

  describe("mapUnknownToContactCreate", () => {
    it("should create contact from unknown data", () => {
      const unknownData = {
        id: "contact-789",
        name: "Test Contact",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Last message content",
        timestamp: "2024-01-15T10:30:00Z",
        unreadCount: 5,
      };

      const contact = mapUnknownToContactCreate(unknownData);

      expect(contact.id).toBe("contact-789");
      expect(contact.name).toBe("Test Contact");
      expect(contact.avatar).toBe("https://example.com/avatar.jpg");
      expect(contact.lastMessage).toBe("Last message content");
      expect(contact.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(contact.unreadCount).toBe(5);
    });
  });

  describe("mapUnknownToMessageCreate", () => {
    it("should create message from unknown data", () => {
      const unknownData = {
        id: "msg-999",
        senderId: "sender-123",
        senderName: "Sender Name",
        content: "Test content",
        timestamp: "2024-01-15T10:30:00Z",
        type: "image",
      };

      const message = mapUnknownToMessageCreate(unknownData);

      expect(message.id).toBe("msg-999");
      expect(message.senderId).toBe("sender-123");
      expect(message.senderName).toBe("Sender Name");
      expect(message.content).toBe("Test content");
      expect(message.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(message.type).toBe("image");
    });
  });
});
