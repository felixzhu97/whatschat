import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@/lib/llm/client";
import type { ChatMessage, ChatOptions } from "@/lib/llm/types";

vi.mock("ollama", () => ({
  Ollama: vi.fn().mockImplementation(() => ({
    chat: vi.fn(),
  })),
}));

describe("LLM Client", () => {
  describe("createClient", () => {
    it("should create a client with default options", () => {
      const client = createClient();

      expect(client).toHaveProperty("chat");
      expect(client).toHaveProperty("chatStream");
    });

    it("should create a client with custom baseUrl", () => {
      const client = createClient({ baseUrl: "http://custom:11434" });

      expect(client).toHaveProperty("chat");
      expect(client).toHaveProperty("chatStream");
    });
  });

  describe("chat", () => {
    it("should send chat messages and return response", async () => {
      const mockResponse = { message: { content: "Hello, how can I help?" } };
      const { Ollama } = await import("ollama");
      const mockChat = vi.fn().mockResolvedValue(mockResponse);
      (Ollama as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        chat: mockChat,
      }));

      const client = createClient();
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello" },
      ];
      const options: ChatOptions = { model: "llama2" };

      const result = await client.chat(messages, options);

      expect(result).toHaveProperty("content");
      expect(mockChat).toHaveBeenCalled();
    });

    it("should use default model when not specified", async () => {
      const mockResponse = { message: { content: "Response" } };
      const { Ollama } = await import("ollama");
      const mockChat = vi.fn().mockResolvedValue(mockResponse);
      (Ollama as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        chat: mockChat,
      }));

      const client = createClient();
      const messages: ChatMessage[] = [{ role: "user", content: "Test" }];

      await client.chat(messages);

      expect(mockChat).toHaveBeenCalled();
    });

    it("should handle empty content response", async () => {
      const mockResponse = { message: { content: "" } };
      const { Ollama } = await import("ollama");
      const mockChat = vi.fn().mockResolvedValue(mockResponse);
      (Ollama as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        chat: mockChat,
      }));

      const client = createClient();
      const result = await client.chat([{ role: "user", content: "Hi" }]);

      expect(result.content).toBe("");
    });

    it("should handle null message content", async () => {
      const mockResponse = { message: { content: null } };
      const { Ollama } = await import("ollama");
      const mockChat = vi.fn().mockResolvedValue(mockResponse);
      (Ollama as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        chat: mockChat,
      }));

      const client = createClient();
      const result = await client.chat([{ role: "user", content: "Hi" }]);

      expect(result.content).toBe("");
    });
  });

  describe("chatStream", () => {
    it("should return an async generator for streaming", async () => {
      const mockStream = {
        [Symbol.asyncIterator]: vi.fn(),
      };
      const { Ollama } = await import("ollama");
      const mockChat = vi.fn().mockResolvedValue(mockStream);
      (Ollama as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        chat: mockChat,
      }));

      const client = createClient();
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];

      const result = await client.chatStream(messages);

      expect(result).toBeDefined();
      expect(typeof result[Symbol.asyncIterator]).toBe("function");
    });
  });
});
