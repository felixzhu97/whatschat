import { Ollama } from 'ollama';
import type { ChatMessage, ChatOptions, ChatResult, LlmClientOptions } from './types';

export function createClient(options: LlmClientOptions = {}) {
  const host = options.baseUrl ?? 'http://localhost:11434';
  const client = new Ollama({ host });

  async function chat(
    messages: ChatMessage[],
    opts?: ChatOptions
  ): Promise<ChatResult> {
    const response = await client.chat({
      model: opts?.model ?? 'qwen3-coder:30b',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    });
    const content = response.message?.content ?? '';
    return { content };
  }

  async function chatStream(
    messages: ChatMessage[],
    opts?: ChatOptions
  ): Promise<AsyncGenerator<string>> {
    const stream = await client.chat({
      model: opts?.model ?? 'qwen3-coder:30b',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });
    async function* gen() {
      for await (const chunk of stream) {
        const text = chunk.message?.content;
        if (text) yield text;
      }
    }
    return gen();
  }

  return { chat, chatStream };
}
