import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import config from "@/config";
import prisma from "@/database/client";
import { redisUtils } from "@/database/redis";
import logger from "@/utils/logger";
import { JwtPayload } from "@/types";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// 在线用户管理
const onlineUsers = new Map<string, string>(); // userId -> socketId

// 验证Socket连接
const authenticateSocket = async (
  socket: AuthenticatedSocket,
  token: string
) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
      },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    socket.userId = user.id;
    socket.user = user;

    // 添加到在线用户列表
    onlineUsers.set(user.id, socket.id);

    // 更新用户在线状态
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });

    // 通知其他用户该用户上线
    socket.broadcast.emit("user:online", { userId: user.id });

    logger.info(`用户连接: ${user.username} (${user.id})`);

    return user;
  } catch (error) {
    logger.error(`Socket认证失败: ${error}`);
    throw error;
  }
};

// 处理用户断开连接
const handleDisconnect = async (socket: AuthenticatedSocket) => {
  if (socket.userId) {
    // 从在线用户列表移除
    onlineUsers.delete(socket.userId);

    // 更新用户在线状态
    await prisma.user.update({
      where: { id: socket.userId },
      data: {
        isOnline: false,
        lastSeen: new Date(),
      },
    });

    // 通知其他用户该用户下线
    socket.broadcast.emit("user:offline", { userId: socket.userId });

    logger.info(`用户断开连接: ${socket.user?.username} (${socket.userId})`);
  }
};

