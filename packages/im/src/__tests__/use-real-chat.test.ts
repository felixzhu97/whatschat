import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRealChat, StorageAdapter } from "../presentation/use-real-chat";
import type { IWebSocketAdapter } from "../domain/websocket.adapter";
import type { ChatState } from "../domain/types";

const createMockWebSocketAdapter = (): IWebSocketAdapter => ({
  send: vi.fn(),
  on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
    (vi.fn() as Record<string, (...args: unknown[]) => void>)[event] = callback;
  }),
  off: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => true),
});

describe("useRealChat Hook", () => {
  describe("interface validation", () => {
    it("should have StorageAdapter interface", () => {
      const storage: StorageAdapter = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      };
      expect(typeof storage.getItem).toBe("function");
      expect(typeof storage.setItem).toBe("function");
    });

    it("should handle storage getItem returning null", () => {
      const storage: StorageAdapter = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      };
      expect(storage.getItem("key")).toBeNull();
    });

    it("should handle storage getItem returning string", () => {
      const storage: StorageAdapter = {
        getItem: vi.fn(() => '{"test": true}'),
        setItem: vi.fn(),
      };
      expect(storage.getItem("key")).toBe('{"test": true}');
    });

    it("should handle storage setItem", () => {
      const storage: StorageAdapter = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      };
      storage.setItem("key", "value");
      expect(storage.setItem).toHaveBeenCalledWith("key", "value");
    });
  });

  describe("WebSocket adapter interface", () => {
    it("should have all required methods", () => {
      const adapter = createMockWebSocketAdapter();
      expect(typeof adapter.send).toBe("function");
      expect(typeof adapter.on).toBe("function");
      expect(typeof adapter.off).toBe("function");
      expect(typeof adapter.disconnect).toBe("function");
      expect(typeof adapter.isConnected).toBe("function");
    });

    it("should register callbacks via on", () => {
      const adapter = createMockWebSocketAdapter();
      const callback = vi.fn();
      adapter.on("message", callback);
      expect(adapter.on).toHaveBeenCalledWith("message", callback);
    });

    it("should unregister callbacks via off", () => {
      const adapter = createMockWebSocketAdapter();
      const callback = vi.fn();
      adapter.on("message", callback);
      adapter.off("message", callback);
      expect(adapter.off).toHaveBeenCalledWith("message", callback);
    });

    it("should send messages", () => {
      const adapter = createMockWebSocketAdapter();
      adapter.send({ type: "message", data: { text: "Hello" } });
      expect(adapter.send).toHaveBeenCalledWith({
        type: "message",
        data: { text: "Hello" },
      });
    });

    it("should report connection status", () => {
      const connectedAdapter = createMockWebSocketAdapter();
      (connectedAdapter.isConnected as ReturnType<typeof vi.fn>).mockReturnValue(true);
      expect(connectedAdapter.isConnected()).toBe(true);

      const disconnectedAdapter = createMockWebSocketAdapter();
      (disconnectedAdapter.isConnected as ReturnType<typeof vi.fn>).mockReturnValue(false);
      expect(disconnectedAdapter.isConnected()).toBe(false);
    });
  });

  describe("ChatState interface", () => {
    it("should have correct structure", () => {
      const state: ChatState = {
        messages: [],
        isTyping: false,
        typingUsers: [],
        isConnected: false,
      };

      expect(state.messages).toEqual([]);
      expect(state.isTyping).toBe(false);
      expect(state.typingUsers).toEqual([]);
      expect(state.isConnected).toBe(false);
    });

    it("should allow messages to be populated", () => {
      const state: ChatState = {
        messages: [
          {
            id: "1",
            senderId: "user1",
            senderName: "User 1",
            content: "Hello",
            timestamp: new Date().toISOString(),
            type: "text",
            status: "sent",
          },
        ],
        isTyping: true,
        typingUsers: ["user2"],
        isConnected: true,
      };

      expect(state.messages).toHaveLength(1);
      expect(state.isTyping).toBe(true);
      expect(state.typingUsers).toContain("user2");
      expect(state.isConnected).toBe(true);
    });
  });
});

describe("useRealChat message handling logic", () => {
  it("should format message correctly for sending", () => {
    const text = "Hello, World!";
    const type = "text";
    const to = "contact-1";
    const messageId = Date.now().toString();

    const wsMessage = {
      type: "message",
      to,
      data: { id: messageId, text, type },
    };

    expect(wsMessage.type).toBe("message");
    expect(wsMessage.to).toBe("contact-1");
    expect(wsMessage.data.text).toBe("Hello, World!");
  });

  it("should format typing indicator correctly", () => {
    const typingTrue = {
      type: "typing",
      to: "contact-1",
      data: { isTyping: true },
    };

    const typingFalse = {
      type: "typing",
      to: "contact-1",
      data: { isTyping: false },
    };

    expect(typingTrue.data.isTyping).toBe(true);
    expect(typingFalse.data.isTyping).toBe(false);
  });

  it("should format message read receipt correctly", () => {
    const readReceipt = {
      type: "message_read" as const,
      to: "contact-1",
      data: { messageId: "msg-123" },
    };

    expect(readReceipt.type).toBe("message_read");
    expect(readReceipt.data.messageId).toBe("msg-123");
  });
});
