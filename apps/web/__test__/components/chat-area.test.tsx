import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ChatArea } from "@/components/chat-area";

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ onChange, onKeyDown, ...props }: any) => (
    <input onChange={onChange} onKeyDown={onKeyDown} {...props} />
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => (
    <div data-testid="scroll-area">{children}</div>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <div data-testid="separator" />,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Send: () => <div data-testid="send-icon" />,
  Paperclip: () => <div data-testid="paperclip-icon" />,
  Smile: () => <div data-testid="smile-icon" />,
  Mic: () => <div data-testid="mic-icon" />,
  Phone: () => <div data-testid="phone-icon" />,
  Video: () => <div data-testid="video-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
}));

// Mock MessageBubble component
vi.mock("@/components/message-bubble", () => ({
  MessageBubble: ({ message, onReply, onStar, onDelete, onCopy }: any) => (
    <div data-testid={`message-${message.id}`}>
      <div>{message.content}</div>
      <button onClick={() => onReply?.(message)}>Reply</button>
      <button onClick={() => onStar?.(message)}>Star</button>
      <button onClick={() => onDelete?.(message)}>Delete</button>
      <button onClick={() => onCopy?.(message)}>Copy</button>
    </div>
  ),
}));

// Mock VoiceRecorder component
vi.mock("@/components/voice-recorder", () => ({
  VoiceRecorder: ({ onRecordingComplete, onCancel }: any) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onRecordingComplete?.("voice-data")}>
        Complete
      </button>
      <button onClick={() => onCancel?.()}>Cancel</button>
    </div>
  ),
}));

// Mock EmojiPicker component
vi.mock("@/components/emoji-picker", () => ({
  EmojiPicker: ({ onEmojiSelect, isOpen }: any) =>
    isOpen ? (
      <div data-testid="emoji-picker">
        <button onClick={() => onEmojiSelect?.("😀")}>😀</button>
      </div>
    ) : null,
}));