// 设置Socket.IO处理器
export const setupSocketHandlers = (io: Server) => {
  // 认证中间件
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("认证令牌缺失"));
      }

      await authenticateSocket(socket, token);
      next();
    } catch (error) {
      next(new Error("认证失败"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info(`Socket连接: ${socket.id}`);

    // 加入用户房间
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // 处理用户连接事件
    socket.emit("user:connect", { userId: socket.userId });

    // 处理消息发送
    socket.on("message:send", async (data) => {
      try {
        const { chatId, content, type, mediaUrl, replyToMessageId } = data;

        // 验证用户是否为聊天参与者
        const participant = await prisma.chatParticipant.findUnique({
          where: {
            chatId_userId: {
              chatId,
              userId: socket.userId!,
            },
          },
        });

        if (!participant) {
          socket.emit("error", { message: "无权发送消息到此聊天" });
          return;
        }

        // 创建消息
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: socket.userId!,
            type,
            content,
            mediaUrl,
            replyToMessageId,
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

        // 获取聊天参与者
        const participants = await prisma.chatParticipant.findMany({
          where: { chatId },
          select: { userId: true },
        });

        // 发送消息给所有参与者
        participants.forEach(({ userId }) => {
          const participantSocketId = onlineUsers.get(userId);
          if (participantSocketId && participantSocketId !== socket.id) {
            io.to(participantSocketId).emit("message:received", message);
          }
        });

        // 确认消息发送成功
        socket.emit("message:sent", message);

        logger.info(`消息发送: ${socket.userId} -> ${chatId}`);
      } catch (error) {
        logger.error(`消息发送错误: ${error}`);
        socket.emit("error", { message: "消息发送失败" });
      }
    });

    // 处理消息已读
    socket.on("message:read", async (data) => {
      try {
        const { messageId, chatId } = data;

        // 标记消息为已读
        await prisma.messageRead.upsert({
          where: {
            messageId_userId: {
              messageId,
              userId: socket.userId!,
            },
          },
          update: {},
          create: {
            messageId,
            userId: socket.userId!,
          },
        });

        // 通知其他参与者消息已读
        socket.to(`chat:${chatId}`).emit("message:read", {
          messageId,
          userId: socket.userId,
        });
      } catch (error) {
        logger.error(`消息已读错误: ${error}`);
      }
    });

    // 处理正在输入
    socket.on("message:typing", (data) => {
      const { chatId, isTyping } = data;
      socket.to(`chat:${chatId}`).emit("message:typing", {
        chatId,
        userId: socket.userId,
        isTyping,
      });
    });

    // 处理消息反应
    socket.on("message:reaction", async (data) => {
      try {
        const { messageId, emoji } = data;

        // 添加或更新反应
        const reaction = await prisma.messageReaction.upsert({
          where: {
            messageId_userId_emoji: {
              messageId,
              userId: socket.userId!,
              emoji,
            },
          },
          update: {},
          create: {
            messageId,
            userId: socket.userId!,
            emoji,
          },
        });

        // 通知其他用户
        socket.broadcast.emit("message:reaction", {
          messageId,
          reaction,
        });
      } catch (error) {
        logger.error(`消息反应错误: ${error}`);
      }
    });

    // 处理通话相关事件
    socket.on("call:incoming", (data) => {
      const { targetUserId, callType } = data;
      const targetSocketId = onlineUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("call:incoming", {
          ...data,
          initiatorId: socket.userId,
        });
      }
    });

    socket.on("call:answer", (data) => {
      const { callId, initiatorId } = data;
      const initiatorSocketId = onlineUsers.get(initiatorId);

      if (initiatorSocketId) {
        io.to(initiatorSocketId).emit("call:answer", {
          callId,
          userId: socket.userId,
        });
      }
    });

    socket.on("call:reject", (data) => {
      const { callId, initiatorId } = data;
      const initiatorSocketId = onlineUsers.get(initiatorId);

      if (initiatorSocketId) {
        io.to(initiatorSocketId).emit("call:reject", {
          callId,
          userId: socket.userId,
        });
      }
    });

    socket.on("call:end", (data) => {
      const { callId, participants } = data;

      participants.forEach((userId: string) => {
        const participantSocketId = onlineUsers.get(userId);
        if (participantSocketId && participantSocketId !== socket.id) {
          io.to(participantSocketId).emit("call:end", {
            callId,
            userId: socket.userId,
          });
        }
      });
    });

    // 处理WebRTC信令
    socket.on("call:ice-candidate", (data) => {
      const { callId, targetUserId, candidate } = data;
      const targetSocketId = onlineUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ice-candidate", {
          callId,
          candidate,
          userId: socket.userId,
        });
      }
    });

    socket.on("call:offer", (data) => {
      const { callId, targetUserId, offer } = data;
      const targetSocketId = onlineUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("call:offer", {
          callId,
          offer,
          userId: socket.userId,
        });
      }
    });

    socket.on("call:webrtc-answer", (data) => {
      const { callId, targetUserId, answer } = data;
      const targetSocketId = onlineUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit("call:webrtc-answer", {
          callId,
          answer,
          userId: socket.userId,
        });
      }
    });

    // 处理状态相关事件
    socket.on("status:create", async (data) => {
      try {
        const { content, type, mediaUrl, duration } = data;

        // 创建状态
        const status = await prisma.status.create({
          data: {
            userId: socket.userId!,
            content,
            type,
            mediaUrl,
            duration,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });

        // 通知联系人
        const contacts = await prisma.contact.findMany({
          where: { ownerId: socket.userId! },
          select: { phone: true },
        });

        contacts.forEach((contact) => {
          // 这里可以添加推送通知逻辑
        });

        socket.broadcast.emit("status:create", status);
      } catch (error) {
        logger.error(`状态创建错误: ${error}`);
      }
    });

    // 处理用户状态更新
    socket.on("user:status", async (data) => {
      try {
        const { status } = data;

        await prisma.user.update({
          where: { id: socket.userId! },
          data: { status },
        });

        socket.broadcast.emit("user:status", {
          userId: socket.userId,
          status,
        });
      } catch (error) {
        logger.error(`用户状态更新错误: ${error}`);
      }
    });

    // 处理断开连接
    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });

  logger.info("Socket.IO处理器设置完成");
};

// 获取在线用户数量
export const getOnlineUserCount = () => {
  return onlineUsers.size;
};

// 检查用户是否在线
export const isUserOnline = (userId: string) => {
  return onlineUsers.has(userId);
};

// 获取用户的Socket ID
export const getUserSocketId = (userId: string) => {
  return onlineUsers.get(userId);
};

// 向特定用户发送消息
export const sendToUser = (
  io: Server,
  userId: string,
  event: string,
  data: any
) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

// 向多个用户发送消息
export const sendToUsers = (
  io: Server,
  userIds: string[],
  event: string,
  data: any
) => {
  userIds.forEach((userId) => {
    sendToUser(io, userId, event, data);
  });
};
