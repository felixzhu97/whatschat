import type { IMessageRepository } from '@/src/domain/ports/message.repository.port';

export class MessageUseCases {
  constructor(private readonly messageRepository: IMessageRepository) {}

  getMessages(chatId: string) {
    return this.messageRepository.getMessages(chatId);
  }

  sendMessage(chatId: string, content: string, type?: string) {
    return this.messageRepository.sendMessage(chatId, content, type);
  }
}
