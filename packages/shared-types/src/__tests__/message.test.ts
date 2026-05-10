import { describe, it, expect } from "vitest";
import {
  MessageTypeValues,
  type Message,
  type MessageType,
  type MessageStatus,
  type MessageReaction,
  type ContactInfo,
  type Attachment,
  type Location,
} from "../message";

describe("Message Types", () => {
  // ============================================================
  // MessageTypeValues - Test the const array for completeness
  // ============================================================
  describe("MessageTypeValues", () => {
    it("should contain all uppercase message type constants", () => {
      const uppercaseTypes = ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "LOCATION", "CONTACT", "VOICE"];
      uppercaseTypes.forEach((type) => {
        expect(MessageTypeValues).toContain(type);
      });
    });

    it("should contain all lowercase message type constants", () => {
      const lowercaseTypes = ["text", "image", "video", "audio", "file", "location", "contact", "voice"];
      lowercaseTypes.forEach((type) => {
        expect(MessageTypeValues).toContain(type);
      });
    });

    it("should contain special message types", () => {
      const specialTypes = ["sticker", "gif", "system"];
      specialTypes.forEach((type) => {
        expect(MessageTypeValues).toContain(type);
      });
    });

    it("should have exactly 19 message type values", () => {
      expect(MessageTypeValues).toHaveLength(19);
    });

    it("should have unique values without duplicates", () => {
      const uniqueValues = new Set(MessageTypeValues);
      expect(uniqueValues.size).toBe(MessageTypeValues.length);
    });
  });

  // ============================================================
  // MessageType - Test the type alias
  // ============================================================
  describe("MessageType", () => {
    it("should accept uppercase TEXT when given uppercase constant", () => {
      const type: MessageType = "TEXT";
      expect(MessageTypeValues).toContain(type);
    });

    it("should accept lowercase text when given lowercase constant", () => {
      const type: MessageType = "text";
      expect(MessageTypeValues).toContain(type);
    });

    it("should accept all values from MessageTypeValues array", () => {
      MessageTypeValues.forEach((type) => {
        const validType: MessageType = type;
        expect(validType).toBeDefined();
      });
    });

    it("should support image message type variants", () => {
      const upperImage: MessageType = "IMAGE";
      const lowerImage: MessageType = "image";
      expect(upperImage).toBe("IMAGE");
      expect(lowerImage).toBe("image");
    });

    it("should support video message type variants", () => {
      const upperVideo: MessageType = "VIDEO";
      const lowerVideo: MessageType = "video";
      expect(upperVideo).toBe("VIDEO");
      expect(lowerVideo).toBe("video");
    });

    it("should support audio message type variants", () => {
      const upperAudio: MessageType = "AUDIO";
      const lowerAudio: MessageType = "audio";
      expect(upperAudio).toBe("AUDIO");
      expect(lowerAudio).toBe("audio");
    });

    it("should support file message type variants", () => {
      const upperFile: MessageType = "FILE";
      const lowerFile: MessageType = "file";
      expect(upperFile).toBe("FILE");
      expect(lowerFile).toBe("file");
    });

    it("should support location message type variants", () => {
      const upperLocation: MessageType = "LOCATION";
      const lowerLocation: MessageType = "location";
      expect(upperLocation).toBe("LOCATION");
      expect(lowerLocation).toBe("location");
    });

    it("should support contact message type variants", () => {
      const upperContact: MessageType = "CONTACT";
      const lowerContact: MessageType = "contact";
      expect(upperContact).toBe("CONTACT");
      expect(lowerContact).toBe("contact");
    });

    it("should support voice message type variants", () => {
      const upperVoice: MessageType = "VOICE";
      const lowerVoice: MessageType = "voice";
      expect(upperVoice).toBe("VOICE");
      expect(lowerVoice).toBe("voice");
    });

    it("should support sticker message type", () => {
      const stickerType: MessageType = "sticker";
      expect(stickerType).toBe("sticker");
    });

    it("should support gif message type", () => {
      const gifType: MessageType = "gif";
      expect(gifType).toBe("gif");
    });

    it("should support system message type", () => {
      const systemType: MessageType = "system";
      expect(systemType).toBe("system");
    });
  });

  // ============================================================
  // MessageStatus - Test the status type
  // ============================================================
  describe("MessageStatus", () => {
    it("should accept sending status", () => {
      const status: MessageStatus = "sending";
      expect(status).toBe("sending");
    });

    it("should accept sent status", () => {
      const status: MessageStatus = "sent";
      expect(status).toBe("sent");
    });

    it("should accept delivered status", () => {
      const status: MessageStatus = "delivered";
      expect(status).toBe("delivered");
    });

    it("should accept read status", () => {
      const status: MessageStatus = "read";
      expect(status).toBe("read");
    });

    it("should accept failed status", () => {
      const status: MessageStatus = "failed";
      expect(status).toBe("failed");
    });

    it("should support all valid status values", () => {
      const validStatuses: MessageStatus[] = ["sending", "sent", "delivered", "read", "failed"];
      validStatuses.forEach((status) => {
        expect(["sending", "sent", "delivered", "read", "failed"]).toContain(status);
      });
    });
  });

  // ============================================================
  // MessageReaction - Test reaction object
  // ============================================================
  describe("MessageReaction", () => {
    it("should create a reaction with all required fields", () => {
      const reaction: MessageReaction = {
        userId: "user-1",
        emoji: "👍",
        createdAt: new Date().toISOString(),
      };

      expect(reaction.userId).toBe("user-1");
      expect(reaction.emoji).toBe("👍");
      expect(reaction.createdAt).toBeDefined();
    });

    it("should create a reaction without optional createdAt", () => {
      const reaction: MessageReaction = {
        userId: "user-1",
        emoji: "❤️",
      };

      expect(reaction.userId).toBe("user-1");
      expect(reaction.emoji).toBe("❤️");
      expect(reaction.createdAt).toBeUndefined();
    });

    it("should support various emoji reactions", () => {
      const emojis = ["👍", "👎", "❤️", "😂", "😮", "😢", "🙏"];
      emojis.forEach((emoji) => {
        const reaction: MessageReaction = { userId: "user-1", emoji };
        expect(reaction.emoji).toBe(emoji);
      });
    });

    it("should support Date object for createdAt", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const reaction: MessageReaction = {
        userId: "user-1",
        emoji: "👍",
        createdAt: date,
      };

      expect(reaction.createdAt).toEqual(date);
    });

    it("should support ISO string for createdAt", () => {
      const isoString = "2024-01-15T10:30:00.000Z";
      const reaction: MessageReaction = {
        userId: "user-1",
        emoji: "👍",
        createdAt: isoString,
      };

      expect(reaction.createdAt).toBe(isoString);
    });

    it("should support multiple reactions from same user", () => {
      const reactions: MessageReaction[] = [
        { userId: "user-1", emoji: "👍" },
        { userId: "user-1", emoji: "❤️" },
      ];

      expect(reactions).toHaveLength(2);
      expect(reactions.filter((r) => r.userId === "user-1")).toHaveLength(2);
    });
  });

  // ============================================================
  // ContactInfo - Test contact info object
  // ============================================================
  describe("ContactInfo", () => {
    it("should create contact info with all fields", () => {
      const contactInfo: ContactInfo = {
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
      };

      expect(contactInfo.name).toBe("John Doe");
      expect(contactInfo.phone).toBe("+1234567890");
      expect(contactInfo.email).toBe("john@example.com");
      expect(contactInfo.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should create contact info with required fields only", () => {
      const contactInfo: ContactInfo = {
        name: "John Doe",
        phone: "+1234567890",
      };

      expect(contactInfo.name).toBe("John Doe");
      expect(contactInfo.phone).toBe("+1234567890");
      expect(contactInfo.email).toBeUndefined();
      expect(contactInfo.avatar).toBeUndefined();
    });

    it("should handle international phone numbers", () => {
      const contactInfo: ContactInfo = {
        name: "Jane Doe",
        phone: "+86-138-0000-0000",
      };

      expect(contactInfo.phone).toContain("+86");
    });

    it("should handle phone numbers with various formats", () => {
      const formats = ["+1-234-567-8900", "(234) 567-8900", "2345678900"];
      formats.forEach((phone) => {
        const contactInfo: ContactInfo = { name: "User", phone };
        expect(contactInfo.phone).toBe(phone);
      });
    });
  });

  // ============================================================
  // Attachment - Test attachment object
  // ============================================================
  describe("Attachment", () => {
    it("should create an image attachment", () => {
      const attachment: Attachment = {
        id: "att-1",
        type: "image",
        url: "https://example.com/image.jpg",
        name: "image.jpg",
        size: 1024,
        mimeType: "image/jpeg",
        thumbnail: "https://example.com/thumb.jpg",
      };

      expect(attachment.type).toBe("image");
      expect(attachment.mimeType).toBe("image/jpeg");
      expect(attachment.thumbnail).toBeDefined();
    });

    it("should create a video attachment", () => {
      const attachment: Attachment = {
        id: "att-2",
        type: "video",
        url: "https://example.com/video.mp4",
        name: "video.mp4",
        size: 10240,
        mimeType: "video/mp4",
      };

      expect(attachment.type).toBe("video");
      expect(attachment.mimeType).toBe("video/mp4");
    });

    it("should create an audio attachment", () => {
      const attachment: Attachment = {
        id: "att-3",
        type: "audio",
        url: "https://example.com/audio.m4a",
        name: "audio.m4a",
        size: 512,
        mimeType: "audio/mp4",
      };

      expect(attachment.type).toBe("audio");
      expect(attachment.mimeType).toBe("audio/mp4");
    });

    it("should create a file attachment", () => {
      const attachment: Attachment = {
        id: "att-4",
        type: "file",
        url: "https://example.com/document.pdf",
        name: "document.pdf",
        size: 2048,
        mimeType: "application/pdf",
      };

      expect(attachment.type).toBe("file");
      expect(attachment.mimeType).toBe("application/pdf");
    });

    it("should support all attachment types", () => {
      const types: Attachment["type"][] = ["image", "video", "audio", "file"];
      types.forEach((type) => {
        const attachment: Attachment = {
          id: "att",
          type,
          url: "https://example.com/file",
          name: "file",
          size: 100,
          mimeType: "application/octet-stream",
        };
        expect(attachment.type).toBe(type);
      });
    });

    it("should handle various file sizes", () => {
      const smallFile: Attachment = {
        id: "att-1",
        type: "file",
        url: "https://example.com/small.txt",
        name: "small.txt",
        size: 1,
        mimeType: "text/plain",
      };

      const largeFile: Attachment = {
        id: "att-2",
        type: "file",
        url: "https://example.com/large.zip",
        name: "large.zip",
        size: 1073741824,
        mimeType: "application/zip",
      };

      expect(smallFile.size).toBeLessThan(largeFile.size);
    });

    it("should allow optional thumbnail", () => {
      const withThumbnail: Attachment = {
        id: "att-1",
        type: "image",
        url: "https://example.com/image.jpg",
        name: "image.jpg",
        size: 1024,
        mimeType: "image/jpeg",
        thumbnail: "https://example.com/thumb.jpg",
      };

      const withoutThumbnail: Attachment = {
        id: "att-2",
        type: "image",
        url: "https://example.com/image2.jpg",
        name: "image2.jpg",
        size: 1024,
        mimeType: "image/jpeg",
      };

      expect(withThumbnail.thumbnail).toBeDefined();
      expect(withoutThumbnail.thumbnail).toBeUndefined();
    });
  });

  // ============================================================
  // Location - Test location object
  // ============================================================
  describe("Location", () => {
    it("should create location with all fields", () => {
      const location: Location = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA 94102, USA",
      };

      expect(location.latitude).toBe(37.7749);
      expect(location.longitude).toBe(-122.4194);
      expect(location.address).toBe("San Francisco, CA 94102, USA");
    });

    it("should create location with coordinates only", () => {
      const location: Location = {
        latitude: 40.7128,
        longitude: -74.006,
      };

      expect(location.latitude).toBe(40.7128);
      expect(location.longitude).toBe(-74.006);
      expect(location.address).toBeUndefined();
    });

    it("should handle positive latitude (Northern Hemisphere)", () => {
      const location: Location = {
        latitude: 51.5074,
        longitude: -0.1278,
        address: "London, UK",
      };

      expect(location.latitude).toBeGreaterThan(0);
    });

    it("should handle negative latitude (Southern Hemisphere)", () => {
      const location: Location = {
        latitude: -33.8688,
        longitude: 151.2093,
        address: "Sydney, Australia",
      };

      expect(location.latitude).toBeLessThan(0);
    });

    it("should handle positive longitude (Eastern Hemisphere)", () => {
      const location: Location = {
        latitude: 35.6762,
        longitude: 139.6503,
        address: "Tokyo, Japan",
      };

      expect(location.longitude).toBeGreaterThan(0);
    });

    it("should handle negative longitude (Western Hemisphere)", () => {
      const location: Location = {
        latitude: 34.0522,
        longitude: -118.2437,
        address: "Los Angeles, USA",
      };

      expect(location.longitude).toBeLessThan(0);
    });

    it("should handle equator coordinates", () => {
      const equator: Location = {
        latitude: 0,
        longitude: 0,
        address: "Null Island",
      };

      expect(equator.latitude).toBe(0);
      expect(equator.longitude).toBe(0);
    });

    it("should handle polar coordinates", () => {
      const northPole: Location = {
        latitude: 90,
        longitude: 0,
        address: "North Pole",
      };

      const southPole: Location = {
        latitude: -90,
        longitude: 0,
        address: "South Pole",
      };

      expect(northPole.latitude).toBe(90);
      expect(southPole.latitude).toBe(-90);
    });
  });

  // ============================================================
  // Message - Test the main Message interface
  // ============================================================
  describe("Message", () => {
    // ---- Required fields ----
    it("should create a message with required fields only", () => {
      const message: Message = {
        id: "msg-1",
        senderId: "user-1",
        type: "text",
        content: "Hello, World!",
      };

      expect(message.id).toBe("msg-1");
      expect(message.senderId).toBe("user-1");
      expect(message.type).toBe("text");
      expect(message.content).toBe("Hello, World!");
    });

    // ---- Text messages ----
    it("should create a text message with uppercase type", () => {
      const message: Message = {
        id: "msg-1",
        senderId: "user-1",
        senderName: "John",
        type: "TEXT",
        content: "Hello, World!",
        status: "sent",
        timestamp: new Date().toISOString(),
      };

      expect(message.id).toBe("msg-1");
      expect(message.content).toBe("Hello, World!");
      expect(message.type).toBe("TEXT");
      expect(message.status).toBe("sent");
    });

    it("should create a text message with lowercase type", () => {
      const message: Message = {
        id: "msg-1",
        senderId: "user-1",
        type: "text",
        content: "Hello, World!",
      };

      expect(message.type).toBe("text");
    });

    // ---- Image messages ----
    it("should create an image message", () => {
      const message: Message = {
        id: "msg-2",
        senderId: "user-1",
        type: "IMAGE",
        content: "",
        mediaUrl: "https://example.com/image.jpg",
        thumbnailUrl: "https://example.com/thumb.jpg",
      };

      expect(message.type).toBe("IMAGE");
      expect(message.mediaUrl).toBe("https://example.com/image.jpg");
      expect(message.thumbnailUrl).toBe("https://example.com/thumb.jpg");
    });

    it("should create an image message with lowercase type", () => {
      const message: Message = {
        id: "msg-2",
        senderId: "user-1",
        type: "image",
        content: "",
        mediaUrl: "https://example.com/image.jpg",
      };

      expect(message.type).toBe("image");
    });

    // ---- Video messages ----
    it("should create a video message", () => {
      const message: Message = {
        id: "msg-3",
        senderId: "user-1",
        type: "VIDEO",
        content: "",
        mediaUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/video-thumb.jpg",
        duration: 120,
      };

      expect(message.type).toBe("VIDEO");
      expect(message.mediaUrl).toBe("https://example.com/video.mp4");
      expect(message.duration).toBe(120);
    });

    // ---- Audio messages ----
    it("should create an audio message", () => {
      const message: Message = {
        id: "msg-4",
        senderId: "user-1",
        type: "AUDIO",
        content: "",
        mediaUrl: "https://example.com/audio.m4a",
        duration: 45,
        size: 1024,
      };

      expect(message.type).toBe("AUDIO");
      expect(message.duration).toBe(45);
    });

    // ---- Voice messages ----
    it("should create a voice message", () => {
      const message: Message = {
        id: "msg-5",
        senderId: "user-1",
        type: "VOICE",
        content: "",
        mediaUrl: "https://example.com/voice.m4a",
        duration: 30,
      };

      expect(message.type).toBe("VOICE");
      expect(message.duration).toBe(30);
    });

    // ---- File messages ----
    it("should create a file message", () => {
      const message: Message = {
        id: "msg-6",
        senderId: "user-1",
        type: "FILE",
        content: "Document",
        fileName: "document.pdf",
        fileSize: 2048,
        fileUrl: "https://example.com/document.pdf",
        mimeType: "application/pdf",
      };

      expect(message.type).toBe("FILE");
      expect(message.fileName).toBe("document.pdf");
      expect(message.fileSize).toBe(2048);
    });

    // ---- Location messages ----
    it("should create a location message", () => {
      const message: Message = {
        id: "msg-7",
        senderId: "user-1",
        type: "LOCATION",
        content: "My location",
        latitude: 37.7749,
        longitude: -122.4194,
        locationName: "San Francisco",
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: "San Francisco, CA",
        },
      };

      expect(message.type).toBe("LOCATION");
      expect(message.latitude).toBe(37.7749);
      expect(message.longitude).toBe(-122.4194);
      expect(message.location?.address).toBe("San Francisco, CA");
    });

    // ---- Contact messages ----
    it("should create a contact message", () => {
      const message: Message = {
        id: "msg-8",
        senderId: "user-1",
        type: "CONTACT",
        content: "Shared contact",
        contactInfo: {
          name: "John Doe",
          phone: "+1234567890",
          email: "john@example.com",
        },
      };

      expect(message.type).toBe("CONTACT");
      expect(message.contactInfo?.name).toBe("John Doe");
    });

    // ---- Sticker messages ----
    it("should create a sticker message", () => {
      const message: Message = {
        id: "msg-9",
        senderId: "user-1",
        type: "sticker",
        content: "",
        mediaUrl: "https://example.com/sticker.png",
      };

      expect(message.type).toBe("sticker");
    });

    // ---- GIF messages ----
    it("should create a GIF message", () => {
      const message: Message = {
        id: "msg-10",
        senderId: "user-1",
        type: "gif",
        content: "",
        mediaUrl: "https://example.com/gif.gif",
      };

      expect(message.type).toBe("gif");
    });

    // ---- System messages ----
    it("should create a system message", () => {
      const message: Message = {
        id: "msg-11",
        senderId: "system",
        type: "system",
        content: "User joined the group",
      };

      expect(message.type).toBe("system");
      expect(message.senderId).toBe("system");
    });

    // ---- Message statuses ----
    describe("Message Status Flow", () => {
      it("should represent a message being sent", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          status: "sending",
        };

        expect(message.status).toBe("sending");
      });

      it("should represent a sent message", () => {
        const message: Message = {
          id: "msg-2",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          status: "sent",
        };

        expect(message.status).toBe("sent");
      });

      it("should represent a delivered message", () => {
        const message: Message = {
          id: "msg-3",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          status: "delivered",
        };

        expect(message.status).toBe("delivered");
      });

      it("should represent a read message", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          status: "read",
        };

        expect(message.status).toBe("read");
      });

      it("should represent a failed message", () => {
        const message: Message = {
          id: "msg-5",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          status: "failed",
        };

        expect(message.status).toBe("failed");
      });
    });

    // ---- Reactions ----
    describe("Message Reactions", () => {
      it("should support reactions array", () => {
        const reactions: MessageReaction[] = [
          { userId: "user-1", emoji: "👍" },
          { userId: "user-2", emoji: "❤️" },
        ];

        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          reactions,
        };

        expect(message.reactions).toHaveLength(2);
        expect(message.reactions?.[0].emoji).toBe("👍");
        expect(message.reactions?.[1].emoji).toBe("❤️");
      });

      it("should support reactions without reactions array", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
        };

        expect(message.reactions).toBeUndefined();
      });

      it("should support multiple reactions from same user", () => {
        const reactions: MessageReaction[] = [
          { userId: "user-1", emoji: "👍" },
          { userId: "user-1", emoji: "❤️" },
        ];

        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          reactions,
        };

        expect(message.reactions?.filter((r) => r.userId === "user-1")).toHaveLength(2);
      });
    });

    // ---- Replies ----
    describe("Message Replies", () => {
      it("should support replyToMessageId", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "This is a reply",
          replyToMessageId: "msg-3",
        };

        expect(message.replyToMessageId).toBe("msg-3");
      });

      it("should support replyTo alternative field", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "This is a reply",
          replyTo: "Original message",
        };

        expect(message.replyTo).toBe("Original message");
      });

      it("should support replyToId alternative field", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "This is a reply",
          replyToId: "msg-3",
        };

        expect(message.replyToId).toBe("msg-3");
      });

      it("should support replyToContent for quoted reply content", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "This is a reply",
          replyToMessageId: "msg-3",
          replyToContent: "Original message content",
        };

        expect(message.replyToContent).toBe("Original message content");
      });

      it("should support full reply chain", () => {
        const message: Message = {
          id: "msg-4",
          senderId: "user-1",
          type: "text",
          content: "This is a reply",
          replyToMessageId: "msg-3",
          replyTo: "Original message",
          replyToContent: "Hello!",
        };

        expect(message.replyToMessageId).toBe("msg-3");
        expect(message.replyTo).toBe("Original message");
        expect(message.replyToContent).toBe("Hello!");
      });
    });

    // ---- Forwarded messages ----
    describe("Forwarded Messages", () => {
      it("should identify forwarded messages", () => {
        const message: Message = {
          id: "msg-5",
          senderId: "user-1",
          type: "text",
          content: "Forwarded message",
          isForwarded: true,
        };

        expect(message.isForwarded).toBe(true);
      });

      it("should track forwardedFrom chain", () => {
        const message: Message = {
          id: "msg-5",
          senderId: "user-1",
          type: "text",
          content: "Forwarded message",
          isForwarded: true,
          forwardedFrom: ["user-2", "user-3"],
        };

        expect(message.forwardedFrom).toHaveLength(2);
        expect(message.forwardedFrom).toContain("user-2");
        expect(message.forwardedFrom).toContain("user-3");
      });

      it("should track original message ID for forwarded messages", () => {
        const message: Message = {
          id: "msg-5",
          senderId: "user-1",
          type: "text",
          content: "Forwarded message",
          isForwarded: true,
          originalMessageId: "original-msg-1",
        };

        expect(message.originalMessageId).toBe("original-msg-1");
      });

      it("should support single hop forwarding", () => {
        const message: Message = {
          id: "msg-5",
          senderId: "user-1",
          type: "text",
          content: "Forwarded message",
          isForwarded: true,
          forwardedFrom: ["user-2"],
        };

        expect(message.forwardedFrom).toHaveLength(1);
      });
    });

    // ---- Attachments ----
    describe("Message Attachments", () => {
      it("should support attachments array", () => {
        const attachment: Attachment = {
          id: "att-1",
          type: "file",
          url: "https://example.com/file.pdf",
          name: "document.pdf",
          size: 2048,
          mimeType: "application/pdf",
        };

        const message: Message = {
          id: "msg-6",
          senderId: "user-1",
          type: "FILE",
          content: "Document",
          attachments: [attachment],
        };

        expect(message.attachments).toHaveLength(1);
        expect(message.attachments?.[0].name).toBe("document.pdf");
      });

      it("should support multiple attachments", () => {
        const attachments: Attachment[] = [
          {
            id: "att-1",
            type: "image",
            url: "https://example.com/image1.jpg",
            name: "image1.jpg",
            size: 1024,
            mimeType: "image/jpeg",
          },
          {
            id: "att-2",
            type: "image",
            url: "https://example.com/image2.jpg",
            name: "image2.jpg",
            size: 2048,
            mimeType: "image/jpeg",
          },
        ];

        const message: Message = {
          id: "msg-6",
          senderId: "user-1",
          type: "FILE",
          content: "Photos",
          attachments,
        };

        expect(message.attachments).toHaveLength(2);
      });

      it("should support fileName alternative to Attachment objects", () => {
        const message: Message = {
          id: "msg-6",
          senderId: "user-1",
          type: "file",
          content: "File",
          fileName: "document.pdf",
          fileSize: 2048,
          fileUrl: "https://example.com/document.pdf",
        };

        expect(message.fileName).toBe("document.pdf");
      });
    });

    // ---- Read receipts ----
    describe("Read Receipts", () => {
      it("should support readBy array for group messages", () => {
        const message: Message = {
          id: "msg-8",
          senderId: "user-1",
          type: "text",
          content: "Group message",
          readBy: ["user-2", "user-3"],
        };

        expect(message.readBy).toHaveLength(2);
        expect(message.readBy).toContain("user-2");
        expect(message.readBy).toContain("user-3");
      });

      it("should support empty readBy array", () => {
        const message: Message = {
          id: "msg-8",
          senderId: "user-1",
          type: "text",
          content: "Group message",
          readBy: [],
        };

        expect(message.readBy).toHaveLength(0);
      });
    });

    // ---- Starred messages ----
    describe("Starred Messages", () => {
      it("should identify starred messages", () => {
        const message: Message = {
          id: "msg-9",
          senderId: "user-1",
          type: "text",
          content: "Important message",
          isStarred: true,
        };

        expect(message.isStarred).toBe(true);
      });

      it("should support non-starred messages", () => {
        const message: Message = {
          id: "msg-9",
          senderId: "user-1",
          type: "text",
          content: "Regular message",
          isStarred: false,
        };

        expect(message.isStarred).toBe(false);
      });

      it("should default to non-starred when not specified", () => {
        const message: Message = {
          id: "msg-9",
          senderId: "user-1",
          type: "text",
          content: "Regular message",
        };

        expect(message.isStarred).toBeUndefined();
      });
    });

    // ---- Edited messages ----
    describe("Edited Messages", () => {
      it("should identify edited messages", () => {
        const message: Message = {
          id: "msg-10",
          senderId: "user-1",
          type: "text",
          content: "Updated content",
          isEdited: true,
          editedAt: new Date().toISOString(),
        };

        expect(message.isEdited).toBe(true);
        expect(message.editedAt).toBeDefined();
      });

      it("should track edited timestamp", () => {
        const editedAt = new Date("2024-01-15T10:30:00Z");
        const message: Message = {
          id: "msg-10",
          senderId: "user-1",
          type: "text",
          content: "Updated content",
          isEdited: true,
          editedAt: editedAt.toISOString(),
        };

        expect(message.editedAt).toContain("2024-01-15");
      });

      it("should support non-edited messages", () => {
        const message: Message = {
          id: "msg-10",
          senderId: "user-1",
          type: "text",
          content: "Original content",
          isEdited: false,
        };

        expect(message.isEdited).toBe(false);
      });
    });

    // ---- Deleted messages ----
    describe("Deleted Messages", () => {
      it("should identify deleted messages", () => {
        const message: Message = {
          id: "msg-11",
          senderId: "user-1",
          type: "text",
          content: "",
          isDeleted: true,
        };

        expect(message.isDeleted).toBe(true);
        expect(message.content).toBe("");
      });

      it("should preserve message ID when deleted", () => {
        const message: Message = {
          id: "msg-11",
          senderId: "user-1",
          type: "text",
          content: "",
          isDeleted: true,
        };

        expect(message.id).toBe("msg-11");
      });
    });

    // ---- Metadata ----
    describe("Message Metadata", () => {
      it("should support metadata object", () => {
        const message: Message = {
          id: "msg-12",
          senderId: "user-1",
          type: "text",
          content: "With metadata",
          metadata: {
            customField: "value",
            priority: 1,
          },
        };

        expect(message.metadata?.customField).toBe("value");
        expect(message.metadata?.priority).toBe(1);
      });

      it("should support complex metadata", () => {
        const message: Message = {
          id: "msg-12",
          senderId: "user-1",
          type: "text",
          content: "With metadata",
          metadata: {
            mentions: ["user-1", "user-2"],
            replyCount: 5,
            forwardCount: 3,
          },
        };

        expect(message.metadata?.mentions).toEqual(["user-1", "user-2"]);
        expect(message.metadata?.replyCount).toBe(5);
      });

      it("should support undefined metadata", () => {
        const message: Message = {
          id: "msg-12",
          senderId: "user-1",
          type: "text",
          content: "Without metadata",
        };

        expect(message.metadata).toBeUndefined();
      });
    });

    // ---- Timestamps ----
    describe("Message Timestamps", () => {
      it("should support ISO string timestamp", () => {
        const timestamp = "2024-01-15T10:30:00.000Z";
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          timestamp,
        };

        expect(message.timestamp).toBe(timestamp);
      });

      it("should support Date object timestamp", () => {
        const date = new Date("2024-01-15T10:30:00Z");
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          timestamp: date,
        };

        expect(message.timestamp).toEqual(date);
      });

      it("should support createdAt timestamp", () => {
        const createdAt = new Date().toISOString();
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          createdAt,
        };

        expect(message.createdAt).toBe(createdAt);
      });

      it("should support updatedAt timestamp", () => {
        const updatedAt = new Date().toISOString();
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
          updatedAt,
        };

        expect(message.updatedAt).toBe(updatedAt);
      });
    });

    // ---- Chat association ----
    describe("Chat Association", () => {
      it("should associate message with chatId", () => {
        const message: Message = {
          id: "msg-1",
          chatId: "chat-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
        };

        expect(message.chatId).toBe("chat-1");
      });

      it("should support message without chatId", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello!",
        };

        expect(message.chatId).toBeUndefined();
      });
    });

    // ---- Sender info ----
    describe("Sender Information", () => {
      it("should include senderName", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          senderName: "John Doe",
          type: "text",
          content: "Hello!",
        };

        expect(message.senderName).toBe("John Doe");
      });

      it("should include senderAvatar", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          senderName: "John Doe",
          senderAvatar: "https://example.com/avatar.jpg",
          type: "text",
          content: "Hello!",
        };

        expect(message.senderAvatar).toBe("https://example.com/avatar.jpg");
      });
    });

    // ---- Edge cases ----
    describe("Edge Cases", () => {
      it("should handle empty content", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "image",
          content: "",
          mediaUrl: "https://example.com/image.jpg",
        };

        expect(message.content).toBe("");
      });

      it("should handle very long content", () => {
        const longContent = "a".repeat(10000);
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: longContent,
        };

        expect(message.content).toHaveLength(10000);
      });

      it("should handle special characters in content", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "Hello! 🌍 émojis & special <chars>",
        };

        expect(message.content).toContain("🌍");
        expect(message.content).toContain("&");
      });

      it("should handle Unicode content", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "text",
          content: "你好世界 مرحبا שלום",
        };

        expect(message.content).toBeDefined();
      });

      it("should handle zero duration", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "audio",
          content: "",
          duration: 0,
        };

        expect(message.duration).toBe(0);
      });

      it("should handle very large file size", () => {
        const message: Message = {
          id: "msg-1",
          senderId: "user-1",
          type: "file",
          content: "Large file",
          fileSize: Number.MAX_SAFE_INTEGER,
        };

        expect(message.fileSize).toBe(Number.MAX_SAFE_INTEGER);
      });
    });
  });
});
