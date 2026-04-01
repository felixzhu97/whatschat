import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import type { IChatRepository } from '@/src/domain/ports/chat.repository.port';
import type { Chat } from '@/src/domain/entities';
import { mapServerChatPayloadToChat, type ServerChatPayload } from '@/src/application/mappers/chat.mapper';

export class ChatRepositoryAdapter implements IChatRepository {
  constructor(private readonly http: IHttpClient) {}

  async getChats(): Promise<Chat[]> {
    const { data } = await this.http.get<{ success: boolean; data: unknown[] }>('/chats');
    if (!data.success || !Array.isArray(data.data)) return [];
    return (data.data as ServerChatPayload[]).map(mapServerChatPayloadToChat);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data } = await this.http.get<{ success: boolean; data: unknown }>(`/chats/${chatId}`);
      if (!data.success || !data.data) return null;
      return mapServerChatPayloadToChat(data.data as ServerChatPayload);
    } catch {
      return null;
    }
  }
}