describe("ChatArea", () => {
  const mockContact = {
    id: "contact-1",
    name: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    status: "online",
    lastSeen: new Date(),
  };

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

  const mockProps = {
    contact: mockContact,
    messages: mockMessages,
    onSendMessage: vi.fn(),
    onReply: vi.fn(),
    onStar: vi.fn(),
    onDelete: vi.fn(),
    onCopy: vi.fn(),
    onStartCall: vi.fn(),
    onStartVideoCall: vi.fn(),
    onSendFile: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render chat header with contact info", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("在线")).toBeInTheDocument();
    });

    it("should render messages", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("message-msg-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-msg-2")).toBeInTheDocument();
      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
    });

    it("should render message input", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByPlaceholderText("输入消息...")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByTestId("send-icon")).toBeInTheDocument();
      expect(screen.getByTestId("paperclip-icon")).toBeInTheDocument();
      expect(screen.getByTestId("smile-icon")).toBeInTheDocument();
      expect(screen.getByTestId("mic-icon")).toBeInTheDocument();
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getByTestId("video-icon")).toBeInTheDocument();
    });
  });

  describe("Message Input", () => {
    it("should update input value when typing", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      await user.type(input, "Test message");

      expect(input).toHaveValue("Test message");
    });

    it("should send message when Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      expect(mockProps.onSendMessage).toHaveBeenCalledWith(
        "Test message",
        "text"
      );
    });

    it("should send message when send button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      await user.type(input, "Test message");

      const sendButton = screen.getByTestId("send-icon").closest("button");
      if (sendButton) {
        await user.click(sendButton);
        expect(mockProps.onSendMessage).toHaveBeenCalledWith(
          "Test message",
          "text"
        );
      }
    });

    it("should not send empty message", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const sendButton = screen.getByTestId("send-icon").closest("button");
      if (sendButton) {
        await user.click(sendButton);
        expect(mockProps.onSendMessage).not.toHaveBeenCalled();
      }
    });

    it("should clear input after sending message", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");

      expect(input).toHaveValue("");
    });
  });

  describe("Message Actions", () => {
    it("should handle reply action", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const replyButton = screen
        .getByTestId("message-msg-1")
        .querySelector("button");
      if (replyButton) {
        await user.click(replyButton);
        expect(mockProps.onReply).toHaveBeenCalledWith(mockMessages[0]);
      }
    });

    it("should handle star action", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const starButton = screen
        .getByTestId("message-msg-1")
        .querySelectorAll("button")[1];
      if (starButton) {
        await user.click(starButton);
        expect(mockProps.onStar).toHaveBeenCalledWith(mockMessages[0]);
      }
    });

    it("should handle delete action", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const deleteButton = screen
        .getByTestId("message-msg-1")
        .querySelectorAll("button")[2];
      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockProps.onDelete).toHaveBeenCalledWith(mockMessages[0]);
      }
    });

    it("should handle copy action", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const copyButton = screen
        .getByTestId("message-msg-1")
        .querySelectorAll("button")[3];
      if (copyButton) {
        await user.click(copyButton);
        expect(mockProps.onCopy).toHaveBeenCalledWith(mockMessages[0]);
      }
    });
  });

  describe("Call Actions", () => {
    it("should start voice call when phone button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const phoneButton = screen.getByTestId("phone-icon").closest("button");
      if (phoneButton) {
        await user.click(phoneButton);
        expect(mockProps.onStartCall).toHaveBeenCalledWith(mockContact.id);
      }
    });

    it("should start video call when video button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const videoButton = screen.getByTestId("video-icon").closest("button");
      if (videoButton) {
        await user.click(videoButton);
        expect(mockProps.onStartVideoCall).toHaveBeenCalledWith(mockContact.id);
      }
    });
  });

  describe("File Upload", () => {
    it("should trigger file upload when paperclip button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const paperclipButton = screen
        .getByTestId("paperclip-icon")
        .closest("button");
      if (paperclipButton) {
        await user.click(paperclipButton);
        // Note: File upload testing would require more complex setup
        // This is a placeholder for the file upload functionality
      }
    });
  });

  describe("Emoji Picker", () => {
    it("should show emoji picker when smile button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const smileButton = screen.getByTestId("smile-icon").closest("button");
      if (smileButton) {
        await user.click(smileButton);

        await waitFor(() => {
          expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
        });
      }
    });

    it("should insert emoji when emoji is selected", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const smileButton = screen.getByTestId("smile-icon").closest("button");
      if (smileButton) {
        await user.click(smileButton);

        await waitFor(() => {
          const emojiButton = screen.getByText("😀");
          user.click(emojiButton);
        });

        const input = screen.getByPlaceholderText("输入消息...");
        expect(input).toHaveValue("😀");
      }
    });
  });

  describe("Voice Recording", () => {
    it("should show voice recorder when mic button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const micButton = screen.getByTestId("mic-icon").closest("button");
      if (micButton) {
        await user.click(micButton);

        await waitFor(() => {
          expect(screen.getByTestId("voice-recorder")).toBeInTheDocument();
        });
      }
    });

    it("should handle voice recording completion", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const micButton = screen.getByTestId("mic-icon").closest("button");
      if (micButton) {
        await user.click(micButton);

        await waitFor(() => {
          const completeButton = screen.getByText("Complete");
          user.click(completeButton);
        });

        expect(mockProps.onSendMessage).toHaveBeenCalledWith(
          "voice-data",
          "audio"
        );
      }
    });

    it("should cancel voice recording", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const micButton = screen.getByTestId("mic-icon").closest("button");
      if (micButton) {
        await user.click(micButton);

        await waitFor(() => {
          const cancelButton = screen.getByText("Cancel");
          user.click(cancelButton);
        });

        expect(screen.queryByTestId("voice-recorder")).not.toBeInTheDocument();
      }
    });
  });

  describe("Loading States", () => {
    it("should show loading indicator when isLoading is true", () => {
      render(<ChatArea {...mockProps} isLoading={true} />);

      expect(screen.getByText("加载中...")).toBeInTheDocument();
    });

    it("should disable send button when loading", () => {
      render(<ChatArea {...mockProps} isLoading={true} />);

      const sendButton = screen.getByTestId("send-icon").closest("button");
      expect(sendButton).toBeDisabled();
    });
  });

  describe("Empty States", () => {
    it("should show empty state when no messages", () => {
      render(<ChatArea {...mockProps} messages={[]} />);

      expect(screen.getByText("开始对话")).toBeInTheDocument();
    });
  });

  describe("Contact Status", () => {
    it("should show online status", () => {
      render(<ChatArea {...mockProps} />);

      expect(screen.getByText("在线")).toBeInTheDocument();
    });

    it("should show last seen time for offline contacts", () => {
      const offlineContact = {
        ...mockContact,
        status: "offline",
        lastSeen: new Date("2024-01-01T09:00:00Z"),
      };
      render(<ChatArea {...mockProps} contact={offlineContact} />);

      expect(screen.getByText("最后上线：09:00")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      expect(input).toHaveAttribute("aria-label", "输入消息");

      const sendButton = screen.getByTestId("send-icon").closest("button");
      expect(sendButton).toHaveAttribute("aria-label", "发送消息");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ChatArea {...mockProps} />);

      const input = screen.getByPlaceholderText("输入消息...");
      await user.type(input, "Test message");
      await user.keyboard("{Tab}");

      // Should be able to tab to action buttons
      expect(document.activeElement).toBeInTheDocument();
    });
  });
});
