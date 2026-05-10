import { describe, it, expect } from "vitest";
import { toMessageType } from "@/shared/utils/message-type";
import { MessageType } from "@prisma/client";

describe("message-type utils", () => {
  describe("toMessageType", () => {
    it("should convert valid message type strings to MessageType enum", () => {
      const types: MessageType[] = ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "LOCATION", "CONTACT"];

      types.forEach((type) => {
        expect(toMessageType(type)).toBe(type);
      });
    });

    it("should handle lowercase input", () => {
      expect(toMessageType("text")).toBe("TEXT");
      expect(toMessageType("image")).toBe("IMAGE");
      expect(toMessageType("video")).toBe("VIDEO");
    });

    it("should handle mixed case input", () => {
      expect(toMessageType("Text")).toBe("TEXT");
      expect(toMessageType("IMAGE")).toBe("IMAGE");
      expect(toMessageType("Video")).toBe("VIDEO");
    });

    it("should return TEXT for unknown message types", () => {
      expect(toMessageType("unknown")).toBe("TEXT");
      expect(toMessageType("invalid")).toBe("TEXT");
      expect(toMessageType("")).toBe("TEXT");
    });

    it("should handle special characters in input", () => {
      expect(toMessageType("IMAGE!")).toBe("TEXT");
      expect(toMessageType("video@#")).toBe("TEXT");
    });
  });
});
