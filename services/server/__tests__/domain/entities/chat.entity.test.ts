import { describe, it, expect } from "vitest";
import { Chat, ChatType } from "@/domain/entities/chat.entity";
import { Message } from "@/domain/entities/message.entity";
import { User } from "@/domain/entities/user.entity";

describe("Chat Entity", () => {
  const createTestChat = (overrides?: Partial<ConstructorParameters<typeof Chat>[0]>) => {
    return Chat.create({
      id: "chat-1",
      type: "PRIVATE",
      name: "Test Chat",
      avatar: "https://example.com/chat.jpg",
      participants: [],
      unreadCount: 0,
      ...overrides,
    });
  };

  const createTestUser = (id: string, username: string) => {
    return User.create({
      id,
      username,
      email: `${username}@example.com`,
    });
  };

  const createTestMessage = (id: string, chatId: string, senderId: string, content: string) => {
    return Message.create({
      id,
      chatId,
      senderId,
      type: "TEXT",
      content,
    });
  };

  describe("constructor", () => {
    it("should create a private chat", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-01");
      const users = [createTestUser("user-1", "user1"), createTestUser("user-2", "user2")];
      const lastMessage = createTestMessage("msg-1", "chat-1", "user-1", "Hello!");
      const chat = new Chat(
        "chat-1",
        "PRIVATE",
        "Chat Name",
        "https://example.com/avatar.jpg",
        users,
        lastMessage,
        5,
        createdAt,
        updatedAt
      );

      expect(chat.id).toBe("chat-1");
      expect(chat.type).toBe("PRIVATE");
      expect(chat.name).toBe("Chat Name");
      expect(chat.avatar).toBe("https://example.com/avatar.jpg");
      expect(chat.participants).toHaveLength(2);
      expect(chat.lastMessage?.content).toBe("Hello!");
      expect(chat.unreadCount).toBe(5);
    });

    it("should use default values for optional fields", () => {
      const chat = new Chat("chat-1", "PRIVATE");

      expect(chat.name).toBeUndefined();
      expect(chat.avatar).toBeUndefined();
      expect(chat.participants).toEqual([]);
      expect(chat.lastMessage).toBeUndefined();
      expect(chat.unreadCount).toBe(0);
      expect(chat.createdAt).toBeInstanceOf(Date);
      expect(chat.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Chat.create", () => {
    it("should create a private chat", () => {
      const chat = createTestChat({ type: "PRIVATE" });

      expect(chat.type).toBe("PRIVATE");
    });

    it("should create a group chat", () => {
      const chat = createTestChat({
        type: "GROUP",
        name: "Group Chat",
        participants: [
          createTestUser("user-1", "user1"),
          createTestUser("user-2", "user2"),
        ],
      });

      expect(chat.type).toBe("GROUP");
      expect(chat.name).toBe("Group Chat");
      expect(chat.participants).toHaveLength(2);
    });

    it("should set custom dates when provided", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const chat = createTestChat({ createdAt, updatedAt });

      expect(chat.createdAt).toBe(createdAt);
      expect(chat.updatedAt).toBe(updatedAt);
    });

    it("should use default unreadCount when not provided", () => {
      const chat = createTestChat();

      expect(chat.unreadCount).toBe(0);
    });

    it("should set custom unreadCount when provided", () => {
      const chat = createTestChat({ unreadCount: 10 });

      expect(chat.unreadCount).toBe(10);
    });
  });

  describe("updateLastMessage", () => {
    it("should update the last message", () => {
      const chat = createTestChat();
      const newMessage = createTestMessage("msg-2", "chat-1", "user-2", "New message");

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.lastMessage?.id).toBe("msg-2");
      expect(updatedChat.lastMessage?.content).toBe("New message");
    });

    it("should preserve other chat properties", () => {
      const users = [createTestUser("user-1", "user1")];
      const chat = createTestChat({
        name: "Chat Name",
        avatar: "https://example.com/avatar.jpg",
        participants: users,
        unreadCount: 5,
      });
      const newMessage = createTestMessage("msg-2", "chat-1", "user-1", "New message");

      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.id).toBe(chat.id);
      expect(updatedChat.name).toBe("Chat Name");
      expect(updatedChat.avatar).toBe("https://example.com/avatar.jpg");
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.unreadCount).toBe(5);
    });

    it("should preserve original chat unchanged", () => {
      const chat = createTestChat();

      const newMessage = createTestMessage("msg-2", "chat-1", "user-1", "New message");
      const updatedChat = chat.updateLastMessage(newMessage);

      expect(chat.lastMessage).toBeUndefined();
      expect(updatedChat.lastMessage?.content).toBe("New message");
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createTestChat({ createdAt, updatedAt: createdAt });
      const newMessage = createTestMessage("msg-2", "chat-1", "user-1", "New message");

      const beforeUpdate = new Date();
      const updatedChat = chat.updateLastMessage(newMessage);

      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });
  });

  describe("incrementUnreadCount", () => {
    it("should increment unread count by 1", () => {
      const chat = createTestChat({ unreadCount: 5 });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.unreadCount).toBe(6);
    });

    it("should increment from zero", () => {
      const chat = createTestChat({ unreadCount: 0 });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.unreadCount).toBe(1);
    });

    it("should preserve original chat unchanged", () => {
      const chat = createTestChat({ unreadCount: 5 });

      const updatedChat = chat.incrementUnreadCount();

      expect(chat.unreadCount).toBe(5);
      expect(updatedChat.unreadCount).toBe(6);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createTestChat({ createdAt, updatedAt: createdAt });

      const beforeUpdate = new Date();
      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });

    it("should preserve other chat properties when incrementing", () => {
      const users = [createTestUser("user-1", "user1")];
      const lastMessage = createTestMessage("msg-1", "chat-1", "user-1", "Hello!");
      const chat = createTestChat({
        name: "Chat Name",
        participants: users,
        lastMessage,
        unreadCount: 5,
      });

      const updatedChat = chat.incrementUnreadCount();

      expect(updatedChat.name).toBe("Chat Name");
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.lastMessage?.id).toBe("msg-1");
      expect(updatedChat.unreadCount).toBe(6);
    });
  });

  describe("resetUnreadCount", () => {
    it("should reset unread count to 0", () => {
      const chat = createTestChat({ unreadCount: 25 });

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.unreadCount).toBe(0);
    });

    it("should preserve original chat unchanged", () => {
      const chat = createTestChat({ unreadCount: 25 });

      const updatedChat = chat.resetUnreadCount();

      expect(chat.unreadCount).toBe(25);
      expect(updatedChat.unreadCount).toBe(0);
    });

    it("should update the updatedAt timestamp", () => {
      const createdAt = new Date("2024-01-01");
      const chat = createTestChat({ createdAt, updatedAt: createdAt, unreadCount: 10 });

      const beforeUpdate = new Date();
      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime() - 1000);
    });

    it("should preserve other chat properties when resetting", () => {
      const users = [createTestUser("user-1", "user1")];
      const lastMessage = createTestMessage("msg-1", "chat-1", "user-1", "Hello!");
      const chat = createTestChat({
        name: "Chat Name",
        participants: users,
        lastMessage,
        unreadCount: 10,
      });

      const updatedChat = chat.resetUnreadCount();

      expect(updatedChat.name).toBe("Chat Name");
      expect(updatedChat.participants).toHaveLength(1);
      expect(updatedChat.lastMessage?.id).toBe("msg-1");
      expect(updatedChat.unreadCount).toBe(0);
    });
  });

  describe("ChatType", () => {
    it("should support PRIVATE chat type", () => {
      const chat = createTestChat({ type: "PRIVATE" });
      expect(chat.type).toBe("PRIVATE");
    });

    it("should support GROUP chat type", () => {
      const chat = createTestChat({ type: "GROUP" });
      expect(chat.type).toBe("GROUP");
    });

    it("should have valid ChatType type definition", () => {
      const privateType: ChatType = "PRIVATE";
      const groupType: ChatType = "GROUP";

      expect(privateType).toBe("PRIVATE");
      expect(groupType).toBe("GROUP");
    });
  });

  describe("with participants", () => {
    it("should store multiple participants", () => {
      const users = [
        createTestUser("user-1", "user1"),
        createTestUser("user-2", "user2"),
        createTestUser("user-3", "user3"),
      ];
      const chat = createTestChat({ participants: users });

      expect(chat.participants).toHaveLength(3);
      expect(chat.participants[0].username).toBe("user1");
      expect(chat.participants[1].username).toBe("user2");
      expect(chat.participants[2].username).toBe("user3");
    });

    it("should allow empty participants for new chat", () => {
      const chat = createTestChat();

      expect(chat.participants).toEqual([]);
    });
  });

  describe("with last message", () => {
    it("should store the last message", () => {
      const lastMessage = createTestMessage("msg-1", "chat-1", "user-1", "Last message");
      const chat = createTestChat({ lastMessage });

      expect(chat.lastMessage).toBeDefined();
      expect(chat.lastMessage?.id).toBe("msg-1");
      expect(chat.lastMessage?.content).toBe("Last message");
    });

    it("should allow undefined last message for new chat", () => {
      const chat = createTestChat();

      expect(chat.lastMessage).toBeUndefined();
    });
  });
});
