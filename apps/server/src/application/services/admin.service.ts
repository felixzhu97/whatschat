import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infrastructure/database/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalChats,
      totalGroups,
      totalMessages,
      onlineUsers,
      todayMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.chat.count(),
      this.prisma.group.count(),
      this.prisma.message.count(),
      this.prisma.user.count({ where: { isOnline: true } }),
      this.prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const messagesByType = await this.prisma.message.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
      },
    });

    return {
      totalUsers,
      totalChats,
      totalGroups,
      totalMessages,
      onlineUsers,
      todayMessages,
      messagesByType: messagesByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentUsers,
    };
  }

  async getAllChats(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        {
          participants: {
            some: {
              user: {
                OR: [
                  { username: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  avatar: true,
                  isOnline: true,
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
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.chat.count({ where }),
    ]);

    return {
      data: chats.map((chat) => ({
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatar: chat.avatar,
        participants: chat.participants.map((p) => ({
          ...p.user,
          role: p.role,
        })),
        lastMessage: chat.messages[0] || null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllGroups(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          creator: {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  isOnline: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      data: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar,
        creator: g.creator,
        participants: g.participants.map((p) => ({
          ...p.user,
          role: p.role,
        })),
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChatMessages(chatId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.message.count({ where: { chatId } }),
    ]);

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteMessageAsAdmin(messageId: string) {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: "[已删除]",
        isDeleted: true,
      },
    });
    return { success: true };
  }
}
