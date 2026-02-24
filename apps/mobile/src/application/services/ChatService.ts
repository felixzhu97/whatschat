import { apiClient } from '@/src/infrastructure/api/client';
import { Chat, ChatEntity, ChatType } from '@/src/domain/entities';

interface ServerChat {
  id: string;
  name?: string | null;
  type?: string;
  avatar?: string | null;
  isArchived?: boolean;
  isMuted?: boolean;
  participants?: {
    id: string;
    userId?: string;
    user?: { id: string; username?: string; avatar?: string | null };
    username?: string;
    avatar?: string | null;
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
    sender?: { id: string; username?: string; avatar?: string | null };
  } | null;
  updatedAt: string;
}

function mapServerChat(c: ServerChat): Chat {
  const updatedAt = c.updatedAt ? new Date(c.updatedAt) : new Date();
  return new ChatEntity({
    id: c.id,
    name: c.name ?? 'Chat',
    type: c.type === 'GROUP' ? ChatType.Group : ChatType.Individual,
    participantIds: c.participants?.map((p) => p.userId ?? p.user?.id ?? p.id) ?? [],
    groupImage: c.avatar ?? undefined,
    lastMessageContent: c.lastMessage?.content,
    lastMessageTime: c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt) : undefined,
    lastMessageSender: c.lastMessage?.sender?.username,
    unreadCount: 0,
    isMuted: c.isMuted ?? false,
    isPinned: false,
    isArchived: c.isArchived ?? false,
    adminIds: [],
    createdAt: updatedAt,
    updatedAt,
  });
}

export class ChatService {
  async getChats(): Promise<Chat[]> {
    const { data } = await apiClient.get<{ success: boolean; data: unknown[] }>('/chats');
    if (!data.success || !Array.isArray(data.data)) return [];
    return (data.data as ServerChat[]).map(mapServerChat);
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: unknown }>(`/chats/${chatId}`);
      if (!data.success || !data.data) return null;
      return mapServerChat(data.data as ServerChat);
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

