import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChimeClient } from '@whatschat/aws-integration';
import { ConfigService } from '../../config/config.service';
import logger from '@/shared/utils/logger';
import type {
  CreateMeetingOptions,
  MeetingInfo,
  CreateAttendeeOptions,
  AttendeeInfo,
  BatchCreateAttendeeOptions,
} from '@whatschat/aws-integration';

/**
 * Chime 服务 - 封装 AWS Chime SDK 功能
 */
@Injectable()
export class ChimeService implements OnModuleInit {
  private chimeClient!: ChimeClient;
  private readonly config: ReturnType<typeof ConfigService.loadConfig>;

  constructor() {
    this.config = ConfigService.loadConfig();
  }

  async onModuleInit() {
    try {
      const awsConfig: any = {};
      
      if (this.config.storage.aws.accessKeyId && this.config.storage.aws.secretAccessKey) {
        awsConfig.credentials = {
          accessKeyId: this.config.storage.aws.accessKeyId,
          secretAccessKey: this.config.storage.aws.secretAccessKey,
        };
      }

      awsConfig.region = this.config.storage.aws.region || 'us-east-1';

      this.chimeClient = new ChimeClient(awsConfig);
      logger.info('✅ Chime Service initialized successfully');
    } catch (error) {
      logger.error('❌ Chime Service initialization failed:', error);
      // 在开发环境中不抛出错误，允许应用启动
      if (this.config.server.isProduction) {
        throw error;
      }
    }
  }

  /**
   * 创建会议
   */
  async createMeeting(
    userId: string,
    options?: Partial<CreateMeetingOptions>
  ): Promise<MeetingInfo> {
    try {
      const clientRequestToken = options?.clientRequestToken || `${userId}-${Date.now()}`;
      
      const meetingOptions: CreateMeetingOptions = {
        clientRequestToken,
        mediaRegion: options?.mediaRegion || this.config.storage.aws.region || 'us-east-1',
        externalMeetingId: options?.externalMeetingId || `meeting-${userId}-${Date.now()}`,
        ...options,
      };

      const meeting = await this.chimeClient.createMeeting(meetingOptions);
      logger.info(`Meeting created: ${meeting.meetingId} for user: ${userId}`);
      return meeting;
    } catch (error) {
      logger.error(`Failed to create meeting for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 获取会议信息
   */
  async getMeeting(meetingId: string): Promise<MeetingInfo | null> {
    try {
      return await this.chimeClient.getMeeting(meetingId);
    } catch (error) {
      logger.error(`Failed to get meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 删除会议
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      await this.chimeClient.deleteMeeting(meetingId);
      logger.info(`Meeting deleted: ${meetingId}`);
    } catch (error) {
      logger.error(`Failed to delete meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 创建参会者
   */
  async createAttendee(
    meetingId: string,
    userId: string,
    options?: Partial<CreateAttendeeOptions>
  ): Promise<AttendeeInfo> {
    try {
      const attendeeOptions: CreateAttendeeOptions = {
        meetingId,
        externalUserId: options?.externalUserId || userId,
        ...options,
      };

      const attendee = await this.chimeClient.createAttendee(attendeeOptions);
      logger.info(`Attendee created: ${attendee.attendeeId} for meeting: ${meetingId}`);
      return attendee;
    } catch (error) {
      logger.error(`Failed to create attendee for meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 批量创建参会者
   */
  async batchCreateAttendees(
    meetingId: string,
    userIds: string[],
    options?: Partial<BatchCreateAttendeeOptions>
  ): Promise<{ attendees: AttendeeInfo[]; errors: Array<{ code: string; message: string }> }> {
    try {
      const batchOptions: BatchCreateAttendeeOptions = {
        meetingId,
        attendees: userIds.map((userId) => ({
          externalUserId: userId,
        })),
        ...options,
      };

      const result = await this.chimeClient.batchCreateAttendee(batchOptions);
      logger.info(
        `Batch created ${result.attendees.length} attendees for meeting: ${meetingId}`
      );
      return result;
    } catch (error) {
      logger.error(`Failed to batch create attendees for meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 列出会议的所有参会者
   */
  async listAttendees(meetingId: string): Promise<AttendeeInfo[]> {
    try {
      return await this.chimeClient.listAttendees(meetingId);
    } catch (error) {
      logger.error(`Failed to list attendees for meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 删除参会者
   */
  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    try {
      await this.chimeClient.deleteAttendee(meetingId, attendeeId);
      logger.info(`Attendee deleted: ${attendeeId} from meeting: ${meetingId}`);
    } catch (error) {
      logger.error(`Failed to delete attendee ${attendeeId} from meeting ${meetingId}:`, error);
      throw error;
    }
  }

  /**
   * 获取 Chime 客户端（用于高级操作）
   */
  getChimeClient(): ChimeClient {
    return this.chimeClient;
  }
}
