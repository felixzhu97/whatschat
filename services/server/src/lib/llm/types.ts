export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatOptions {
  model?: string;
}

export interface ChatResult {
  content: string;
}

export interface LlmClientOptions {
  baseUrl?: string;
}
