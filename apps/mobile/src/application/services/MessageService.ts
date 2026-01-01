import { Message } from '@/src/domain/entities';

export class MessageService {
  async getMessages(chatId: string): Promise<Message[]> {
    // TODO: Implement API call
    return [];
  }

  async sendMessage(message: Message): Promise<Message> {
    // TODO: Implement API call
    return message;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<Message> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }

  async deleteMessage(messageId: string): Promise<void> {
    // TODO: Implement API call
  }
}

