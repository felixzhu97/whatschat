import type { Message } from '../entities';

export interface IMessageRepository {
  getMessages(chatId: string): Promise<Message[]>;
  sendMessage(chatId: string, content: string, type?: string): Promise<Message>;
}
