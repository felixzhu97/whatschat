import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  DeleteMeetingCommand,
  GetMeetingCommand,
  CreateAttendeeCommand,
  DeleteAttendeeCommand,
  BatchCreateAttendeeCommand,
  ListAttendeesCommand,
} from '@aws-sdk/client-chime-sdk-meetings';
import type { AWSConfig } from '../../types';
import { mergeAWSConfig, validateAWSConfig } from '../../config/aws-config';
import { normalizeAWSError, withRetry } from '../../utils';

/**
 * 创建会议选项
 */
export interface CreateMeetingOptions {
  clientRequestToken: string;
  mediaRegion?: string;
  meetingHostId?: string;
  externalMeetingId?: string;
  notificationsConfiguration?: {
    snsTopicArn?: string;
    sqsQueueArn?: string;
  };
  tags?: Array<{ Key: string; Value: string }>;
}

/**
 * 会议信息
 */
export interface MeetingInfo {
  meetingId: string;
  meetingArn?: string;
  mediaPlacement?: {
    audioHostUrl?: string;
    audioFallbackUrl?: string;
    signalingUrl?: string;
    turnControlUrl?: string;
    screenDataUrl?: string;
    screenSharingUrl?: string;
    screenViewingUrl?: string;
    eventIngestionUrl?: string;
  };
  mediaRegion?: string;
  externalMeetingId?: string;
}

/**
 * 创建参会者选项
 */
export interface CreateAttendeeOptions {
  meetingId: string;
  externalUserId: string;
  tags?: Array<{ Key: string; Value: string }>;
}

/**
 * 批量创建参会者选项
 */
export interface BatchCreateAttendeeOptions {
  meetingId: string;
  attendees: Array<{
    externalUserId: string;
    tags?: Array<{ Key: string; Value: string }>;
  }>;
}

/**
 * 参会者信息
 */
export interface AttendeeInfo {
  attendeeId: string;
  attendeeArn?: string;
  externalUserId?: string;
  joinToken?: string;
}

/**
 * Chime SDK 客户端封装类
 */
export class ChimeClient {
  private client: ChimeSDKMeetingsClient;

  constructor(config?: Partial<AWSConfig>) {
    const mergedConfig = mergeAWSConfig({ region: 'us-east-1' }, config);
    validateAWSConfig(mergedConfig);
    this.client = new ChimeSDKMeetingsClient(mergedConfig);
  }

