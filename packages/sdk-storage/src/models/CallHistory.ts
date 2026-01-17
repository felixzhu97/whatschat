import { CallHistory } from "../types";

/**
 * 通话记录模型
 */
export class CallHistoryModel implements CallHistory {
  id: string;
  roomId?: string;
  participants: string[];
  startTime: number;
  endTime?: number;
  duration?: number;
  type: "audio" | "video";
  status: "success" | "failed" | "missed";
  signalingUrl?: string;
  createdAt: number;

  constructor(data: CallHistory) {
    this.id = data.id;
    this.roomId = data.roomId;
    this.participants = data.participants;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.duration = data.duration;
    this.type = data.type;
    this.status = data.status;
    this.signalingUrl = data.signalingUrl;
    this.createdAt = data.createdAt;
  }

  /**
   * 计算通话时长
   */
  calculateDuration(): number {
    if (this.endTime && this.startTime) {
      return Math.floor((this.endTime - this.startTime) / 1000);
    }
    return 0;
  }

  /**
   * 转换为 JSON
   */
  toJSON(): CallHistory {
    return {
      id: this.id,
      roomId: this.roomId,
      participants: this.participants,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration ?? this.calculateDuration(),
      type: this.type,
      status: this.status,
      signalingUrl: this.signalingUrl,
      createdAt: this.createdAt,
    };
  }
}
