import { apiClient } from '@/src/infrastructure/api/client';
import { Message, MessageEntity, MessageType, MessageStatus } from '@/src/domain/entities';

const SERVER_TYPE_MAP: Record<string, MessageType> = {
  TEXT: MessageType.Text,
  IMAGE: MessageType.Image,
  VIDEO: MessageType.Video,
  AUDIO: MessageType.Audio,
  FILE: MessageType.File,
  LOCATION: MessageType.Location,
  CONTACT: MessageType.Contact,
};

function mapServerMessage(m: {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender?: { id: string; username: string; avatar?: string };
}): Message {
  return new MessageEntity({
    id: m.id,
    chatId: m.chatId,
    senderId: m.senderId,
    senderName: m.sender?.username ?? '',
    senderAvatar: m.sender?.avatar,
    content: m.content,
    type: SERVER_TYPE_MAP[m.type] ?? MessageType.Text,
    status: MessageStatus.Sent,
    timestamp: new Date(m.createdAt),
    updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
    isForwarded: false,
    forwardedFrom: [],
  });
}

export function mapServerMessagePayload(p: Record<string, unknown>): Message {
  return mapServerMessage({
    id: p.id as string,
    chatId: p.chatId as string,
    senderId: p.senderId as string,
    type: (p.type as string) ?? 'TEXT',
    content: (p.content as string) ?? '',
    createdAt: (p.createdAt as string) ?? new Date().toISOString(),
    updatedAt: p.updatedAt as string | undefined,
    sender: p.sender as { id: string; username: string; avatar?: string } | undefined,
  });
}

export class MessageService {
  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await apiClient.get<{ success: boolean; data: unknown[] }>(
      `/messages/${chatId}`,
      { params: { page: 1, limit: 50 } }
    );
    if (!data.success || !Array.isArray(data.data)) return [];
    return data.data.map((m) => mapServerMessage(m as Parameters<typeof mapServerMessage>[0]));
  }

  async sendMessage(chatId: string, content: string, type: string = 'TEXT'): Promise<Message> {
    const { data } = await apiClient.post<{ success: boolean; data: unknown }>('/messages', {
      chatId,
      content,
      type,
    });
    if (!data.success || !data.data) throw new Error('Send failed');
    return mapServerMessagePayload(data.data as Record<string, unknown>);
  }
}

export const messageService = new MessageService();
