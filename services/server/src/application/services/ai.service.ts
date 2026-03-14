import { Injectable } from '@nestjs/common';
import { createClient } from '@whatschat/llm';
import { ConfigService } from '@/infrastructure/config/config.service';

export interface AiChatInput {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  model?: string;
}

export interface AiChatOutput {
  content: string;
}

const MODERATE_SYSTEM = `You are a content moderator. Classify the user message as safe or unsafe.
If safe, reply with exactly: SAFE
If unsafe (violence, nudity, prohibited goods, hate speech, harassment), reply with: UNSAFE: followed by comma-separated categories from [violence, nude, prohibited, hate]. Example: UNSAFE:violence,hate
Reply with nothing else.`;

export interface ModerateTextResult {
  safe: boolean;
  categories: string[];
}

@Injectable()
export class AiService {
  async moderateText(text: string): Promise<ModerateTextResult> {
    if (!text || typeof text !== "string" || !text.trim()) {
      return { safe: true, categories: [] };
    }
    const cfg = ConfigService.loadConfig().ai;
    if (!cfg?.ollamaBaseUrl) {
      return { safe: true, categories: [] };
    }
    try {
      const client = createClient({ baseUrl: cfg.ollamaBaseUrl });
      const model = cfg.defaultModel ?? "llama2";
      const result = await client.chat(
        [
          { role: "system", content: MODERATE_SYSTEM },
          { role: "user", content: text.trim().slice(0, 2000) },
        ],
        { model }
      );
      const content = (result.content ?? "").trim().toUpperCase();
      if (content.startsWith("UNSAFE:")) {
        const rest = content.slice(7).trim();
        const categories = rest
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter((s) => ["violence", "nude", "prohibited", "hate"].includes(s));
        return { safe: false, categories };
      }
      return { safe: true, categories: [] };
    } catch {
      return { safe: true, categories: [] };
    }
  }

  async chat(input: AiChatInput): Promise<AiChatOutput> {
    const cfg = ConfigService.loadConfig().ai;
    const client = createClient({ baseUrl: cfg.ollamaBaseUrl });
    const model = input.model ?? cfg.defaultModel;
    const result = await client.chat(input.messages, { model });
    return { content: result.content };
  }

  async *chatStream(input: AiChatInput): AsyncGenerator<string> {
    const cfg = ConfigService.loadConfig().ai;
    const client = createClient({ baseUrl: cfg.ollamaBaseUrl });
    const model = input.model ?? cfg.defaultModel;
    const stream = await client.chatStream(input.messages, { model });
    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
