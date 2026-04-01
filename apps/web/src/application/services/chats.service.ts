import { IChatsService } from "../../domain/interfaces/services/chats.service.interface";
import { Contact } from "../../domain/entities/contact.entity";
import { Message } from "../../domain/entities/message.entity";
import { ChatApiAdapter } from "../../infrastructure/adapters/api/chat-api.adapter";
import { getAppComposition } from "../../infrastructure/composition-root";
import {
  type ApiChatRow,
  type ApiMessageRow,
  mapApiChatRowToContact,
  mapApiMessageRowToMessage,
  mapUnknownToContactCreate,
  mapUnknownToMessageCreate,
} from "../mappers/chats.mapper";

export class ChatsService implements IChatsService {
  constructor(private readonly chatApi: ChatApiAdapter) {}

  async getChats(): Promise<Contact[]> {
    try {
      const response = await this.chatApi.getChats();
      if (response.success && response.data) {
        const rows = response.data as unknown[];
        return rows.map((chat) => mapApiChatRowToContact(chat as ApiChatRow));
      }
      return [];
    } catch (error) {
      console.error("获取聊天列表失败:", error);
      return [];
    }
  }

  async getChatById(chatId: string): Promise<Contact | null> {
    try {
      const response = await this.chatApi.getChatById(chatId);
      if (response.success && response.data) {
        return mapUnknownToContactCreate(response.data);
      }
      return null;
    } catch (error) {
      console.error("获取聊天详情失败:", error);
      return null;
    }
  }

  async createChat(data: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<Contact> {
    try {
      const response = await this.chatApi.createChat(data);
      if (response.success && response.data) {
        return mapUnknownToContactCreate(response.data);
      }
      throw new Error("创建聊天失败");
    } catch (error) {
      console.error("创建聊天失败:", error);
      throw error;
    }
  }

  async getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<Message[]> {
    try {
      const response = await this.chatApi.getChatMessages(chatId, params);
      if (response.success && response.data) {
        const rows = response.data as unknown[];
        return rows.map((msg) => mapApiMessageRowToMessage(msg as ApiMessageRow));
      }
      return [];
    } catch (error) {
      console.error("获取聊天消息失败:", error);
      return [];
    }
  }

  async sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
      mediaUrl?: string;
    }
  ): Promise<Message> {
    try {
      const response = await this.chatApi.sendMessage(chatId, messageData);
      if (response.success && response.data) {
        return mapUnknownToMessageCreate(response.data);
      }
      throw new Error("发送消息失败");
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }

  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    try {
      await this.chatApi.markMessageAsRead(chatId, messageId);
    } catch (error) {
      console.error("标记消息为已读失败:", error);
      throw error;
    }
  }
}

let chatsServiceInstance: ChatsService | null = null;

export const getChatsService = (): IChatsService => {
  if (!chatsServiceInstance) {
    chatsServiceInstance = new ChatsService(getAppComposition().chatApi);
  }
  return chatsServiceInstance;
};
