import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "../../infrastructure/config/config.service";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import logger from "@/shared/utils/logger";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// 在线用户管理
const onlineUsers = new Map<string, string>(); // userId -> socketId

@WebSocketGateway({
  cors: {
    origin: process.env["CORS_ORIGIN"]?.split(",") || ["http://localhost:3000"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const config = ConfigService.loadConfig();
      const decoded = this.jwtService.verify(token, {
        secret: config.jwt.secret,
      }) as any;

      const user = await this.prisma.user.findUnique({
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
        socket.disconnect();
        return;
      }

      socket.userId = user.id;
      socket.user = user;

      // 添加到在线用户列表
      onlineUsers.set(user.id, socket.id);

      // 更新用户在线状态
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });

      // 加入用户房间
      socket.join(`user:${user.id}`);

      // 通知其他用户该用户上线
      socket.broadcast.emit("user:online", { userId: user.id });

      // 发送连接确认
      socket.emit("user:connect", { userId: user.id });

      logger.info(`用户连接: ${user.username} (${user.id})`);
    } catch (error) {
      logger.error(`Socket认证失败: ${error}`);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      // 从在线用户列表移除
      onlineUsers.delete(socket.userId);

      // 更新用户在线状态
      await this.prisma.user.update({
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
  }

  @SubscribeMessage("message:send")
  async handleMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      type: string;
      mediaUrl?: string;
      replyToMessageId?: string;
    }
  ) {
    try {
      const { chatId, content, type, mediaUrl, replyToMessageId } = data;

      if (!socket.userId) {
        socket.emit("error", { message: "未认证" });
        return;
      }

      // 验证用户是否为聊天参与者
      const participant = await this.prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: socket.userId,
          },
        },
      });

      if (!participant) {
        socket.emit("error", { message: "无权发送消息到此聊天" });
        return;
      }

      // 创建消息
      const message = await this.prisma.message.create({
        data: {
          chatId,
          senderId: socket.userId,
          type: type as any,
          content,
          ...(mediaUrl && { mediaUrl }),
          ...(replyToMessageId && { replyToMessageId }),
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
      const participants = await this.prisma.chatParticipant.findMany({
        where: { chatId },
        select: { userId: true },
      });

      // 发送消息给所有参与者
      participants.forEach(({ userId }: { userId: string }) => {
        const participantSocketId = onlineUsers.get(userId);
        if (participantSocketId && participantSocketId !== socket.id) {
          this.server.to(participantSocketId).emit("message:received", message);
        }
      });

      // 确认消息发送成功
      socket.emit("message:sent", message);

      logger.info(`消息发送: ${socket.userId} -> ${chatId}`);
    } catch (error) {
      logger.error(`消息发送错误: ${error}`);
      socket.emit("error", { message: "消息发送失败" });
    }
  }

  @SubscribeMessage("message:read")
  async handleMessageRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; chatId: string }
  ) {
    try {
      const { messageId, chatId } = data;

      if (!socket.userId) {
        return;
      }

      // 标记消息为已读
      await this.prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: socket.userId,
          },
        },
        update: {},
        create: {
          messageId,
          userId: socket.userId,
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
  }

  @SubscribeMessage("message:typing")
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean }
  ) {
    const { chatId, isTyping } = data;
    socket.to(`chat:${chatId}`).emit("message:typing", {
      chatId,
      userId: socket.userId,
      isTyping,
    });
  }

  @SubscribeMessage("message:reaction")
  async handleReaction(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string }
  ) {
    try {
      const { messageId, emoji } = data;

      if (!socket.userId) {
        return;
      }

      // 添加或更新反应
      const reaction = await this.prisma.messageReaction.upsert({
        where: {
          messageId_userId_emoji: {
            messageId,
            userId: socket.userId,
            emoji,
          },
        },
        update: {},
        create: {
          messageId,
          userId: socket.userId,
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
  }

  @SubscribeMessage("call:incoming")
  handleCallIncoming(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string }
  ) {
    const { targetUserId } = data;
    const targetSocketId = onlineUsers.get(targetUserId);

    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:incoming", {
        ...data,
        initiatorId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:answer")
  handleCallAnswer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; initiatorId: string }
  ) {
    const { callId, initiatorId } = data;
    const initiatorSocketId = onlineUsers.get(initiatorId);

    if (initiatorSocketId) {
      this.server.to(initiatorSocketId).emit("call:answer", {
        callId,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:reject")
  handleCallReject(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; initiatorId: string }
  ) {
    const { callId, initiatorId } = data;
    const initiatorSocketId = onlineUsers.get(initiatorId);

    if (initiatorSocketId) {
      this.server.to(initiatorSocketId).emit("call:reject", {
        callId,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:end")
  handleCallEnd(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; participants: string[] }
  ) {
    const { callId, participants } = data;

    participants.forEach((userId: string) => {
      const participantSocketId = onlineUsers.get(userId);
      if (participantSocketId && participantSocketId !== socket.id) {
        this.server.to(participantSocketId).emit("call:end", {
          callId,
          userId: socket.userId,
        });
      }
    });
  }

  @SubscribeMessage("call:ice-candidate")
  handleIceCandidate(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { callId: string; targetUserId: string; candidate: any }
  ) {
    const { callId, targetUserId, candidate } = data;
    const targetSocketId = onlineUsers.get(targetUserId);

    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:ice-candidate", {
        callId,
        candidate,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:offer")
  handleCallOffer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; targetUserId: string; offer: any }
  ) {
    const { callId, targetUserId, offer } = data;
    const targetSocketId = onlineUsers.get(targetUserId);

    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:offer", {
        callId,
        offer,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("call:webrtc-answer")
  handleWebRTCAnswer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { callId: string; targetUserId: string; answer: any }
  ) {
    const { callId, targetUserId, answer } = data;
    const targetSocketId = onlineUsers.get(targetUserId);

    if (targetSocketId) {
      this.server.to(targetSocketId).emit("call:webrtc-answer", {
        callId,
        answer,
        userId: socket.userId,
      });
    }
  }

  @SubscribeMessage("status:create")
  async handleStatusCreate(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      content?: string;
      type: string;
      mediaUrl?: string;
      duration?: number;
    }
  ) {
    try {
      const { content, type, mediaUrl, duration } = data;

      if (!socket.userId) {
        return;
      }

      // 创建状态
      const status = await this.prisma.status.create({
        data: {
          userId: socket.userId,
          content: content || "", // content 是必需字段
          type: type as any,
          ...(mediaUrl && { mediaUrl }),
          ...(duration && { duration }),
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

      socket.broadcast.emit("status:create", status);
    } catch (error) {
      logger.error(`状态创建错误: ${error}`);
    }
  }

  @SubscribeMessage("user:status")
  async handleUserStatus(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { status: string }
  ) {
    try {
      const { status } = data;

      if (!socket.userId) {
        return;
      }

      await this.prisma.user.update({
        where: { id: socket.userId },
        data: { status },
      });

      socket.broadcast.emit("user:status", {
        userId: socket.userId,
        status,
      });
    } catch (error) {
      logger.error(`用户状态更新错误: ${error}`);
    }
  }
}
