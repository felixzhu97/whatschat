import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";

export interface CreateChatData {
  type: "PRIVATE" | "GROUP";
  name?: string;
  avatar?: string;
  participantIds: string[];
}

export interface UpdateChatData {
  name?: string;
  avatar?: string;
}

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChats(userId: string) {
    const chatParticipants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    isOnline: true,
                    status: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: "desc",
        },
      },
    });

    return chatParticipants.map((cp) => ({
      id: cp.chat.id,
      type: cp.chat.type,
      name: cp.chat.name,
      avatar: cp.chat.avatar,
      isArchived: cp.isArchived,
      isMuted: cp.isMuted,
      participants: cp.chat.participants.map((p) => ({
        id: p.user.id,
        username: p.user.username,
        avatar: p.user.avatar,
        isOnline: p.user.isOnline,
        status: p.user.status,
      })),
      lastMessage: cp.chat.messages[0] || null,
      updatedAt: cp.chat.updatedAt,
    }));
  }

  async createChat(userId: string, data: CreateChatData) {
    const { type, name, avatar, participantIds } = data;

    // 验证参与者
    if (participantIds.length === 0) {
      throw new BadRequestException("至少需要一个参与者");
    }

    // 检查参与者是否存在
    const participants = await this.prisma.user.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    if (participants.length !== participantIds.length) {
      throw new BadRequestException("部分参与者不存在");
    }

    // 如果是私聊，检查是否已存在
    if (
      type === "PRIVATE" &&
      participantIds.length === 1 &&
      participantIds[0]
    ) {
      const existingChats = await this.prisma.chat.findMany({
        where: {
          type: "PRIVATE",
        },
        include: {
          participants: true,
        },
      });

      const targetUserId = participantIds[0];
      const existingChat = existingChats.find((chat) => {
        const participantUserIds = chat.participants.map((p) => p.userId);
        return (
          participantUserIds.includes(userId) &&
          targetUserId &&
          participantUserIds.includes(targetUserId) &&
          participantUserIds.length === 2
        );
      });

      if (existingChat) {
        return existingChat;
      }
    }

    // 创建聊天
    const chatData: any = {
      type,
      participants: {
        create: [{ userId }, ...participantIds.map((pid) => ({ userId: pid }))],
      },
    };

    if (name !== undefined) chatData.name = name;
    if (avatar !== undefined) chatData.avatar = avatar;

    const chat = await this.prisma.chat.create({
      data: chatData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return chat;
  }

  async getChatById(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true,
                status: true,
              },
            },
          },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    // 检查用户是否为参与者
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权访问此聊天");
    }

    return chat;
  }

  async updateChat(id: string, userId: string, data: UpdateChatData) {
    // 检查聊天是否存在
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    // 检查用户是否为参与者
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权修改此聊天");
    }

    // 只有群组可以修改名称和头像
    if (chat.type === "PRIVATE") {
      throw new BadRequestException("私聊不能修改名称和头像");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    return await this.prisma.chat.update({
      where: { id },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteChat(id: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundException("聊天不存在");
    }

    // 检查用户是否为参与者
    const isParticipant = chat.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException("无权删除此聊天");
    }

    await this.prisma.chat.delete({
      where: { id },
    });

    return { message: "聊天已删除" };
  }

  async archiveChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isArchived: true,
      },
    });

    return { message: "聊天已归档" };
  }

  async muteChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isMuted: true,
      },
    });

    return { message: "聊天已静音" };
  }

  async unmuteChat(id: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException("聊天不存在或无权访问");
    }

    await this.prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId: id,
          userId,
        },
      },
      data: {
        isMuted: false,
        muteUntil: null,
      },
    });

    return { message: "聊天已取消静音" };
  }
}
