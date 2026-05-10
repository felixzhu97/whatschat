import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMessages } from "@/src/presentation/hooks/use-messages";
import type { Message, Contact } from "@/shared/types";

// Mock message-utils to avoid mutations
vi.mock("@/shared/utils/message-utils", () => ({
  createMessage: vi.fn((content: string, type = "text") => ({
    id: "mock-msg-id",
    content,
    type,
    senderId: "current-user",
    senderName: "我",
    timestamp: new Date().toISOString(),
    status: "sent",
  })),
  addMessageToContact: vi.fn(),
  simulateGroupResponse: vi.fn(),
  simulateIndividualResponse: vi.fn(),
}));

describe("useMessages Hook", () => {
  const mockContact: Contact = {
    id: "contact-1",
    name: "Test Contact",
    avatar: "",
    lastMessage: "",
    timestamp: "",
  };

  const mockMessages: Record<string, Message[]> = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have empty message text initially", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(result.current.messageText).toBe("");
    });

    it("should have emoji picker hidden initially", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(result.current.showEmojiPicker).toBe(false);
    });

    it("should have no replying message initially", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(result.current.replyingTo).toBeNull();
    });

    it("should have no editing message initially", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(result.current.editingMessage).toBeNull();
    });

    it("should not be recording voice initially", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(result.current.isRecordingVoice).toBe(false);
    });
  });

  describe("handleMessageChange", () => {
    it("should update message text", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      act(() => {
        result.current.handleMessageChange("Hello");
      });

      expect(result.current.messageText).toBe("Hello");
    });
  });

  describe("handleEmojiSelect", () => {
    it("should append emoji to message text", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      act(() => {
        result.current.handleMessageChange("Hello");
      });

      act(() => {
        result.current.handleEmojiSelect(" 😊");
      });

      expect(result.current.messageText).toBe("Hello 😊");
    });
  });

  describe("handleToggleEmojiPicker", () => {
    it("should toggle emoji picker visibility", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      expect(result.current.showEmojiPicker).toBe(false);

      act(() => {
        result.current.handleToggleEmojiPicker();
      });

      expect(result.current.showEmojiPicker).toBe(true);

      act(() => {
        result.current.handleToggleEmojiPicker();
      });

      expect(result.current.showEmojiPicker).toBe(false);
    });
  });

  describe("handleReply", () => {
    it("should set replying to message", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      const mockMessage: Message = {
        id: "msg-1",
        content: "Original message",
        senderId: "other-user",
        senderName: "Other",
        timestamp: "",
        type: "text",
      };

      act(() => {
        result.current.handleReply(mockMessage);
      });

      expect(result.current.replyingTo).toEqual(mockMessage);
    });
  });

  describe("handleEdit", () => {
    it("should set editing message and populate text", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      const mockMessage: Message = {
        id: "msg-1",
        content: "Message to edit",
        senderId: "current-user",
        senderName: "Me",
        timestamp: "",
        type: "text",
      };

      act(() => {
        result.current.handleEdit(mockMessage);
      });

      expect(result.current.editingMessage).toEqual(mockMessage);
      expect(result.current.messageText).toBe("Message to edit");
    });
  });

  describe("handleCancelReply", () => {
    it("should clear replying state", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      const mockMessage: Message = {
        id: "msg-1",
        content: "Original message",
        senderId: "other-user",
        senderName: "Other",
        timestamp: "",
        type: "text",
      };

      act(() => {
        result.current.handleReply(mockMessage);
      });
      expect(result.current.replyingTo).not.toBeNull();

      act(() => {
        result.current.handleCancelReply();
      });
      expect(result.current.replyingTo).toBeNull();
    });
  });

  describe("handleCancelEdit", () => {
    it("should clear editing state and message text", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      const mockMessage: Message = {
        id: "msg-1",
        content: "Message to edit",
        senderId: "current-user",
        senderName: "Me",
        timestamp: "",
        type: "text",
      };

      act(() => {
        result.current.handleEdit(mockMessage);
      });
      expect(result.current.editingMessage).not.toBeNull();

      act(() => {
        result.current.handleCancelEdit();
      });
      expect(result.current.editingMessage).toBeNull();
      expect(result.current.messageText).toBe("");
    });
  });

  describe("handleRecordingChange", () => {
    it("should update recording state", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      act(() => {
        result.current.handleRecordingChange(true);
      });

      expect(result.current.isRecordingVoice).toBe(true);

      act(() => {
        result.current.handleRecordingChange(false);
      });

      expect(result.current.isRecordingVoice).toBe(false);
    });
  });

  describe("clearInput", () => {
    it("should clear all input states", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: "contact-1",
          selectedContact: mockContact,
          messages: mockMessages,
        })
      );

      act(() => {
        result.current.handleMessageChange("Some text");
      });

      const mockMessage: Message = {
        id: "msg-1",
        content: "Original message",
        senderId: "other-user",
        senderName: "Other",
        timestamp: "",
        type: "text",
      };

      act(() => {
        result.current.handleReply(mockMessage);
      });

      expect(result.current.messageText).toBe("Some text");
      expect(result.current.replyingTo).not.toBeNull();

      act(() => {
        result.current.clearInput();
      });

      expect(result.current.messageText).toBe("");
      expect(result.current.replyingTo).toBeNull();
      expect(result.current.editingMessage).toBeNull();
    });
  });

  describe("returned functions exist", () => {
    it("should return all handler functions", () => {
      const { result } = renderHook(() =>
        useMessages({
          selectedContactId: null,
          selectedContact: null,
          messages: mockMessages,
        })
      );

      expect(typeof result.current.handleMessageChange).toBe("function");
      expect(typeof result.current.handleKeyDown).toBe("function");
      expect(typeof result.current.handleSendMessage).toBe("function");
      expect(typeof result.current.handleEmojiSelect).toBe("function");
      expect(typeof result.current.handleToggleEmojiPicker).toBe("function");
      expect(typeof result.current.handleFileSelect).toBe("function");
      expect(typeof result.current.handleSendVoice).toBe("function");
      expect(typeof result.current.handleReply).toBe("function");
      expect(typeof result.current.handleEdit).toBe("function");
      expect(typeof result.current.handleDelete).toBe("function");
      expect(typeof result.current.handleForward).toBe("function");
      expect(typeof result.current.handleStar).toBe("function");
      expect(typeof result.current.handleInfo).toBe("function");
      expect(typeof result.current.handleCancelReply).toBe("function");
      expect(typeof result.current.handleCancelEdit).toBe("function");
      expect(typeof result.current.handleRecordingChange).toBe("function");
      expect(typeof result.current.clearInput).toBe("function");
    });
  });
});
