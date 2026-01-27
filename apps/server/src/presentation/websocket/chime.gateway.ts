import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../infrastructure/config/config.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ChimeService } from '../../infrastructure/services/chime/chime.service';
import type { CreateMeetingOptions } from '@whatschat/aws-integration';
import logger from '@/shared/utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  namespace: '/chime',
  cors: {
    origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly chimeService: ChimeService
  ) {
    this.config = ConfigService.loadConfig();
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const token =
        (socket.handshake.auth as any)?.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token, {
        secret: this.config.jwt.secret,
      }) as any;

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      });

      if (!user) {
        socket.disconnect();
        return;
      }

      socket.userId = user.id;
      socket.user = user;

      socket.join(`user:${user.id}`);

      socket.emit('chime:connected', { userId: user.id });

      logger.info(`Chime user connected: ${user.username} (${user.id})`);
    } catch (error) {
      logger.error(`Chime socket authentication failed: ${error}`);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      logger.info(`Chime user disconnected: ${socket.user?.username} (${socket.userId})`);
    }
  }

  @SubscribeMessage('chime:create-meeting')
  async handleCreateMeeting(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      externalMeetingId?: string;
      mediaRegion?: string;
    }
  ) {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const meetingOptions: Partial<CreateMeetingOptions> = {};
      if (data.externalMeetingId) {
        meetingOptions.externalMeetingId = data.externalMeetingId;
      }
      const mediaRegion = data.mediaRegion || this.config.chime.mediaRegion;
      if (mediaRegion) {
        meetingOptions.mediaRegion = mediaRegion;
      }
      const meeting = await this.chimeService.createMeeting(socket.userId, meetingOptions);

      socket.emit('chime:meeting-created', meeting);
      logger.info(`Meeting created: ${meeting.meetingId} by user: ${socket.userId}`);
    } catch (error) {
      logger.error(`Failed to create meeting: ${error}`);
      socket.emit('error', { message: 'Failed to create meeting' });
    }
  }

  @SubscribeMessage('chime:join-meeting')
  async handleJoinMeeting(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      meetingId: string;
    }
  ) {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const meeting = await this.chimeService.getMeeting(data.meetingId);
      if (!meeting) {
        socket.emit('error', { message: 'Meeting not found' });
        return;
      }

      const attendee = await this.chimeService.createAttendee(
        data.meetingId,
        socket.userId
      );

      socket.emit('chime:attendee-created', {
        meeting,
        attendee,
      });

      // Notify other attendees
      socket.to(`meeting:${data.meetingId}`).emit('chime:attendee-joined', {
        attendee,
        userId: socket.userId,
      });

      socket.join(`meeting:${data.meetingId}`);

      logger.info(
        `User ${socket.userId} joined meeting ${data.meetingId} as attendee ${attendee.attendeeId}`
      );
    } catch (error) {
      logger.error(`Failed to join meeting: ${error}`);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  }

  @SubscribeMessage('chime:leave-meeting')
  async handleLeaveMeeting(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      meetingId: string;
      attendeeId: string;
    }
  ) {
    try {
      if (!socket.userId) {
        return;
      }

      await this.chimeService.deleteAttendee(data.meetingId, data.attendeeId);

      socket.leave(`meeting:${data.meetingId}`);

      // 通知其他参会者
      socket.to(`meeting:${data.meetingId}`).emit('chime:attendee-left', {
        attendeeId: data.attendeeId,
        userId: socket.userId,
      });

      socket.emit('chime:left-meeting', { meetingId: data.meetingId });

      logger.info(
        `User ${socket.userId} left meeting ${data.meetingId} (attendee: ${data.attendeeId})`
      );
    } catch (error) {
      logger.error(`Failed to leave meeting: ${error}`);
      socket.emit('error', { message: 'Failed to leave meeting' });
    }
  }

  @SubscribeMessage('chime:end-meeting')
  async handleEndMeeting(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      meetingId: string;
    }
  ) {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      await this.chimeService.deleteMeeting(data.meetingId);

      // 通知所有参会者
      this.server.to(`meeting:${data.meetingId}`).emit('chime:meeting-ended', {
        meetingId: data.meetingId,
        endedBy: socket.userId,
      });

      logger.info(`Meeting ${data.meetingId} ended by user: ${socket.userId}`);
    } catch (error) {
      logger.error(`Failed to end meeting: ${error}`);
      socket.emit('error', { message: 'Failed to end meeting' });
    }
  }

  @SubscribeMessage('chime:list-attendees')
  async handleListAttendees(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      meetingId: string;
    }
  ) {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const attendees = await this.chimeService.listAttendees(data.meetingId);

      socket.emit('chime:attendees-list', {
        meetingId: data.meetingId,
        attendees,
      });
    } catch (error) {
      logger.error(`Failed to list attendees: ${error}`);
      socket.emit('error', { message: 'Failed to list attendees' });
    }
  }
}
