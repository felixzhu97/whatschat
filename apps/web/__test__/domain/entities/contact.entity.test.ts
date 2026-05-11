import { describe, it, expect } from "vitest";
import type { ContactGroupMember } from "@whatschat/shared-types";
import { Contact } from "@/src/domain/entities/contact.entity";

// =============================================================================
// TEST DOMAIN CONSTANTS - Web Entity Structure
// =============================================================================

const TEST_TIMESTAMP = "2024-01-15T10:30:00Z";
const TEST_LAST_SEEN = "2024-01-15T09:00:00Z";
const TEST_ID_PREFIX = "contact-";

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

interface ContactCreateParams {
  id?: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isGroup?: boolean;
  phone?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  lastSeen?: string;
  pinned?: boolean;
  muted?: boolean;
  blocked?: boolean;
  members?: ContactGroupMember[];
  memberCount?: number;
  description?: string;
  admin?: string[];
}

let contactCounter = 0;
const createContact = (overrides: ContactCreateParams = {}): Contact => {
  contactCounter++;
  return Contact.create({
    id: `${TEST_ID_PREFIX}${contactCounter}`,
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    lastMessage: "Hello there",
    timestamp: TEST_TIMESTAMP,
    ...overrides,
  });
};

const createGroupContact = (overrides: ContactCreateParams = {}): Contact =>
  createContact({ isGroup: true, name: "Team Group", ...overrides });

const createOnlineContact = (overrides: ContactCreateParams = {}): Contact =>
  createContact({ isOnline: true, ...overrides });

const createPinnedContact = (overrides: ContactCreateParams = {}): Contact =>
  createContact({ pinned: true, ...overrides });

const createMutedContact = (overrides: ContactCreateParams = {}): Contact =>
  createContact({ muted: true, ...overrides });

const createContactWithUnread = (count: number, overrides: ContactCreateParams = {}): Contact =>
  createContact({ unreadCount: count, ...overrides });

// =============================================================================
// BOUNDARY VALUES
// =============================================================================

const BOUNDARY_VALUES = {
  EMPTY_STRING: "",
  SINGLE_CHAR: "a",
  MAX_LENGTH_255: "a".repeat(255),
  MAX_UNREAD: 999,
  MAX_MEMBERS: 1024,
  ZERO: 0,
  ONE: 1,
  NEGATIVE: -1,
  LARGE_NEGATIVE: -9999,
};

// =============================================================================
// TEST DATA
// =============================================================================

const SAMPLE_MEMBERS: ContactGroupMember[] = [
  { userId: "user-1", username: "user1" },
  { userId: "user-2", username: "user2" },
  { userId: "user-3", username: "user3" },
];

const SAMPLE_ADMINS = ["user-1", "user-2"];

// =============================================================================
// SUITE
// =============================================================================

