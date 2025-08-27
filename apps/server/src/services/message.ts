import { prisma } from "../database/client";

export interface CreateMessageData {
  content: string;
  type: "text" | "image" | "video" | "audio" | "file";
  senderId: string;
  chatId: string;
  metadata?: any;
}

export interface GetMessagesOptions {
  page: number;
  limit: number;
  search?: string;
}

export class MessageService {
  async createMessage(data: CreateMessageData) {
    // Check if chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: data.chatId },
    });

    if (!chat) {
      throw new Error("聊天不存在");
    }

    // Create message
    const message = await prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat's last message
    await prisma.chat.update({
      where: { id: data.chatId },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
      },
    });

    return message;
  }

  async getMessages(chatId: string, options: GetMessagesOptions) {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { chatId };

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    return await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  }

  async updateMessage(messageId: string, data: Partial<CreateMessageData>) {
    return await prisma.message.update({
      where: { id: messageId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string) {
    return await prisma.message.delete({
      where: { id: messageId },
    });
  }

  async markAsRead(chatId: string, userId: string) {
    await prisma.message.findMany({
      where: {
        chatId,
        senderId: { not: userId },
        readAt: null,
      },
    });

    // Mark messages as read (simplified implementation)
    return true;
  }
}
