import { apiClient } from '@/src/infrastructure/api/client';
import { Chat, ChatEntity, ChatType } from '@/src/domain/entities';

function mapServerChat(c: { id: string; name?: string; type?: string; participants?: { userId: string }[] }): Chat {
  const now = new Date();
  return new ChatEntity({
    id: c.id,
    name: c.name ?? 'Chat',
    type: c.type === 'GROUP' ? ChatType.Group : ChatType.Individual,
    participantIds: c.participants?.map((p) => p.userId) ?? [],
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    adminIds: [],
    createdAt: now,
    updatedAt: now,
  });
}

export class ChatService {
  async getChats(): Promise<Chat[]> {
    const { data } = await apiClient.get<{ success: boolean; data: unknown[] }>('/chats');
    if (!data.success || !Array.isArray(data.data)) return [];
    return (data.data as Parameters<typeof mapServerChat>[0][]).map(mapServerChat);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: unknown }>(`/chats/${chatId}`);
      if (!data.success || !data.data) return null;
      return mapServerChat(data.data as Parameters<typeof mapServerChat>[0]);
    } catch {
      return null;
    }
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

export const chatService = new ChatService();