describe("Contact Entity", () => {
  // ---------------------------------------------------------------------------
  // Factory Function Tests
  // ---------------------------------------------------------------------------

  describe("Factory Functions", () => {
    it("createContact should generate unique IDs", () => {
      const contact1 = createContact();
      const contact2 = createContact();
      expect(contact1.id).not.toBe(contact2.id);
    });

    it("createGroupContact should create group contact", () => {
      const contact = createGroupContact();
      expect(contact.isGroup).toBe(true);
      expect(contact.name).toBe("Team Group");
    });

    it("createOnlineContact should create online contact", () => {
      const contact = createOnlineContact();
      expect(contact.isOnline).toBe(true);
    });

    it("createPinnedContact should create pinned contact", () => {
      const contact = createPinnedContact();
      expect(contact.pinned).toBe(true);
    });

    it("createMutedContact should create muted contact", () => {
      const contact = createMutedContact();
      expect(contact.muted).toBe(true);
    });

    it("createContactWithUnread should create contact with unread count", () => {
      const contact = createContactWithUnread(5);
      expect(contact.unreadCount).toBe(5);
    });
  });

  // ---------------------------------------------------------------------------
  // create() - Core Creation
  // ---------------------------------------------------------------------------

  describe("create", () => {
    describe("required fields", () => {
      it("should create a contact with required fields", () => {
        const contact = Contact.create({
          id: "contact-1",
          name: "John Doe",
          avatar: "https://example.com/avatar.jpg",
          lastMessage: "Hello there",
          timestamp: TEST_TIMESTAMP,
        });

        expect(contact.id).toBe("contact-1");
        expect(contact.name).toBe("John Doe");
        expect(contact.avatar).toBe("https://example.com/avatar.jpg");
        expect(contact.lastMessage).toBe("Hello there");
        expect(contact.timestamp).toBe(TEST_TIMESTAMP);
      });
    });

    describe("default values", () => {
      it("should default unreadCount to 0", () => {
        const contact = createContact();
        expect(contact.unreadCount).toBe(0);
      });

      it("should default isOnline to false", () => {
        const contact = createContact();
        expect(contact.isOnline).toBe(false);
      });

      it("should default isGroup to false", () => {
        const contact = createContact();
        expect(contact.isGroup).toBe(false);
      });
    });

    describe("all optional fields", () => {
      it("should create a contact with all optional fields", () => {
        const contact = Contact.create({
          id: "contact-2",
          name: "Jane Doe",
          avatar: "https://example.com/jane.jpg",
          lastMessage: "How are you?",
          timestamp: TEST_TIMESTAMP,
          unreadCount: 5,
          isOnline: true,
          isGroup: true,
          phone: "+1234567890",
          email: "jane@example.com",
          phoneNumber: "+1234567890",
          status: "Hey there!",
          lastSeen: TEST_LAST_SEEN,
          pinned: true,
          muted: true,
          blocked: false,
          memberCount: 10,
          description: "Team chat",
          admin: SAMPLE_ADMINS,
        });

        expect(contact.unreadCount).toBe(5);
        expect(contact.isOnline).toBe(true);
        expect(contact.isGroup).toBe(true);
        expect(contact.phone).toBe("+1234567890");
        expect(contact.email).toBe("jane@example.com");
        expect(contact.phoneNumber).toBe("+1234567890");
        expect(contact.status).toBe("Hey there!");
        expect(contact.lastSeen).toBe(TEST_LAST_SEEN);
        expect(contact.pinned).toBe(true);
        expect(contact.muted).toBe(true);
        expect(contact.blocked).toBe(false);
        expect(contact.memberCount).toBe(10);
        expect(contact.description).toBe("Team chat");
        expect(contact.admin).toEqual(SAMPLE_ADMINS);
      });
    });

    describe("group members", () => {
      it("should create contact with group members", () => {
        const contact = Contact.create({
          id: "contact-3",
          name: "Team Group",
          avatar: "",
          lastMessage: "Hello",
          timestamp: TEST_TIMESTAMP,
          members: SAMPLE_MEMBERS,
        });

        expect(contact.members).toEqual(SAMPLE_MEMBERS);
        expect(contact.members).toHaveLength(3);
      });

      it("should create contact with single member", () => {
        const contact = Contact.create({
          id: "contact-single",
          name: "Private Chat",
          avatar: "",
          lastMessage: "Hi",
          timestamp: TEST_TIMESTAMP,
          members: [{ userId: "user-1", username: "user1" }],
        });

        expect(contact.members).toHaveLength(1);
        expect(contact.members![0].userId).toBe("user-1");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // updateLastMessage()
  // ---------------------------------------------------------------------------

  describe("updateLastMessage", () => {
    const NEW_TIMESTAMP = "2024-01-15T10:30:00Z";
    const NEW_MESSAGE = "New message content";

    it("should update last message and timestamp", () => {
      const contact = createContact({ lastMessage: "Old message", timestamp: "2024-01-15T10:00:00Z" });
      const updatedContact = contact.updateLastMessage(NEW_MESSAGE, NEW_TIMESTAMP);

      expect(updatedContact.lastMessage).toBe(NEW_MESSAGE);
      expect(updatedContact.timestamp).toBe(NEW_TIMESTAMP);
    });

    it("should preserve other fields", () => {
      const contact = createContact({
        unreadCount: 5,
        isOnline: true,
        pinned: true,
      });
      const updatedContact = contact.updateLastMessage(NEW_MESSAGE, NEW_TIMESTAMP);

      expect(updatedContact.id).toBe(contact.id);
      expect(updatedContact.name).toBe(contact.name);
      expect(updatedContact.avatar).toBe(contact.avatar);
      expect(updatedContact.unreadCount).toBe(contact.unreadCount);
      expect(updatedContact.isOnline).toBe(contact.isOnline);
      expect(updatedContact.pinned).toBe(contact.pinned);
    });

    it("should return new instance", () => {
      const contact = createContact();
      const updatedContact = contact.updateLastMessage(NEW_MESSAGE, NEW_TIMESTAMP);

      expect(updatedContact).not.toBe(contact);
    });

    it("should update with empty message", () => {
      const contact = createContact();
      const updated = contact.updateLastMessage("", NEW_TIMESTAMP);
      expect(updated.lastMessage).toBe("");
    });

    it("should update with long message", () => {
      const longMessage = "a".repeat(1000);
      const contact = createContact();
      const updated = contact.updateLastMessage(longMessage, NEW_TIMESTAMP);
      expect(updated.lastMessage).toBe(longMessage);
    });
  });

  // ---------------------------------------------------------------------------
  // updateUnreadCount()
  // ---------------------------------------------------------------------------

  describe("updateUnreadCount", () => {
    it("should update unread count", () => {
      const contact = createContact({ unreadCount: 0 });
      const updatedContact = contact.updateUnreadCount(3);

      expect(updatedContact.unreadCount).toBe(3);
    });

    it("should return new instance", () => {
      const contact = createContact();
      const updatedContact = contact.updateUnreadCount(5);

      expect(updatedContact).not.toBe(contact);
    });

    it("should preserve other fields", () => {
      const contact = createContact({
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

    describe("boundary values", () => {
      it("should allow zero unread count", () => {
        const contact = createContact({ unreadCount: 5 });
        const updated = contact.updateUnreadCount(BOUNDARY_VALUES.ZERO);
        expect(updated.unreadCount).toBe(BOUNDARY_VALUES.ZERO);
      });

      it("should clamp negative count to zero", () => {
        const contact = createContact({ unreadCount: 5 });
        const updated = contact.updateUnreadCount(BOUNDARY_VALUES.NEGATIVE);
        expect(updated.unreadCount).toBe(BOUNDARY_VALUES.ZERO);
      });

      it("should clamp large negative to zero", () => {
        const contact = createContact({ unreadCount: 5 });
        const updated = contact.updateUnreadCount(BOUNDARY_VALUES.LARGE_NEGATIVE);
        expect(updated.unreadCount).toBe(BOUNDARY_VALUES.ZERO);
      });

      it("should allow max unread count", () => {
        const contact = createContact();
        const updated = contact.updateUnreadCount(BOUNDARY_VALUES.MAX_UNREAD);
        expect(updated.unreadCount).toBe(BOUNDARY_VALUES.MAX_UNREAD);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // setOnline()
  // ---------------------------------------------------------------------------

  describe("setOnline", () => {
    it("should set online status to true", () => {
      const contact = createContact({ isOnline: false });
      const onlineContact = contact.setOnline(true);

      expect(onlineContact.isOnline).toBe(true);
      expect(onlineContact.lastSeen).toBeUndefined();
    });

    it("should set online status to false and update lastSeen", () => {
      const contact = createContact({ isOnline: true });
      const offlineContact = contact.setOnline(false);

      expect(offlineContact.isOnline).toBe(false);
      expect(offlineContact.lastSeen).toBeDefined();
    });

    it("should return new instance", () => {
      const contact = createContact();
      const updatedContact = contact.setOnline(true);

      expect(updatedContact).not.toBe(contact);
    });

    it("should preserve other fields", () => {
      const contact = createContact({
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

    it("should set lastSeen to current time when going offline", () => {
      const beforeOffline = new Date().toISOString();
      const contact = createContact({ isOnline: true });
      const offline = contact.setOnline(false);

      expect(offline.lastSeen).toBeDefined();
      expect(typeof offline.lastSeen).toBe("string");
      expect(offline.lastSeen!.localeCompare(beforeOffline) >= 0).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // togglePin()
  // ---------------------------------------------------------------------------

  describe("togglePin", () => {
    it("should toggle pinned from false to true", () => {
      const contact = createContact({ pinned: false });
      const pinnedContact = contact.togglePin();

      expect(pinnedContact.pinned).toBe(true);
    });

    it("should toggle pinned from true to false", () => {
      const contact = createContact({ pinned: true });
      const unpinnedContact = contact.togglePin();

      expect(unpinnedContact.pinned).toBe(false);
    });

    it("should return new instance", () => {
      const contact = createContact();
      const toggledContact = contact.togglePin();

      expect(toggledContact).not.toBe(contact);
    });

    it("should preserve other fields", () => {
      const contact = createContact({
        unreadCount: 5,
        isOnline: true,
        muted: true,
      });
      const pinnedContact = contact.togglePin();

      expect(pinnedContact.id).toBe(contact.id);
      expect(pinnedContact.name).toBe(contact.name);
      expect(pinnedContact.unreadCount).toBe(contact.unreadCount);
      expect(pinnedContact.isOnline).toBe(contact.isOnline);
      expect(pinnedContact.muted).toBe(contact.muted);
    });

    it("should toggle from undefined to true", () => {
      const contact = createContact();
      const pinned = contact.togglePin();
      expect(pinned.pinned).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // toggleMute()
  // ---------------------------------------------------------------------------

  describe("toggleMute", () => {
    it("should toggle muted from false to true", () => {
      const contact = createContact({ muted: false });
      const mutedContact = contact.toggleMute();

      expect(mutedContact.muted).toBe(true);
    });

    it("should toggle muted from true to false", () => {
      const contact = createContact({ muted: true });
      const unmutedContact = contact.toggleMute();

      expect(unmutedContact.muted).toBe(false);
    });

    it("should return new instance", () => {
      const contact = createContact();
      const toggledContact = contact.toggleMute();

      expect(toggledContact).not.toBe(contact);
    });

    it("should preserve other fields", () => {
      const contact = createContact({
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

    it("should toggle from undefined to true", () => {
      const contact = createContact();
      const muted = contact.toggleMute();
      expect(muted.muted).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Immutability Verification
  // ---------------------------------------------------------------------------

  describe("immutability", () => {
    it("should not mutate original on updateLastMessage", () => {
      const original = createContact({ lastMessage: "Original" });
      original.updateLastMessage("New", TEST_TIMESTAMP);
      expect(original.lastMessage).toBe("Original");
    });

    it("should not mutate original on updateUnreadCount", () => {
      const original = createContact({ unreadCount: 0 });
      original.updateUnreadCount(5);
      expect(original.unreadCount).toBe(0);
    });

    it("should not mutate original on setOnline", () => {
      const original = createContact({ isOnline: false });
      original.setOnline(true);
      expect(original.isOnline).toBe(false);
    });

    it("should not mutate original on togglePin", () => {
      const original = createContact({ pinned: false });
      original.togglePin();
      expect(original.pinned).toBe(false);
    });

    it("should not mutate original on toggleMute", () => {
      const original = createContact({ muted: false });
      original.toggleMute();
      expect(original.muted).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------

  describe("edge cases", () => {
    it("should handle contact with empty avatar", () => {
      const contact = createContact({ avatar: "" });
      expect(contact.avatar).toBe("");
    });

    it("should handle contact with unicode name", () => {
      const contact = createContact({ name: "张三" });
      expect(contact.name).toBe("张三");
    });

    it("should handle contact with emoji status", () => {
      const contact = createContact({ status: "Hey! 👋" });
      expect(contact.status).toBe("Hey! 👋");
    });

    it("should handle group with max members", () => {
      const contact = createGroupContact({ memberCount: BOUNDARY_VALUES.MAX_MEMBERS });
      expect(contact.memberCount).toBe(BOUNDARY_VALUES.MAX_MEMBERS);
    });

    it("should handle contact with empty phone and email", () => {
      const contact = createContact({ phone: undefined, email: undefined });
      expect(contact.phone).toBeUndefined();
      expect(contact.email).toBeUndefined();
    });
  });
});
