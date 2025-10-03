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
    type: "text",
    senderId: "user-1",
    senderName: "John Doe",
    timestamp: new Date("2024-01-01T10:00:00Z"),
    isOwn: true,
    status: "read",
    isStarred: false,
    replyTo: null,
  };

  const mockProps = {
    message: mockMessage,
    onReply: vi.fn(),
    onStar: vi.fn(),
    onDelete: vi.fn(),
    onCopy: vi.fn(),
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
      const otherUserMessage = { ...mockMessage, isOwn: false };
      render(<MessageBubble {...mockProps} message={otherUserMessage} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render timestamp", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByText("10:00")).toBeInTheDocument();
    });

    it("should apply correct CSS classes for own messages", () => {
      render(<MessageBubble {...mockProps} />);

      const bubble = screen.getByText("Hello, world!").closest("div");
      expect(bubble).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("should apply correct CSS classes for other messages", () => {
      const otherUserMessage = { ...mockMessage, isOwn: false };
      render(<MessageBubble {...mockProps} message={otherUserMessage} />);

      const bubble = screen.getByText("Hello, world!").closest("div");
      expect(bubble).toHaveClass("bg-muted");
    });
  });

  describe("Message Status", () => {
    it("should show single check for sent status", () => {
      const sentMessage = { ...mockMessage, status: "sent" };
      render(<MessageBubble {...mockProps} message={sentMessage} />);

      expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    });

    it("should show double check for delivered status", () => {
      const deliveredMessage = { ...mockMessage, status: "delivered" };
      render(<MessageBubble {...mockProps} message={deliveredMessage} />);

      expect(screen.getByTestId("check-check-icon")).toBeInTheDocument();
    });

    it("should show double check with blue color for read status", () => {
      const readMessage = { ...mockMessage, status: "read" };
      render(<MessageBubble {...mockProps} message={readMessage} />);

      const checkIcon = screen.getByTestId("check-check-icon");
      expect(checkIcon).toHaveClass("text-blue-500");
    });
  });

  describe("Starred Messages", () => {
    it("should show star icon for starred messages", () => {
      const starredMessage = { ...mockMessage, isStarred: true };
      render(<MessageBubble {...mockProps} message={starredMessage} />);

      expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    });

    it("should show star-off icon for non-starred messages", () => {
      render(<MessageBubble {...mockProps} />);

      expect(screen.getByTestId("star-off-icon")).toBeInTheDocument();
    });
  });

  describe("Reply Functionality", () => {
    it("should render reply message when present", () => {
      const messageWithReply = {
        ...mockMessage,
        replyTo: {
          id: "reply-1",
          content: "Original message",
          senderName: "Jane Doe",
        },
      };
      render(<MessageBubble {...mockProps} message={messageWithReply} />);

      expect(screen.getByText("Original message")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });

    it("should call onReply when reply button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageBubble {...mockProps} />);

      const moreButton = screen
        .getByTestId("more-vertical-icon")
        .closest("button");
      if (moreButton) {
        await user.click(moreButton);

        const replyButton = screen
          .getByTestId("reply-icon")
          .closest('[data-testid="dropdown-item"]');
        if (replyButton) {
          await user.click(replyButton);
          expect(mockProps.onReply).toHaveBeenCalledWith(mockMessage);
        }
      }
    });
  });

  describe("Message Actions", () => {
    it("should call onStar when star button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageBubble {...mockProps} />);

      const moreButton = screen
        .getByTestId("more-vertical-icon")
        .closest("button");
      if (moreButton) {
        await user.click(moreButton);

        const starButton = screen
          .getByTestId("star-icon")
          .closest('[data-testid="dropdown-item"]');
        if (starButton) {
          await user.click(starButton);
          expect(mockProps.onStar).toHaveBeenCalledWith(mockMessage);
        }
      }
    });

    it("should call onCopy when copy button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageBubble {...mockProps} />);

      const moreButton = screen
        .getByTestId("more-vertical-icon")
        .closest("button");
      if (moreButton) {
        await user.click(moreButton);

        const copyButton = screen
          .getByTestId("copy-icon")
          .closest('[data-testid="dropdown-item"]');
        if (copyButton) {
          await user.click(copyButton);
          expect(mockProps.onCopy).toHaveBeenCalledWith(mockMessage);
        }
      }
    });

    it("should call onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<MessageBubble {...mockProps} />);

      const moreButton = screen
        .getByTestId("more-vertical-icon")
        .closest("button");
      if (moreButton) {
        await user.click(moreButton);

        const deleteButton = screen
          .getByTestId("trash-icon")
          .closest('[data-testid="dropdown-item"]');
        if (deleteButton) {
          await user.click(deleteButton);
          expect(mockProps.onDelete).toHaveBeenCalledWith(mockMessage);
        }
      }
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
        type: "image",
        content: "image.jpg",
        mediaUrl: "https://example.com/image.jpg",
      };
      render(<MessageBubble {...mockProps} message={imageMessage} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
      expect(image).toHaveAttribute("alt", "image.jpg");
    });

    it("should render file message", () => {
      const fileMessage = {
        ...mockMessage,
        type: "file",
        content: "document.pdf",
        mediaUrl: "https://example.com/document.pdf",
      };
      render(<MessageBubble {...mockProps} message={fileMessage} />);

      expect(screen.getByText("document.pdf")).toBeInTheDocument();
    });

    it("should render audio message", () => {
      const audioMessage = {
        ...mockMessage,
        type: "audio",
        content: "voice message",
        duration: 30,
      };
      render(<MessageBubble {...mockProps} message={audioMessage} />);

      expect(screen.getByText("voice message")).toBeInTheDocument();
      expect(screen.getByText("0:30")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<MessageBubble {...mockProps} />);

      const bubble = screen.getByText("Hello, world!").closest("div");
      expect(bubble).toHaveAttribute("role", "listitem");
    });

    it("should have proper button labels", () => {
      render(<MessageBubble {...mockProps} />);

      const moreButton = screen
        .getByTestId("more-vertical-icon")
        .closest("button");
      expect(moreButton).toHaveAttribute("aria-label", "更多选项");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const emptyMessage = { ...mockMessage, content: "" };
      render(<MessageBubble {...mockProps} message={emptyMessage} />);

      const bubble = screen.getByRole("listitem");
      expect(bubble).toBeInTheDocument();
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
      const messageWithoutSender = { ...mockMessage, senderName: undefined };
      render(<MessageBubble {...mockProps} message={messageWithoutSender} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
  });

  describe("Tooltip Functionality", () => {
    it("should show tooltip on hover", async () => {
      const user = userEvent.setup();
      render(<MessageBubble {...mockProps} />);

      const bubble = screen.getByText("Hello, world!").closest("div");
      if (bubble) {
        await user.hover(bubble);

        expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      }
    });
  });
});
