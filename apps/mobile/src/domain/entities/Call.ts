import type { Call as DomainCall } from "@whatschat/shared-types";

export enum CallType {
  Voice = "voice",
  Video = "video",
}

export enum CallStatus {
  Incoming = "incoming",
  Outgoing = "outgoing",
  Missed = "missed",
  Declined = "declined",
  Busy = "busy",
  Failed = "failed",
}

export interface Call extends Omit<DomainCall, "type" | "status"> {
  type: CallType;
  status: CallStatus;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  timestamp: Date;
  isGroupCall: boolean;
  participants: string[];
}

export class CallEntity implements Call {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  type: CallType;
  status: CallStatus;
  timestamp: Date;
  duration?: number;
  isGroupCall: boolean;
  participants: string[];
  roomId?: string;
  metadata?: Record<string, unknown>;

  constructor(data: Call) {
    this.id = data.id;
    this.callerId = data.callerId;
    this.callerName = data.callerName;
    this.callerAvatar = data.callerAvatar;
    this.receiverId = data.receiverId;
    this.receiverName = data.receiverName;
    this.receiverAvatar = data.receiverAvatar;
    this.type = data.type;
    this.status = data.status;
    this.timestamp = data.timestamp;
    this.duration = data.duration;
    this.isGroupCall = data.isGroupCall ?? false;
    this.participants = data.participants ?? [];
    this.roomId = data.roomId;
    this.metadata = data.metadata;
  }

  copyWith(updates: Partial<Call>): CallEntity {
    return new CallEntity({
      id: updates.id ?? this.id,
      callerId: updates.callerId ?? this.callerId,
      callerName: updates.callerName ?? this.callerName,
      callerAvatar: updates.callerAvatar ?? this.callerAvatar,
      receiverId: updates.receiverId ?? this.receiverId,
      receiverName: updates.receiverName ?? this.receiverName,
      receiverAvatar: updates.receiverAvatar ?? this.receiverAvatar,
      type: updates.type ?? this.type,
      status: updates.status ?? this.status,
      timestamp: updates.timestamp ?? this.timestamp,
      duration: updates.duration ?? this.duration,
      isGroupCall: updates.isGroupCall ?? this.isGroupCall,
      participants: updates.participants ?? this.participants,
      roomId: updates.roomId ?? this.roomId,
      metadata: updates.metadata ?? this.metadata,
    });
  }

  toMap(): Record<string, unknown> {
    return {
      id: this.id,
      callerId: this.callerId,
      callerName: this.callerName,
      callerAvatar: this.callerAvatar,
      receiverId: this.receiverId,
      receiverName: this.receiverName,
      receiverAvatar: this.receiverAvatar,
      type: this.type,
      status: this.status,
      timestamp: this.timestamp.getTime(),
      duration: this.duration,
      isGroupCall: this.isGroupCall,
      participants: this.participants,
      roomId: this.roomId,
      metadata: this.metadata,
    };
  }

  static fromMap(map: Record<string, unknown>): CallEntity {
    const callTypeMap: Record<number, CallType> = {
      0: CallType.Voice,
      1: CallType.Video,
    };

    const callStatusMap: Record<number, CallStatus> = {
      0: CallStatus.Incoming,
      1: CallStatus.Outgoing,
      2: CallStatus.Missed,
      3: CallStatus.Declined,
      4: CallStatus.Busy,
      5: CallStatus.Failed,
    };

    return new CallEntity({
      id: (map.id as string) ?? "",
      callerId: (map.callerId as string) ?? "",
      callerName: (map.callerName as string) ?? "",
      callerAvatar: map.callerAvatar as string | undefined,
      receiverId: (map.receiverId as string) ?? "",
      receiverName: (map.receiverName as string) ?? "",
      receiverAvatar: map.receiverAvatar as string | undefined,
      type: callTypeMap[(map.type as number) ?? 0] ?? CallType.Voice,
      status: callStatusMap[(map.status as number) ?? 0] ?? CallStatus.Incoming,
      timestamp: new Date(map.timestamp as number),
      duration: map.duration as number | undefined,
      isGroupCall: (map.isGroupCall as boolean) ?? false,
      participants: Array.isArray(map.participants) ? (map.participants as string[]) : [],
      roomId: map.roomId as string | undefined,
      metadata: map.metadata as Record<string, unknown> | undefined,
    });
  }

  get isVoiceCall(): boolean {
    return this.type === CallType.Voice;
  }

  get isVideoCall(): boolean {
    return this.type === CallType.Video;
  }

  get isIncoming(): boolean {
    return this.status === CallStatus.Incoming;
  }

  get isOutgoing(): boolean {
    return this.status === CallStatus.Outgoing;
  }

  get isMissed(): boolean {
    return this.status === CallStatus.Missed;
  }

  get isDeclined(): boolean {
    return this.status === CallStatus.Declined;
  }

  get isBusy(): boolean {
    return this.status === CallStatus.Busy;
  }

  get isFailed(): boolean {
    return this.status === CallStatus.Failed;
  }

  get durationString(): string {
    if (this.duration == null) return "";

    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${seconds}s`;
    }
  }

  toString(): string {
    return `Call(id: ${this.id}, type: ${this.type}, status: ${this.status}, duration: ${this.duration})`;
  }

  equals(other: Call): boolean {
    return this.id === other.id;
  }
}
