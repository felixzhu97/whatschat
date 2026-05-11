import { describe, it, expect } from "vitest";
import type { MessageType, MessageStatus, Attachment, Location } from "@/src/domain/entities/message.entity";
import { Message } from "@/src/domain/entities/message.entity";

// =============================================================================
// TEST DOMAIN CONSTANTS - Web Entity Structure (camelCase)
// =============================================================================

const TEST_TIMESTAMP = "2024-01-15T10:30:00Z";
const TEST_SENDER_ID = "user-1";
const TEST_SENDER_NAME = "John Doe";
const TEST_ID_PREFIX = "msg-";

// =============================================================================
// MESSAGE TYPES & STATUSES - Equivalence Classes for Parameterized Tests
// =============================================================================

const MESSAGE_TYPES: MessageType[] = ["text", "image", "video", "audio", "file", "location", "contact", "voice"];

const MESSAGE_STATUSES: MessageStatus[] = ["sending", "sent", "delivered", "read", "failed"];

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

interface MessageCreateParams {
  id?: string;
  senderId?: string;
  senderName?: string;
  content?: string;
  timestamp?: string;
  type?: MessageType;
  status?: MessageStatus;
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: string;
  isStarred?: boolean;
  isForwarded?: boolean;
  attachments?: Attachment[];
  duration?: number;
  fileName?: string;
  fileSize?: string;
  location?: Location;
  mediaUrl?: string;
}

const createMessage = (overrides: MessageCreateParams = {}): Message => {
  const count = Message["__test_count"] ?? 0;
  Message["__test_count"] = count + 1;

  return Message.create({
    id: `${TEST_ID_PREFIX}${count}`,
    senderId: TEST_SENDER_ID,
    senderName: TEST_SENDER_NAME,
    content: "Test message",
    timestamp: TEST_TIMESTAMP,
    ...overrides,
  });
};

const createTextMessage = (content: string = "Test message", overrides: MessageCreateParams = {}): Message =>
  createMessage({ content, type: "text", ...overrides });

const createMediaMessage = (
  mediaUrl: string = "https://example.com/image.jpg",
  type: MessageType = "image",
  overrides: MessageCreateParams = {}
): Message => createMessage({ mediaUrl, type, ...overrides });

const createLocationMessage = (location: Location, overrides: MessageCreateParams = {}): Message =>
  createMessage({ location, type: "location", ...overrides });

// =============================================================================
// BOUNDARY VALUES
// =============================================================================

const BOUNDARY_VALUES = {
  EMPTY_STRING: "",
  SINGLE_CHAR: "a",
  MAX_LENGTH_1K: "a".repeat(1024),
  MAX_LENGTH_10K: "a".repeat(10240),
  MAX_LENGTH_64K: "a".repeat(65536),
  MAX_INT: Number.MAX_SAFE_INTEGER,
  MINUS_ZERO: -0,
  LARGE_NEGATIVE: -999999,
};

// =============================================================================
// TEST DATA
// =============================================================================

const SAMPLE_ATTACHMENTS: Attachment[] = [
  {
    id: "att-1",
    type: "image",
    url: "https://example.com/image.jpg",
    name: "image.jpg",
    size: 1024,
    mimeType: "image/jpeg",
  },
];

const SAMPLE_LOCATION: Location = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: "San Francisco, CA",
};

// =============================================================================
// SUITE
// =============================================================================

