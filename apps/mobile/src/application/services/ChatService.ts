import { Chat } from '@/src/domain/entities';

export class ChatService {
  async getChats(): Promise<Chat[]> {
    // TODO: Implement API call
    return [];
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    // TODO: Implement API call
    return null;
  }

  async createChat(chat: Chat): Promise<Chat> {
    // TODO: Implement API call
    return chat;
  }

  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  async deleteChat(chatId: string): Promise<void> {
    // TODO: Implement API call
  }
}

