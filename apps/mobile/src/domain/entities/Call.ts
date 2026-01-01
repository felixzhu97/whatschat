export enum CallType {
  Voice = 'voice',
  Video = 'video',
}

export enum CallStatus {
  Incoming = 'incoming',
  Outgoing = 'outgoing',
  Missed = 'missed',
  Declined = 'declined',
  Busy = 'busy',
  Failed = 'failed',
}

export interface Call {
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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;

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

  toMap(): Record<string, any> {
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

  static fromMap(map: Record<string, any>): CallEntity {
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
      id: map.id ?? '',
      callerId: map.callerId ?? '',
      callerName: map.callerName ?? '',
      callerAvatar: map.callerAvatar,
      receiverId: map.receiverId ?? '',
      receiverName: map.receiverName ?? '',
      receiverAvatar: map.receiverAvatar,
      type: callTypeMap[map.type ?? 0] ?? CallType.Voice,
      status: callStatusMap[map.status ?? 0] ?? CallStatus.Incoming,
      timestamp: new Date(map.timestamp),
      duration: map.duration,
      isGroupCall: map.isGroupCall ?? false,
      participants: Array.isArray(map.participants) ? map.participants : [],
      roomId: map.roomId,
      metadata: map.metadata,
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
    if (this.duration == null) return '';

    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

