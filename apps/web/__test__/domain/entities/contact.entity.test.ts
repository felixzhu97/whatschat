import { describe, it, expect } from "vitest";
import { Contact } from "@/src/domain/entities/contact.entity";

describe("Contact Entity", () => {
  describe("create", () => {
    it("should create a contact with required fields", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Hello there",
        timestamp: "2024-01-15T10:30:00Z",
      });

      expect(contact.id).toBe("contact-1");
      expect(contact.name).toBe("John Doe");
      expect(contact.avatar).toBe("https://example.com/avatar.jpg");
      expect(contact.lastMessage).toBe("Hello there");
      expect(contact.timestamp).toBe("2024-01-15T10:30:00Z");
      expect(contact.unreadCount).toBe(0);
      expect(contact.isOnline).toBe(false);
      expect(contact.isGroup).toBe(false);
    });

    it("should create a contact with all optional fields", () => {
      const contact = Contact.create({
        id: "contact-2",
        name: "Jane Doe",
        avatar: "https://example.com/jane.jpg",
        lastMessage: "How are you?",
        timestamp: "2024-01-15T10:30:00Z",
        unreadCount: 5,
        isOnline: true,
        isGroup: true,
        phone: "+1234567890",
        email: "jane@example.com",
        phoneNumber: "+1234567890",
        status: "Hey there!",
        lastSeen: "2024-01-15T09:00:00Z",
        pinned: true,
        muted: true,
        blocked: false,
        memberCount: 10,
        description: "Team chat",
        admin: ["user-1", "user-2"],
      });

      expect(contact.unreadCount).toBe(5);
      expect(contact.isOnline).toBe(true);
      expect(contact.isGroup).toBe(true);
      expect(contact.phone).toBe("+1234567890");
      expect(contact.email).toBe("jane@example.com");
      expect(contact.phoneNumber).toBe("+1234567890");
      expect(contact.status).toBe("Hey there!");
      expect(contact.lastSeen).toBe("2024-01-15T09:00:00Z");
      expect(contact.pinned).toBe(true);
      expect(contact.muted).toBe(true);
      expect(contact.blocked).toBe(false);
      expect(contact.memberCount).toBe(10);
      expect(contact.description).toBe("Team chat");
      expect(contact.admin).toEqual(["user-1", "user-2"]);
    });

    it("should handle group members", () => {
      const members = [
        { userId: "user-1", username: "user1" },
        { userId: "user-2", username: "user2" },
      ];

      const contact = Contact.create({
        id: "contact-3",
        name: "Team Group",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:30:00Z",
        members: members as any,
      });

      expect(contact.members).toEqual(members);
    });
  });

  describe("updateLastMessage", () => {
    it("should update last message and timestamp", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Old message",
        timestamp: "2024-01-15T10:00:00Z",
      });

      const updatedContact = contact.updateLastMessage("New message", "2024-01-15T10:30:00Z");

      expect(updatedContact.lastMessage).toBe("New message");
      expect(updatedContact.timestamp).toBe("2024-01-15T10:30:00Z");
    });

    it("should preserve other fields", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Old message",
        timestamp: "2024-01-15T10:00:00Z",
        unreadCount: 5,
        isOnline: true,
        pinned: true,
      });

      const updatedContact = contact.updateLastMessage("New message", "2024-01-15T10:30:00Z");

      expect(updatedContact.id).toBe(contact.id);
      expect(updatedContact.name).toBe(contact.name);
      expect(updatedContact.avatar).toBe(contact.avatar);
      expect(updatedContact.unreadCount).toBe(contact.unreadCount);
      expect(updatedContact.isOnline).toBe(contact.isOnline);
      expect(updatedContact.pinned).toBe(contact.pinned);
    });

    it("should return new instance", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
      });

      const updatedContact = contact.updateLastMessage("New message", "2024-01-15T10:30:00Z");

      expect(updatedContact).not.toBe(contact);
    });
  });

  describe("updateUnreadCount", () => {
    it("should update unread count", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        unreadCount: 0,
      });

      const updatedContact = contact.updateUnreadCount(3);

      expect(updatedContact.unreadCount).toBe(3);
    });

    it("should not allow negative unread count", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        unreadCount: 5,
      });

      const updatedContact = contact.updateUnreadCount(-10);

      expect(updatedContact.unreadCount).toBe(0);
    });

    it("should preserve other fields", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        isOnline: true,
        pinned: true,
        muted: true,
      });

      const updatedContact = contact.updateUnreadCount(10);

      expect(updatedContact.id).toBe(contact.id);
      expect(updatedContact.name).toBe(contact.name);
      expect(updatedContact.isOnline).toBe(contact.isOnline);
      expect(updatedContact.pinned).toBe(contact.pinned);
      expect(updatedContact.muted).toBe(contact.muted);
    });
  });

  describe("setOnline", () => {
    it("should set online status to true", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        isOnline: false,
      });

      const onlineContact = contact.setOnline(true);

      expect(onlineContact.isOnline).toBe(true);
      expect(onlineContact.lastSeen).toBeUndefined();
    });

    it("should set online status to false and update lastSeen", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        isOnline: true,
      });

      const offlineContact = contact.setOnline(false);

      expect(offlineContact.isOnline).toBe(false);
      expect(offlineContact.lastSeen).toBeDefined();
    });

    it("should preserve other fields", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        unreadCount: 5,
        pinned: true,
        muted: true,
      });

      const updatedContact = contact.setOnline(true);

      expect(updatedContact.id).toBe(contact.id);
      expect(updatedContact.name).toBe(contact.name);
      expect(updatedContact.unreadCount).toBe(contact.unreadCount);
      expect(updatedContact.pinned).toBe(contact.pinned);
      expect(updatedContact.muted).toBe(contact.muted);
    });
  });

  describe("togglePin", () => {
    it("should toggle pinned from false to true", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        pinned: false,
      });

      const pinnedContact = contact.togglePin();

      expect(pinnedContact.pinned).toBe(true);
    });

    it("should toggle pinned from true to false", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        pinned: true,
      });

      const unpinnedContact = contact.togglePin();

      expect(unpinnedContact.pinned).toBe(false);
    });

    it("should return new instance", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
      });

      const toggledContact = contact.togglePin();

      expect(toggledContact).not.toBe(contact);
    });
  });

  describe("toggleMute", () => {
    it("should toggle muted from false to true", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        muted: false,
      });

      const mutedContact = contact.toggleMute();

      expect(mutedContact.muted).toBe(true);
    });

    it("should toggle muted from true to false", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        muted: true,
      });

      const unmutedContact = contact.toggleMute();

      expect(unmutedContact.muted).toBe(false);
    });

    it("should preserve other fields", () => {
      const contact = Contact.create({
        id: "contact-1",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
        lastMessage: "Hello",
        timestamp: "2024-01-15T10:00:00Z",
        unreadCount: 5,
        isOnline: true,
        pinned: true,
      });

      const mutedContact = contact.toggleMute();

      expect(mutedContact.id).toBe(contact.id);
      expect(mutedContact.name).toBe(contact.name);
      expect(mutedContact.unreadCount).toBe(contact.unreadCount);
      expect(mutedContact.isOnline).toBe(contact.isOnline);
      expect(mutedContact.pinned).toBe(contact.pinned);
    });
  });
});
