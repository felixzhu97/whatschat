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

@Injectable()
export class AiService {
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
