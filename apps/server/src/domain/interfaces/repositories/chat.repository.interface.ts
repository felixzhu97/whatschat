import { Chat } from "../../entities/chat.entity";

export interface IChatRepository {
  findById(id: string): Promise<Chat | null>;
  findByUserId(userId: string): Promise<Chat[]>;
  create(chat: Omit<Chat, "id" | "createdAt" | "updatedAt">): Promise<Chat>;
  update(id: string, data: Partial<Chat>): Promise<Chat>;
  delete(id: string): Promise<void>;
}

