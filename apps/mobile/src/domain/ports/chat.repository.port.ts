import type { Chat } from '../entities';

export interface IChatRepository {
  getChats(): Promise<Chat[]>;
  getChatById(chatId: string): Promise<Chat | null>;
}
