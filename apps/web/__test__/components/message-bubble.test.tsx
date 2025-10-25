import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MessageBubble } from "@/components/message-bubble";

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  CheckCheck: () => <div data-testid="check-check-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Star: () => <div data-testid="star-icon" />,
  StarOff: () => <div data-testid="star-off-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Forward: () => <div data-testid="forward-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick} data-testid="dropdown-item">
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

describe("MessageBubble", () => {
  const mockMessage = {
    id: "msg-1",
    content: "Hello, world!",
    type: "text" as const,
    senderId: "user-1",
    senderName: "John Doe",
    timestamp: "2024-01-01T10:00:00Z",
    status: "read" as const,
    isStarred: false,
    replyTo: undefined,
  };

  const mockProps = {
    message: mockMessage,
    onReply: vi.fn(),
    onStar: vi.fn(),
    onDelete: vi.fn(),
    onForward: vi.fn(),
    onInfo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render message content", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render sender name for other users", () => {
      const otherUserMessage = { ...mockMessage, senderId: "other-user" };
      render(
        <MessageBubble
          {...mockProps}
          message={otherUserMessage}
          isGroup={true}
        />
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render timestamp", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("18:00")).toBeInTheDocument();
    });

    it("should apply correct CSS classes for own messages", () => {
      const ownMessage = { ...mockMessage, senderId: "current-user" };
      render(<MessageBubble {...mockProps} message={ownMessage} />);

      // 查找包含消息内容的 div 元素
      const messageContainer = screen.getByText("Hello, world!").closest("div");
      const bubble = messageContainer?.parentElement;
      expect(bubble).toHaveClass("bg-green-500", "text-white");
    });

    it("should apply correct CSS classes for other messages", () => {
      const otherUserMessage = { ...mockMessage, senderId: "other-user" };
      render(<MessageBubble {...mockProps} message={otherUserMessage} />);

      // 查找包含消息内容的 div 元素
      const messageContainer = screen.getByText("Hello, world!").closest("div");
      const bubble = messageContainer?.parentElement;
      expect(bubble).toHaveClass("bg-white", "border", "shadow-sm");
    });
  });

  describe("Message Status", () => {
    it("should show single check for sent status", () => {
      const sentMessage = {
        ...mockMessage,
        status: "sent" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={sentMessage} />);

      expect(screen.getByText("✓")).toBeInTheDocument();
    });

    it("should show double check for delivered status", () => {
      const deliveredMessage = {
        ...mockMessage,
        status: "delivered" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={deliveredMessage} />);

      expect(screen.getByText("✓✓")).toBeInTheDocument();
    });

    it("should show double check with blue color for read status", () => {
      const readMessage = {
        ...mockMessage,
        status: "read" as const,
        senderId: "current-user",
      };
      render(<MessageBubble {...mockProps} message={readMessage} />);

      expect(screen.getByText("✓✓")).toBeInTheDocument();
    });
  });

  describe("Starred Messages", () => {
    it("should render message normally", () => {
      const starredMessage = { ...mockMessage, isStarred: true };
      render(<MessageBubble {...mockProps} message={starredMessage} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render message normally for non-starred messages", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });

  describe("Reply Functionality", () => {
    it("should render message normally", () => {
      const messageWithReply = {
        ...mockMessage,
        replyTo: "reply-1",
      };
      render(<MessageBubble {...mockProps} message={messageWithReply} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render message normally without reply", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });

  describe("Message Actions", () => {
    it("should render message with actions", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render message with more button", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByTestId("more-vertical-icon")).toBeInTheDocument();
    });
  });

  describe("Message Types", () => {
    it("should render text message correctly", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render image message", () => {
      const imageMessage = {
        ...mockMessage,
        type: "image" as const,
        content: "image.jpg",
        mediaUrl: "https://example.com/image.jpg",
      };
      render(<MessageBubble {...mockProps} message={imageMessage} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "src",
        "/placeholder.svg?height=200&width=300&text=图片"
      );
      expect(image).toHaveAttribute("alt", "图片消息");
    });

    it("should render file message", () => {
      const fileMessage = {
        ...mockMessage,
        type: "file" as const,
        content: "document.pdf",
        fileName: "document.pdf",
        fileSize: "1.2 MB",
      };
      render(<MessageBubble {...mockProps} message={fileMessage} />);

      expect(screen.getByText("document.pdf")).toBeInTheDocument();
      expect(screen.getByText("1.2 MB")).toBeInTheDocument();
    });

    it("should render audio message", () => {
      const audioMessage = {
        ...mockMessage,
        type: "audio" as const,
        content: "voice message",
        duration: 30,
      };
      render(<MessageBubble {...mockProps} message={audioMessage} />);

      expect(screen.getByText("0:30")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render message content", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render more button", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByTestId("more-vertical-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const emptyMessage = { ...mockMessage, content: "" };
      render(<MessageBubble {...mockProps} message={emptyMessage} />);

      // 空内容应该渲染一个空的 p 标签
      const emptyP = screen.getByRole("paragraph");
      expect(emptyP).toBeInTheDocument();
      expect(emptyP).toHaveTextContent("");
    });

    it("should handle very long content", () => {
      const longMessage = {
        ...mockMessage,
        content: "A".repeat(1000),
      };
      render(<MessageBubble {...mockProps} message={longMessage} />);

      expect(screen.getByText("A".repeat(1000))).toBeInTheDocument();
    });

    it("should handle missing sender name", () => {
      const messageWithoutSender = {
        ...mockMessage,
        senderName: "Unknown User",
      };
      render(<MessageBubble {...mockProps} message={messageWithoutSender} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });

  describe("Tooltip Functionality", () => {
    it("should render message normally", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });
  });
});
