import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "../infrastructure/config/config.service";
import logger from "../utils/logger";

// 创建独立的Prisma客户端实例用于seed脚本
const prisma = new PrismaClient({
  log:
    process.env["NODE_ENV"] === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// 加载配置
const config = ConfigService.loadConfig();

export async function main() {
  logger.info("开始数据库种子...");

  try {
    // 清理现有数据（开发环境）
    if (config.server.isDevelopment) {
      logger.info("清理现有数据...");
      await prisma.messageReaction.deleteMany();
      await prisma.messageRead.deleteMany();
      await prisma.message.deleteMany();
      await prisma.chatParticipant.deleteMany();
      await prisma.chat.deleteMany();
      await prisma.callParticipant.deleteMany();
      await prisma.call.deleteMany();
      await prisma.statusView.deleteMany();
      await prisma.status.deleteMany();
      await prisma.groupParticipant.deleteMany();
      await prisma.group.deleteMany();
      await prisma.contact.deleteMany();
      await prisma.blockedUser.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.fileUpload.deleteMany();
      await prisma.userSettings.deleteMany();
      await prisma.user.deleteMany();
    }

    // 创建测试用户
    const saltRounds = config.security.bcrypt.saltRounds;
    const hashedPassword = await bcrypt.hash("123456", saltRounds);

    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: "admin",
          email: "admin@whatschat.com",
          phone: "+86 138 0000 0001",
          password: hashedPassword,
          avatar: "/placeholder.svg?height=40&width=40&text=A",
          status: "我是管理员",
          isOnline: true,
        },
      }),
      prisma.user.create({
        data: {
          username: "alice",
          email: "alice@example.com",
          phone: "+86 138 0000 0002",
          password: hashedPassword,
          avatar: "/placeholder.svg?height=40&width=40&text=A",
          status: "嗨，我正在使用 WhatsChat！",
          isOnline: true,
        },
      }),
      prisma.user.create({
        data: {
          username: "bob",
          email: "bob@example.com",
          phone: "+86 138 0000 0003",
          password: hashedPassword,
          avatar: "/placeholder.svg?height=40&width=40&text=B",
          status: "忙碌中...",
          isOnline: false,
        },
      }),
      prisma.user.create({
        data: {
          username: "charlie",
          email: "charlie@example.com",
          phone: "+86 138 0000 0004",
          password: hashedPassword,
          avatar: "/placeholder.svg?height=40&width=40&text=C",
          status: "在线",
          isOnline: true,
        },
      }),
    ]);

    logger.info(`创建了 ${users.length} 个用户`);

    // 为每个用户创建默认设置
    for (const user of users) {
      await prisma.userSettings.create({
        data: {
          userId: user.id,
        },
      });
    }

    logger.info("创建了用户设置");

    // 创建私人聊天
    const privateChat = await prisma.chat.create({
      data: {
        type: "PRIVATE",
        participants: {
          create: [
            {
              userId: users[0].id,
              role: "MEMBER",
            },
            {
              userId: users[1].id,
              role: "MEMBER",
            },
          ],
        },
      },
    });

    logger.info("创建了私人聊天");

    // 创建群组聊天
    const groupChat = await prisma.chat.create({
      data: {
        type: "GROUP",
        name: "开发团队",
        avatar: "/placeholder.svg?height=40&width=40&text=团队",
        participants: {
          create: [
            {
              userId: users[0].id,
              role: "ADMIN",
            },
            {
              userId: users[1].id,
              role: "MEMBER",
            },
            {
              userId: users[2].id,
              role: "MEMBER",
            },
            {
              userId: users[3].id,
              role: "MEMBER",
            },
          ],
        },
      },
    });

    logger.info("创建了群组聊天");

    // 创建一些测试消息
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          chatId: privateChat.id,
          senderId: users[0].id,
          type: "TEXT",
          content: "你好！欢迎使用 WhatsChat！",
        },
      }),
      prisma.message.create({
        data: {
          chatId: privateChat.id,
          senderId: users[1].id,
          type: "TEXT",
          content: "谢谢！这个应用看起来很棒！",
        },
      }),
      prisma.message.create({
        data: {
          chatId: groupChat.id,
          senderId: users[0].id,
          type: "TEXT",
          content: "欢迎大家加入开发团队群组！",
        },
      }),
      prisma.message.create({
        data: {
          chatId: groupChat.id,
          senderId: users[1].id,
          type: "TEXT",
          content: "很高兴能参与这个项目！",
        },
      }),
    ]);

    logger.info(`创建了 ${messages.length} 条消息`);

    // 创建联系人关系
    await Promise.all([
      prisma.contact.create({
        data: {
          ownerId: users[0].id,
          name: "Alice",
          phone: users[1].phone,
          email: users[1].email,
          avatar: users[1].avatar,
        },
      }),
      prisma.contact.create({
        data: {
          ownerId: users[1].id,
          name: "Admin",
          phone: users[0].phone,
          email: users[0].email,
          avatar: users[0].avatar,
        },
      }),
    ]);

    logger.info("创建了联系人关系");

    // 创建一些状态更新
    const statusExpiresAt = new Date();
    statusExpiresAt.setHours(statusExpiresAt.getHours() + 24); // 24小时后过期

    await Promise.all([
      prisma.status.create({
        data: {
          userId: users[0].id,
          type: "TEXT",
          content: "今天是美好的一天！",
          expiresAt: statusExpiresAt,
        },
      }),
      prisma.status.create({
        data: {
          userId: users[1].id,
          type: "TEXT",
          content: "正在开发新功能...",
          expiresAt: statusExpiresAt,
        },
      }),
    ]);

    logger.info("创建了状态更新");

    logger.info("数据库种子完成！");
    logger.info("测试账户:");
    logger.info("- admin@whatschat.com / 123456");
    logger.info("- alice@example.com / 123456");
    logger.info("- bob@example.com / 123456");
    logger.info("- charlie@example.com / 123456");
  } catch (error) {
    logger.error("数据库种子失败:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
