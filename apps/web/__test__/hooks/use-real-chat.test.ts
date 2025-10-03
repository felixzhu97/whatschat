import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useRealChat } from "@/hooks/use-real-chat";

// Mock WebSocket manager
const mockWebSocketManager = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  sendMessage: vi.fn(),
  sendTyping: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
};

vi.mock("@/lib/websocket", () => ({
  getWebSocketManager: () => mockWebSocketManager,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useRealChat Hook", () => {
  const mockContactId = "contact-1";
  const mockMessages = [
    {
      id: "msg-1",
      content: "Hello!",
      type: "text",
      senderId: "contact-1",
      senderName: "John Doe",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      isOwn: false,
      status: "read",
      isStarred: false,
      replyTo: null,
    },
    {
      id: "msg-2",
      content: "Hi there!",
      type: "text",
      senderId: "user-1",
      senderName: "Me",
      timestamp: new Date("2024-01-01T10:01:00Z"),
      isOwn: true,
      status: "read",
      isStarred: false,
      replyTo: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockMessages));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(result.current.messages).toEqual(mockMessages);
      expect(result.current.isConnected).toBe(true);
      expect(result.current.isTyping).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should load chat history from localStorage", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `chat_history_${mockContactId}`
      );
      expect(result.current.messages).toEqual(mockMessages);
    });

    it("should handle empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(result.current.messages).toEqual([]);
    });
  });

  describe("WebSocket Connection", () => {
    it("should connect to WebSocket on mount", () => {
      renderHook(() => useRealChat(mockContactId));

      expect(mockWebSocketManager.connect).toHaveBeenCalled();
    });

    it("should disconnect from WebSocket on unmount", () => {
      const { unmount } = renderHook(() => useRealChat(mockContactId));

      unmount();

      expect(mockWebSocketManager.disconnect).toHaveBeenCalled();
    });

    it("should register event listeners", () => {
      renderHook(() => useRealChat(mockContactId));

      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "message_status",
        expect.any(Function)
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "typing",
        expect.any(Function)
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "connected",
        expect.any(Function)
      );
      expect(mockWebSocketManager.on).toHaveBeenCalledWith(
        "disconnected",
        expect.any(Function)
      );
    });
  });

  describe("Send Message", () => {
    it("should send text message", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("Hello, world!", "text");
      });

      expect(mockWebSocketManager.sendMessage).toHaveBeenCalledWith({
        to: mockContactId,
        content: "Hello, world!",
        type: "text",
        replyToMessageId: null,
      });
    });

    it("should send message with reply", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("Reply message", "text", "msg-1");
      });

      expect(mockWebSocketManager.sendMessage).toHaveBeenCalledWith({
        to: mockContactId,
        content: "Reply message",
        type: "text",
        replyToMessageId: "msg-1",
      });
    });

    it("should send different message types", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("image.jpg", "image");
      });

      expect(mockWebSocketManager.sendMessage).toHaveBeenCalledWith({
        to: mockContactId,
        content: "image.jpg",
        type: "image",
        replyToMessageId: null,
      });
    });

    it("should handle send message errors", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      mockWebSocketManager.sendMessage.mockRejectedValueOnce(
        new Error("Send failed")
      );

      await act(async () => {
        await result.current.sendMessage("Hello!", "text");
      });

      expect(result.current.error).toBe("发送消息失败");
    });
  });

  describe("Typing Indicators", () => {
    it("should send typing indicator when typing", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        result.current.sendTyping(true);
      });

      expect(mockWebSocketManager.sendTyping).toHaveBeenCalledWith(
        mockContactId,
        true
      );
    });

    it("should stop typing indicator", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        result.current.sendTyping(false);
      });

      expect(mockWebSocketManager.sendTyping).toHaveBeenCalledWith(
        mockContactId,
        false
      );
    });
  });

  describe("Message Handling", () => {
    it("should handle incoming messages", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      const newMessage = {
        id: "msg-3",
        content: "New message",
        type: "text",
        senderId: mockContactId,
        senderName: "John Doe",
        timestamp: new Date(),
        isOwn: false,
        status: "delivered",
        isStarred: false,
        replyTo: null,
      };

      // Get the message handler that was registered
      const messageHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message"
      )?.[1];

      act(() => {
        messageHandler?.({
          type: "message",
          from: mockContactId,
          data: newMessage,
        });
      });

      expect(result.current.messages).toContainEqual(newMessage);
    });

    it("should handle message status updates", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the message status handler
      const statusHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message_status"
      )?.[1];

      act(() => {
        statusHandler?.({
          messageId: "msg-1",
          status: "read",
        });
      });

      const updatedMessage = result.current.messages.find(
        (msg) => msg.id === "msg-1"
      );
      expect(updatedMessage?.read).toBe(true);
      expect(updatedMessage?.delivered).toBe(true);
    });

    it("should handle typing indicators", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the typing handler
      const typingHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "typing"
      )?.[1];

      act(() => {
        typingHandler?.({
          from: mockContactId,
          data: { isTyping: true },
        });
      });

      expect(result.current.isTyping).toBe(true);
    });

    it("should auto-clear typing indicator after timeout", () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the typing handler
      const typingHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "typing"
      )?.[1];

      act(() => {
        typingHandler?.({
          from: mockContactId,
          data: { isTyping: true },
        });
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isTyping).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("Connection Status", () => {
    it("should handle connection events", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the connected handler
      const connectedHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "connected"
      )?.[1];

      act(() => {
        connectedHandler?.();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it("should handle disconnection events", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Get the disconnected handler
      const disconnectedHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "disconnected"
      )?.[1];

      act(() => {
        disconnectedHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("Message Management", () => {
    it("should save messages to localStorage", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      const newMessage = {
        id: "msg-3",
        content: "New message",
        type: "text",
        senderId: mockContactId,
        senderName: "John Doe",
        timestamp: new Date(),
        isOwn: false,
        status: "delivered",
        isStarred: false,
        replyTo: null,
      };

      // Get the message handler
      const messageHandler = mockWebSocketManager.on.mock.calls.find(
        (call) => call[0] === "message"
      )?.[1];

      act(() => {
        messageHandler?.({
          type: "message",
          from: mockContactId,
          data: newMessage,
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `chat_history_${mockContactId}`,
        JSON.stringify([...mockMessages, newMessage])
      );
    });

    it("should handle message updates", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      act(() => {
        result.current.updateMessage("msg-1", { isStarred: true });
      });

      const updatedMessage = result.current.messages.find(
        (msg) => msg.id === "msg-1"
      );
      expect(updatedMessage?.isStarred).toBe(true);
    });

    it("should handle message deletion", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      act(() => {
        result.current.deleteMessage("msg-1");
      });

      const deletedMessage = result.current.messages.find(
        (msg) => msg.id === "msg-1"
      );
      expect(deletedMessage).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle WebSocket connection errors", () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      mockWebSocketManager.isConnected.mockReturnValue(false);

      act(() => {
        result.current.sendMessage("Hello!", "text");
      });

      expect(result.current.error).toBe("连接已断开，无法发送消息");
    });

    it("should clear error when new action is performed", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      // Set an error
      act(() => {
        result.current.error = "Previous error";
      });

      // Perform a new action
      await act(async () => {
        await result.current.sendMessage("Hello!", "text");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("Contact Change", () => {
    it("should reload chat history when contact changes", () => {
      const { rerender } = renderHook(
        ({ contactId }) => useRealChat(contactId),
        { initialProps: { contactId: "contact-1" } }
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      rerender({ contactId: "contact-2" });

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "chat_history_contact-2"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed localStorage data", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");

      const { result } = renderHook(() => useRealChat(mockContactId));

      expect(result.current.messages).toEqual([]);
    });

    it("should handle empty message content", async () => {
      const { result } = renderHook(() => useRealChat(mockContactId));

      await act(async () => {
        await result.current.sendMessage("", "text");
      });

      expect(mockWebSocketManager.sendMessage).not.toHaveBeenCalled();
    });

    it("should handle null contact ID", () => {
      const { result } = renderHook(() => useRealChat(""));

      expect(result.current.messages).toEqual([]);
    });
  });
});
