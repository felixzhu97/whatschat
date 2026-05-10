import { describe, it, expect } from "vitest";
import type { Chat, ChatType } from "../chat";
import type { User } from "../user";
import type { Message } from "../message";

describe("Chat Types", () => {
  // ============================================================
  // ChatType - Test the chat type type
  // ============================================================
  describe("ChatType", () => {
    it("should accept PRIVATE chat type", () => {
      const type: ChatType = "PRIVATE";
      expect(type).toBe("PRIVATE");
    });

    it("should accept GROUP chat type", () => {
      const type: ChatType = "GROUP";
      expect(type).toBe("GROUP");
    });

    it("should accept lowercase private chat type", () => {
      const type: ChatType = "private";
      expect(type).toBe("private");
    });

    it("should accept lowercase group chat type", () => {
      const type: ChatType = "group";
      expect(type).toBe("group");
    });

    it("should accept individual chat type", () => {
      const type: ChatType = "individual";
      expect(type).toBe("individual");
    });

    it("should accept broadcast chat type", () => {
      const type: ChatType = "broadcast";
      expect(type).toBe("broadcast");
    });

    it("should support all valid chat types", () => {
      const validTypes: ChatType[] = [
        "PRIVATE",
        "GROUP",
        "private",
        "group",
        "individual",
        "broadcast",
      ];

      validTypes.forEach((type) => {
        expect([
          "PRIVATE",
          "GROUP",
          "private",
          "group",
          "individual",
          "broadcast",
        ]).toContain(type);
      });
    });

    it("should have exactly 6 chat type options", () => {
      const types: ChatType[] = [
        "PRIVATE",
        "GROUP",
        "private",
        "group",
        "individual",
        "broadcast",
      ];
      expect(types).toHaveLength(6);
    });
  });

  // ============================================================
  // Chat - Test the main Chat interface
  // ============================================================
  describe("Chat", () => {
    describe("when creating a chat with required fields", () => {
      it("should create a valid private chat with required fields", () => {
        const chat: Chat = {
          id: "chat-1",
          type: "PRIVATE",
        };

        expect(chat.id).toBe("chat-1");
        expect(chat.type).toBe("PRIVATE");
      });

      it("should create a valid group chat with required fields", () => {
        const chat: Chat = {
          id: "chat-2",
          type: "GROUP",
        };

        expect(chat.id).toBe("chat-2");
        expect(chat.type).toBe("GROUP");
      });
    });

    describe("when creating private chats", () => {
      it("should create a private chat with contact info", () => {
        const chat: Chat = {
          id: "chat-1",
          type: "PRIVATE",
          name: "John Doe",
          avatar: "https://example.com/avatar.jpg",
        };

        expect(chat.type).toBe("PRIVATE");
        expect(chat.name).toBe("John Doe");
        expect(chat.avatar).toBe("https://example.com/avatar.jpg");
      });

      it("should create a private chat with last message", () => {
        const chat: Chat = {
          id: "chat-2",
          type: "PRIVATE",
          name: "Jane Doe",
          lastMessage: {
            id: "msg-1",
            senderId: "user-1",
            type: "TEXT",
            content: "Hello!",
            timestamp: new Date().toISOString(),
          },
          lastMessageContent: "Hello!",
          lastMessageTime: new Date().toISOString(),
        };

        expect(chat.lastMessage?.content).toBe("Hello!");
        expect(chat.lastMessageContent).toBe("Hello!");
      });

      it("should create a private chat with unread count", () => {
        const chat: Chat = {
          id: "chat-3",
          type: "PRIVATE",
          name: "John",
          unreadCount: 3,
        };

        expect(chat.unreadCount).toBe(3);
      });

      it("should support uppercase PRIVATE type", () => {
        const chat: Chat = {
          id: "chat-4",
          type: "PRIVATE",
          name: "Uppercase Private",
        };

        expect(chat.type).toBe("PRIVATE");
      });

      it("should support lowercase private type", () => {
        const chat: Chat = {
          id: "chat-5",
          type: "private",
          name: "Lowercase Private",
        };

        expect(chat.type).toBe("private");
      });
    });

    describe("when creating group chats", () => {
      it("should create a group chat with all info", () => {
        const chat: Chat = {
          id: "chat-6",
          type: "GROUP",
          name: "Family Group",
          avatar: "https://example.com/group.jpg",
          description: "Family chat group",
          adminId: "user-1",
          adminIds: ["user-1", "user-2"],
        };

        expect(chat.type).toBe("GROUP");
        expect(chat.description).toBe("Family chat group");
        expect(chat.adminId).toBe("user-1");
        expect(chat.adminIds).toContain("user-1");
      });

      it("should create a group chat with adminIds", () => {
        const chat: Chat = {
          id: "chat-7",
          type: "GROUP",
          name: "Team Chat",
          adminIds: ["user-1", "user-2", "user-3"],
        };

        expect(chat.adminIds).toHaveLength(3);
      });

      it("should support uppercase GROUP type", () => {
        const chat: Chat = {
          id: "chat-8",
          type: "GROUP",
          name: "Uppercase Group",
        };

        expect(chat.type).toBe("GROUP");
      });

      it("should support lowercase group type", () => {
        const chat: Chat = {
          id: "chat-9",
          type: "group",
          name: "Lowercase Group",
        };

        expect(chat.type).toBe("group");
      });
    });

    describe("when handling chat settings", () => {
      it("should support chat settings", () => {
        const chat: Chat = {
          id: "chat-10",
          type: "GROUP",
          settings: {
            onlyAdminsCanSendMessages: true,
            disappearingMessages: true,
            disappearingMessagesDuration: 86400,
          },
        };

        expect(chat.settings?.onlyAdminsCanSendMessages).toBe(true);
        expect(chat.settings?.disappearingMessagesDuration).toBe(86400);
      });

      it("should support empty settings", () => {
        const chat: Chat = {
          id: "chat-11",
          type: "PRIVATE",
          settings: {},
        };

        expect(chat.settings).toEqual({});
      });

      it("should support undefined settings", () => {
        const chat: Chat = {
          id: "chat-12",
          type: "PRIVATE",
        };

        expect(chat.settings).toBeUndefined();
      });
    });

    describe("when handling pinning and archiving", () => {
      it("should support pinned chat", () => {
        const pinnedChat: Chat = {
          id: "chat-13",
          type: "PRIVATE",
          isPinned: true,
          isArchived: false,
        };

        expect(pinnedChat.isPinned).toBe(true);
        expect(pinnedChat.isArchived).toBe(false);
      });

      it("should support archived chat", () => {
        const archivedChat: Chat = {
          id: "chat-14",
          type: "PRIVATE",
          isPinned: false,
          isArchived: true,
        };

        expect(archivedChat.isArchived).toBe(true);
        expect(archivedChat.isPinned).toBe(false);
      });

      it("should support neither pinned nor archived", () => {
        const normalChat: Chat = {
          id: "chat-15",
          type: "PRIVATE",
          isPinned: false,
          isArchived: false,
        };

        expect(normalChat.isPinned).toBe(false);
        expect(normalChat.isArchived).toBe(false);
      });

      it("should support both pinned and archived", () => {
        const chat: Chat = {
          id: "chat-16",
          type: "GROUP",
          isPinned: true,
          isArchived: true,
        };

        expect(chat.isPinned).toBe(true);
        expect(chat.isArchived).toBe(true);
      });
    });

    describe("when handling muting", () => {
      it("should support muted chat", () => {
        const mutedChat: Chat = {
          id: "chat-17",
          type: "PRIVATE",
          isMuted: true,
          mutedUntil: new Date(Date.now() + 86400000).toISOString(),
        };

        expect(mutedChat.isMuted).toBe(true);
        expect(mutedChat.mutedUntil).toBeDefined();
      });

      it("should support unmuted chat", () => {
        const unmutedChat: Chat = {
          id: "chat-18",
          type: "PRIVATE",
          isMuted: false,
        };

        expect(unmutedChat.isMuted).toBe(false);
      });

      it("should support mutedUntil date", () => {
        const mutedUntil = new Date(Date.now() + 86400000).toISOString();
        const mutedChat: Chat = {
          id: "chat-19",
          type: "PRIVATE",
          isMuted: true,
          mutedUntil,
        };

        expect(mutedChat.mutedUntil).toBe(mutedUntil);
      });

      it("should support mutedUntil Date object", () => {
        const mutedUntil = new Date(Date.now() + 86400000);
        const mutedChat: Chat = {
          id: "chat-20",
          type: "PRIVATE",
          isMuted: true,
          mutedUntil,
        };

        expect(mutedChat.mutedUntil).toEqual(mutedUntil);
      });
    });

    describe("when handling timestamps", () => {
      it("should support createdAt timestamp", () => {
        const createdAt = new Date("2024-01-15T10:30:00Z");
        const chat: Chat = {
          id: "chat-21",
          type: "PRIVATE",
          createdAt,
        };

        expect(chat.createdAt).toEqual(createdAt);
      });

      it("should support updatedAt timestamp", () => {
        const updatedAt = new Date("2024-01-20T15:00:00Z");
        const chat: Chat = {
          id: "chat-22",
          type: "PRIVATE",
          updatedAt,
        };

        expect(chat.updatedAt).toEqual(updatedAt);
      });

      it("should support lastMessageTime timestamp", () => {
        const lastMessageTime = new Date().toISOString();
        const chat: Chat = {
          id: "chat-23",
          type: "PRIVATE",
          lastMessageTime,
        };

        expect(chat.lastMessageTime).toBe(lastMessageTime);
      });

      it("should support ISO string timestamps", () => {
        const now = new Date().toISOString();
        const chat: Chat = {
          id: "chat-24",
          type: "PRIVATE",
          createdAt: now,
          updatedAt: now,
          lastMessageTime: now,
        };

        expect(chat.createdAt).toBe(now);
        expect(chat.updatedAt).toBe(now);
        expect(chat.lastMessageTime).toBe(now);
      });

      it("should support all timestamps together", () => {
        const createdAt = new Date("2024-01-01T10:00:00Z");
        const updatedAt = new Date("2024-06-01T10:00:00Z");
        const lastMessageTime = new Date("2024-06-10T15:30:00Z");

        const chat: Chat = {
          id: "chat-25",
          type: "PRIVATE",
          createdAt,
          updatedAt,
          lastMessageTime,
        };

        expect(chat.createdAt).toEqual(createdAt);
        expect(chat.updatedAt).toEqual(updatedAt);
        expect(chat.lastMessageTime).toEqual(lastMessageTime);
      });
    });

    describe("when handling participant IDs", () => {
      it("should support participantIds array", () => {
        const chat: Chat = {
          id: "chat-26",
          type: "GROUP",
          participantIds: ["user-1", "user-2", "user-3"],
        };

        expect(chat.participantIds).toHaveLength(3);
        expect(chat.participantIds).toContain("user-1");
      });

      it("should support empty participantIds array", () => {
        const chat: Chat = {
          id: "chat-27",
          type: "GROUP",
          participantIds: [],
        };

        expect(chat.participantIds).toHaveLength(0);
      });

      it("should support many participantIds", () => {
        const participantIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
        const chat: Chat = {
          id: "chat-28",
          type: "GROUP",
          participantIds,
        };

        expect(chat.participantIds).toHaveLength(100);
      });
    });

    describe("when handling participants", () => {
      it("should support participants array", () => {
        const participants: User[] = [
          { id: "user-1", username: "user1", isOnline: true },
          { id: "user-2", username: "user2", isOnline: false },
        ];

        const chat: Chat = {
          id: "chat-29",
          type: "GROUP",
          participants,
        };

        expect(chat.participants).toHaveLength(2);
        expect(chat.participants?.[0].id).toBe("user-1");
      });

      it("should support empty participants array", () => {
        const chat: Chat = {
          id: "chat-30",
          type: "GROUP",
          participants: [],
        };

        expect(chat.participants).toHaveLength(0);
      });
    });

    describe("when handling last message sender", () => {
      it("should support lastMessageSender", () => {
        const chat: Chat = {
          id: "chat-31",
          type: "PRIVATE",
          lastMessageSender: "user-1",
          lastMessageContent: "See you later!",
        };

        expect(chat.lastMessageSender).toBe("user-1");
        expect(chat.lastMessageContent).toBe("See you later!");
      });

      it("should support lastMessageContent without sender", () => {
        const chat: Chat = {
          id: "chat-32",
          type: "PRIVATE",
          lastMessageContent: "Hello!",
        };

        expect(chat.lastMessageContent).toBe("Hello!");
        expect(chat.lastMessageSender).toBeUndefined();
      });
    });

    describe("when handling last message ID", () => {
      it("should support lastMessageId", () => {
        const chat: Chat = {
          id: "chat-33",
          type: "PRIVATE",
          lastMessageId: "msg-123",
        };

        expect(chat.lastMessageId).toBe("msg-123");
      });
    });

    describe("when handling group image", () => {
      it("should support groupImage field", () => {
        const chat: Chat = {
          id: "chat-34",
          type: "GROUP",
          name: "Team",
          groupImage: "https://example.com/group.jpg",
        };

        expect(chat.groupImage).toBe("https://example.com/group.jpg");
      });
    });

    describe("edge cases", () => {
      it("should handle chat with no optional fields", () => {
        const chat: Chat = {
          id: "chat-35",
          type: "PRIVATE",
        };

        expect(chat.id).toBe("chat-35");
        expect(chat.type).toBe("PRIVATE");
        expect(chat.name).toBeUndefined();
        expect(chat.avatar).toBeUndefined();
      });

      it("should handle chat with zero unread count", () => {
        const chat: Chat = {
          id: "chat-36",
          type: "PRIVATE",
          unreadCount: 0,
        };

        expect(chat.unreadCount).toBe(0);
      });

      it("should handle chat with large unread count", () => {
        const chat: Chat = {
          id: "chat-37",
          type: "PRIVATE",
          unreadCount: 999,
        };

        expect(chat.unreadCount).toBe(999);
      });

      it("should handle chat with Unicode name", () => {
        const chat: Chat = {
          id: "chat-38",
          type: "GROUP",
          name: "中文群组 🎉",
        };

        expect(chat.name).toContain("中文");
        expect(chat.name).toContain("🎉");
      });

      it("should handle chat with very long description", () => {
        const longDescription = "a".repeat(1000);
        const chat: Chat = {
          id: "chat-39",
          type: "GROUP",
          name: "Long Description Group",
          description: longDescription,
        };

        expect(chat.description).toHaveLength(1000);
      });

      it("should handle individual chat type", () => {
        const chat: Chat = {
          id: "chat-40",
          type: "individual",
          name: "Individual Chat",
        };

        expect(chat.type).toBe("individual");
      });

      it("should handle broadcast chat type", () => {
        const chat: Chat = {
          id: "chat-41",
          type: "broadcast",
          name: "Announcements",
        };

        expect(chat.type).toBe("broadcast");
      });

      it("should preserve immutability concept", () => {
        const originalChat: Chat = {
          id: "chat-42",
          type: "PRIVATE",
          name: "Original Name",
        };

        const modifiedChat: Chat = {
          ...originalChat,
          name: "Modified Name",
          unreadCount: 5,
        };

        expect(originalChat.name).toBe("Original Name");
        expect(originalChat.unreadCount).toBeUndefined();
        expect(modifiedChat.name).toBe("Modified Name");
        expect(modifiedChat.unreadCount).toBe(5);
      });

      it("should support settings with custom properties", () => {
        const chat: Chat = {
          id: "chat-43",
          type: "GROUP",
          settings: {
            customSetting: "custom value",
            notificationSound: true,
          },
        };

        expect((chat.settings as any)?.customSetting).toBe("custom value");
        expect((chat.settings as any)?.notificationSound).toBe(true);
      });

      it("should support lastMessage with full Message interface", () => {
        const lastMessage: Message = {
          id: "msg-1",
          senderId: "user-1",
          senderName: "John",
          type: "text",
          content: "Hello there!",
          status: "delivered",
          timestamp: new Date().toISOString(),
          reactions: [{ userId: "user-2", emoji: "👍" }],
        };

        const chat: Chat = {
          id: "chat-44",
          type: "PRIVATE",
          lastMessage,
        };

        expect(chat.lastMessage?.content).toBe("Hello there!");
        expect(chat.lastMessage?.reactions).toHaveLength(1);
      });
    });
  });
});
