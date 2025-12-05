import { Contact } from "../../entities/contact.entity";
import { Message } from "../../entities/message.entity";

export interface IChatsService {
  getChats(): Promise<Contact[]>;
  getChatById(chatId: string): Promise<Contact | null>;
  createChat(data: {
    participantIds: string[];
    type: "private" | "group";
    name?: string;
  }): Promise<Contact>;
  getChatMessages(
    chatId: string,
    params?: { page?: number; limit?: number }
  ): Promise<Message[]>;
  sendMessage(
    chatId: string,
    messageData: {
      content: string;
      type?: "text" | "image" | "video" | "audio" | "file";
      replyToMessageId?: string;
    }
  ): Promise<Message>;
  markMessageAsRead(chatId: string, messageId: string): Promise<void>;
}