describe("Message Entity", () => {
  // ---------------------------------------------------------------------------
  // Factory Function Tests
  // ---------------------------------------------------------------------------

  describe("Factory Functions", () => {
    it("createMessage should generate unique IDs", () => {
      const msg1 = createMessage();
      const msg2 = createMessage();
      expect(msg1.id).not.toBe(msg2.id);
    });

    it("createTextMessage should create text type message", () => {
      const message = createTextMessage("Hello World");
      expect(message.type).toBe("text");
      expect(message.content).toBe("Hello World");
    });

    it("createMediaMessage should create media message with url and type", () => {
      const message = createMediaMessage("https://example.com/video.mp4", "video");
      expect(message.type).toBe("video");
      expect(message.mediaUrl).toBe("https://example.com/video.mp4");
    });

    it("createLocationMessage should create location message", () => {
      const message = createLocationMessage(SAMPLE_LOCATION);
      expect(message.type).toBe("location");
      expect(message.location).toEqual(SAMPLE_LOCATION);
    });
  });

  // ---------------------------------------------------------------------------
  // create() - Core Creation
  // ---------------------------------------------------------------------------

  describe("create", () => {
    describe("required fields", () => {
      it("should create a message with required fields", () => {
        const message = Message.create({
          id: "msg-1",
          senderId: TEST_SENDER_ID,
          senderName: TEST_SENDER_NAME,
          content: "Hello world",
          timestamp: TEST_TIMESTAMP,
        });

        expect(message.id).toBe("msg-1");
        expect(message.senderId).toBe(TEST_SENDER_ID);
        expect(message.senderName).toBe(TEST_SENDER_NAME);
        expect(message.content).toBe("Hello world");
        expect(message.timestamp).toBe(TEST_TIMESTAMP);
      });
    });

    describe("default values", () => {
      it("should default type to 'text'", () => {
        const message = createMessage();
        expect(message.type).toBe("text");
      });

      it("should default status to 'sending'", () => {
        const message = createMessage();
        expect(message.status).toBe("sending");
      });
    });

    describe("all optional fields", () => {
      it("should create a message with all optional fields", () => {
        const message = Message.create({
          id: "msg-2",
          senderId: TEST_SENDER_ID,
          senderName: TEST_SENDER_NAME,
          content: "Image message",
          timestamp: TEST_TIMESTAMP,
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
    });

    describe("attachments", () => {
      it("should create message with attachments", () => {
        const message = Message.create({
          id: "msg-3",
          senderId: TEST_SENDER_ID,
          senderName: TEST_SENDER_NAME,
          content: "With attachments",
          timestamp: TEST_TIMESTAMP,
          attachments: SAMPLE_ATTACHMENTS,
        });

        expect(message.attachments).toEqual(SAMPLE_ATTACHMENTS);
        expect(message.attachments).toHaveLength(1);
      });

      it("should create message with multiple attachments", () => {
        const attachments: Attachment[] = [
          ...SAMPLE_ATTACHMENTS,
          { id: "att-2", type: "video", url: "https://example.com/video.mp4", name: "video.mp4", size: 2048, mimeType: "video/mp4" },
        ];

        const message = Message.create({
          id: "msg-multi-att",
          senderId: TEST_SENDER_ID,
          senderName: TEST_SENDER_NAME,
          content: "Multiple attachments",
          timestamp: TEST_TIMESTAMP,
          attachments,
        });

        expect(message.attachments).toHaveLength(2);
      });
    });

    describe("location", () => {
      it("should create message with location", () => {
        const message = Message.create({
          id: "msg-4",
          senderId: TEST_SENDER_ID,
          senderName: TEST_SENDER_NAME,
          content: "Location",
          timestamp: TEST_TIMESTAMP,
          location: SAMPLE_LOCATION,
        });

        expect(message.location).toEqual(SAMPLE_LOCATION);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Message Types - Parameterized Tests
  // ---------------------------------------------------------------------------

  describe("create with message types", () => {
    it.each(MESSAGE_TYPES)("should create message with type '%s'", (type) => {
      const message = createMessage({ type });
      expect(message.type).toBe(type);
    });
  });

  // ---------------------------------------------------------------------------
  // Message Statuses - Parameterized Tests
  // ---------------------------------------------------------------------------

  describe("create with message statuses", () => {
    it.each(MESSAGE_STATUSES)("should create message with status '%s'", (status) => {
      const message = createMessage({ status });
      expect(message.status).toBe(status);
    });
  });

  // ---------------------------------------------------------------------------
  // updateStatus()
  // ---------------------------------------------------------------------------

  describe("updateStatus", () => {
    it("should update message status", () => {
      const message = createTextMessage("Hello", { status: "sending" });
      const updatedMessage = message.updateStatus("sent");

      expect(updatedMessage.status).toBe("sent");
      expect(updatedMessage.id).toBe(message.id);
      expect(updatedMessage.content).toBe(message.content);
    });

    it("should return new instance", () => {
      const message = createTextMessage("Hello");
      const updatedMessage = message.updateStatus("delivered");

      expect(updatedMessage).not.toBe(message);
    });

    it("should preserve all other fields", () => {
      const message = createMediaMessage("https://example.com/image.jpg", "image", { isStarred: true });
      const updatedMessage = message.updateStatus("delivered");

      expect(updatedMessage.id).toBe(message.id);
      expect(updatedMessage.content).toBe(message.content);
      expect(updatedMessage.type).toBe(message.type);
      expect(updatedMessage.mediaUrl).toBe(message.mediaUrl);
      expect(updatedMessage.isStarred).toBe(message.isStarred);
    });

    it.each(MESSAGE_STATUSES)("should transition to status '%s'", (status) => {
      const message = createTextMessage("Test");
      const updated = message.updateStatus(status);
      expect(updated.status).toBe(status);
    });
  });

  // ---------------------------------------------------------------------------
  // edit()
  // ---------------------------------------------------------------------------

  describe("edit", () => {
    it("should update content and mark as edited", () => {
      const message = createTextMessage("Original content");
      const editedMessage = message.edit("Updated content");

      expect(editedMessage.content).toBe("Updated content");
      expect(editedMessage.isEdited).toBe(true);
      expect(editedMessage.editedAt).toBeDefined();
    });

    it("should return new instance", () => {
      const message = createTextMessage("Hello");
      const editedMessage = message.edit("Updated");

      expect(editedMessage).not.toBe(message);
    });

    it("should preserve other message properties", () => {
      const message = createMediaMessage(undefined, "image", { isStarred: true, isForwarded: true });
      const editedMessage = message.edit("Updated");

      expect(editedMessage.id).toBe(message.id);
      expect(editedMessage.senderId).toBe(message.senderId);
      expect(editedMessage.timestamp).toBe(message.timestamp);
      expect(editedMessage.isStarred).toBe(message.isStarred);
      expect(editedMessage.isForwarded).toBe(message.isForwarded);
      expect(editedMessage.mediaUrl).toBe(message.mediaUrl);
    });

    it("should set editedAt to current time", () => {
      const beforeEdit = new Date().getTime();
      const message = createTextMessage("Original");
      const edited = message.edit("Updated");

      expect(edited.editedAt).toBeDefined();
      expect(new Date(edited.editedAt!).getTime()).toBeGreaterThanOrEqual(beforeEdit);
    });
  });

  // ---------------------------------------------------------------------------
  // toggleStar()
  // ---------------------------------------------------------------------------

  describe("toggleStar", () => {
    it("should toggle isStarred from false to true", () => {
      const message = createTextMessage("Hello", { isStarred: false });
      const starredMessage = message.toggleStar();

      expect(starredMessage.isStarred).toBe(true);
    });

    it("should toggle isStarred from true to false", () => {
      const message = createTextMessage("Hello", { isStarred: true });
      const unstarredMessage = message.toggleStar();

      expect(unstarredMessage.isStarred).toBe(false);
    });

    it("should return new instance", () => {
      const message = createTextMessage("Hello");
      const toggledMessage = message.toggleStar();

      expect(toggledMessage).not.toBe(message);
    });

    it("should preserve other message properties", () => {
      const message = createMediaMessage(undefined, "image", { isEdited: true, isForwarded: true });
      const starredMessage = message.toggleStar();

      expect(starredMessage.id).toBe(message.id);
      expect(starredMessage.content).toBe(message.content);
      expect(starredMessage.type).toBe(message.type);
      expect(starredMessage.mediaUrl).toBe(message.mediaUrl);
      expect(starredMessage.isEdited).toBe(message.isEdited);
      expect(starredMessage.isForwarded).toBe(message.isForwarded);
    });
  });

  // ---------------------------------------------------------------------------
  // Boundary Value Tests
  // ---------------------------------------------------------------------------

  describe("boundary values", () => {
    describe("content length", () => {
      it("should handle empty content", () => {
        const message = createTextMessage(BOUNDARY_VALUES.EMPTY_STRING);
        expect(message.content).toBe(BOUNDARY_VALUES.EMPTY_STRING);
      });

      it("should handle single character content", () => {
        const message = createTextMessage(BOUNDARY_VALUES.SINGLE_CHAR);
        expect(message.content).toBe(BOUNDARY_VALUES.SINGLE_CHAR);
      });

      it("should handle 1KB content", () => {
        const message = createTextMessage(BOUNDARY_VALUES.MAX_LENGTH_1K);
        expect(message.content).toBe(BOUNDARY_VALUES.MAX_LENGTH_1K);
      });

      it("should handle 10KB content", () => {
        const message = createTextMessage(BOUNDARY_VALUES.MAX_LENGTH_10K);
        expect(message.content).toBe(BOUNDARY_VALUES.MAX_LENGTH_10K);
      });

      it("should handle 64KB content (max)", () => {
        const message = createTextMessage(BOUNDARY_VALUES.MAX_LENGTH_64K);
        expect(message.content).toBe(BOUNDARY_VALUES.MAX_LENGTH_64K);
      });
    });

    describe("duration", () => {
      it("should handle zero duration", () => {
        const message = createMessage({ duration: 0 });
        expect(message.duration).toBe(0);
      });

      it("should handle large duration value", () => {
        const message = createMessage({ duration: 86400 });
        expect(message.duration).toBe(86400);
      });

      it("should handle zero via minus zero", () => {
        const message = createMessage({ duration: 0 });
        expect(message.duration).toBe(0);
      });
    });

    describe("special characters in content", () => {
      it("should handle unicode emoji", () => {
        const message = createTextMessage("Hello 👋🎉");
        expect(message.content).toBe("Hello 👋🎉");
      });

      it("should handle multiline content", () => {
        const message = createTextMessage("Line 1\nLine 2\nLine 3");
        expect(message.content).toBe("Line 1\nLine 2\nLine 3");
      });

      it("should handle HTML content", () => {
        const message = createTextMessage("<p>HTML content</p>");
        expect(message.content).toBe("<p>HTML content</p>");
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Immutability Verification
  // ---------------------------------------------------------------------------

  describe("immutability", () => {
    it("should not mutate original message on status update", () => {
      const original = createTextMessage("Test", { status: "sending" });
      original.updateStatus("sent");
      expect(original.status).toBe("sending");
    });

    it("should not mutate original message on edit", () => {
      const original = createTextMessage("Original");
      original.edit("Updated");
      expect(original.content).toBe("Original");
      expect(original.isEdited).toBeUndefined();
    });

    it("should not mutate original message on star toggle", () => {
      const original = createTextMessage("Test", { isStarred: false });
      original.toggleStar();
      expect(original.isStarred).toBe(false);
    });
  });
});