  /**
   * 创建会议
   */
  async createMeeting(options: CreateMeetingOptions): Promise<MeetingInfo> {
    try {
      const command = new CreateMeetingCommand({
        ClientRequestToken: options.clientRequestToken,
        MediaRegion: options.mediaRegion,
        MeetingHostId: options.meetingHostId,
        ExternalMeetingId: options.externalMeetingId,
        ...(options.notificationsConfiguration && {
          NotificationsConfiguration: options.notificationsConfiguration as any,
        }),
        ...(options.tags && { Tags: options.tags }),
      });

      const result = await withRetry(() => this.client.send(command));

      return {
        meetingId: result.Meeting?.MeetingId || '',
        meetingArn: result.Meeting?.MeetingArn,
        mediaPlacement: result.Meeting?.MediaPlacement
          ? {
              audioHostUrl: result.Meeting.MediaPlacement.AudioHostUrl,
              audioFallbackUrl: result.Meeting.MediaPlacement.AudioFallbackUrl,
              signalingUrl: result.Meeting.MediaPlacement.SignalingUrl,
              turnControlUrl: result.Meeting.MediaPlacement.TurnControlUrl,
              screenDataUrl: result.Meeting.MediaPlacement.ScreenDataUrl,
              screenSharingUrl: result.Meeting.MediaPlacement.ScreenSharingUrl,
              screenViewingUrl: result.Meeting.MediaPlacement.ScreenViewingUrl,
              eventIngestionUrl: result.Meeting.MediaPlacement.EventIngestionUrl,
            }
          : undefined,
        mediaRegion: result.Meeting?.MediaRegion,
        externalMeetingId: result.Meeting?.ExternalMeetingId,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 获取会议信息
   */
  async getMeeting(meetingId: string): Promise<MeetingInfo | null> {
    try {
      const command = new GetMeetingCommand({
        MeetingId: meetingId,
      });

      const result = await withRetry(() => this.client.send(command));

      if (!result.Meeting) {
        return null;
      }

      return {
        meetingId: result.Meeting.MeetingId || '',
        meetingArn: result.Meeting.MeetingArn,
        mediaPlacement: result.Meeting.MediaPlacement
          ? {
              audioHostUrl: result.Meeting.MediaPlacement.AudioHostUrl,
              audioFallbackUrl: result.Meeting.MediaPlacement.AudioFallbackUrl,
              signalingUrl: result.Meeting.MediaPlacement.SignalingUrl,
              turnControlUrl: result.Meeting.MediaPlacement.TurnControlUrl,
              screenDataUrl: result.Meeting.MediaPlacement.ScreenDataUrl,
              screenSharingUrl: result.Meeting.MediaPlacement.ScreenSharingUrl,
              screenViewingUrl: result.Meeting.MediaPlacement.ScreenViewingUrl,
              eventIngestionUrl: result.Meeting.MediaPlacement.EventIngestionUrl,
            }
          : undefined,
        mediaRegion: result.Meeting.MediaRegion,
        externalMeetingId: result.Meeting.ExternalMeetingId,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 删除会议
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const command = new DeleteMeetingCommand({
        MeetingId: meetingId,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 创建参会者
   */
  async createAttendee(options: CreateAttendeeOptions): Promise<AttendeeInfo> {
    try {
      const command = new CreateAttendeeCommand({
        MeetingId: options.meetingId,
        ExternalUserId: options.externalUserId,
        // Tags are not supported in CreateAttendeeCommand
      });

      const result = await withRetry(() => this.client.send(command));

      return {
        attendeeId: result.Attendee?.AttendeeId || '',
        attendeeArn: (result.Attendee as any)?.AttendeeArn,
        externalUserId: result.Attendee?.ExternalUserId,
        joinToken: result.Attendee?.JoinToken,
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 批量创建参会者
   */
  async batchCreateAttendee(
    options: BatchCreateAttendeeOptions
  ): Promise<{ attendees: AttendeeInfo[]; errors: Array<{ code: string; message: string }> }> {
    try {
      const command = new BatchCreateAttendeeCommand({
        MeetingId: options.meetingId,
        Attendees: options.attendees.map((a) => ({
          ExternalUserId: a.externalUserId,
          // Tags are not supported in BatchCreateAttendeeCommand
        })),
      });

      const result = await withRetry(() => this.client.send(command));

      return {
        attendees:
          result.Attendees?.map((a) => ({
            attendeeId: a.AttendeeId || '',
            attendeeArn: (a as any).AttendeeArn,
            externalUserId: a.ExternalUserId,
            joinToken: a.JoinToken,
          })) || [],
        errors:
          result.Errors?.map((e) => ({
            code: e.ErrorCode || '',
            message: e.ErrorMessage || '',
          })) || [],
      };
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 列出会议的所有参会者
   */
  async listAttendees(meetingId: string): Promise<AttendeeInfo[]> {
    try {
      const command = new ListAttendeesCommand({
        MeetingId: meetingId,
      });

      const result = await withRetry(() => this.client.send(command));

      return (
        result.Attendees?.map((a) => ({
          attendeeId: a.AttendeeId || '',
          attendeeArn: (a as any).AttendeeArn,
          externalUserId: a.ExternalUserId,
          joinToken: a.JoinToken,
        })) || []
      );
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }

  /**
   * 删除参会者
   */
  async deleteAttendee(meetingId: string, attendeeId: string): Promise<void> {
    try {
      const command = new DeleteAttendeeCommand({
        MeetingId: meetingId,
        AttendeeId: attendeeId,
      });

      await withRetry(() => this.client.send(command));
    } catch (error) {
      throw normalizeAWSError(error);
    }
  }
}
