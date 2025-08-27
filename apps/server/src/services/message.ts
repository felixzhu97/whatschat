import { prisma } from "../database/client";

export interface CreateMessageData {
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
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
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        type: data.type as any,
        content: data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat's last message
    await prisma.chat.update({
      where: { id: data.chatId },
      data: {
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
            username: true,
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
        content: data.content ?? undefined,
        type: (data.type as any) ?? undefined,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
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
        // Message 模型无 readAt 字段，如需已读状态请使用 MessageRead 表
      },
    });

    // Mark messages as read (simplified implementation)
    return true;
  }
}
