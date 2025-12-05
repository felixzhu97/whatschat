import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateMessageData {
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  senderId: string;
  chatId: string;
  metadata?: any;
}

export interface GetMessagesOptions {
  page: number;
  limit: number;
  search?: string;
}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: CreateMessageData) {
    // 检查聊天是否存在
    const chat = await this.prisma.chat.findUnique({
      where: { id: data.chatId },
    });

    if (!chat) {
      throw new NotFoundException('聊天不存在');
    }

    // 创建消息
    const message = await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        senderId: data.senderId,
        type: data.type as any,
        content: data.content,
        ...(data.metadata && { metadata: data.metadata }),
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

    // 更新聊天的最后消息时间
    await this.prisma.chat.update({
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
        mode: 'insensitive',
      };
    }

    return await this.prisma.message.findMany({
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async updateMessage(
    messageId: string,
    data: Partial<CreateMessageData>,
  ) {
    const updateData: any = {
      updatedAt: new Date(),
    };
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.type !== undefined) {
      updateData.type = data.type as any;
    }
    return await this.prisma.message.update({
      where: { id: messageId },
      data: updateData,
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
    return await this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}

