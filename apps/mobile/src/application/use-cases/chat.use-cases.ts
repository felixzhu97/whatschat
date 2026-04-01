import type { IChatRepository } from '@/src/domain/ports/chat.repository.port';

export class ChatUseCases {
  constructor(private readonly chatRepository: IChatRepository) {}

  getChats() {
    return this.chatRepository.getChats();
  }

  getChatById(chatId: string) {
    return this.chatRepository.getChatById(chatId);
  }
}
