export type CallType = "voice" | "video";
export type CallStatus =
  | "incoming"
  | "outgoing"
  | "missed"
  | "answered"
  | "ended";

export class Call {
  constructor(
    public readonly id: string,
    public readonly contactId: string,
    public readonly contactName: string,
    public readonly contactAvatar: string,
    public readonly type: CallType,
    public readonly status: CallStatus,
    public readonly startTime: string,
    public readonly endTime?: string,
    public readonly duration?: number,
    public readonly isGroup?: boolean,
    public readonly participants?: string[]
  ) {}

  static create(data: {
    id: string;
    contactId: string;
    contactName: string;
    contactAvatar: string;
    type: CallType;
    status: CallStatus;
    startTime: string;
    endTime?: string;
    duration?: number;
    isGroup?: boolean;
    participants?: string[];
  }): Call {
    return new Call(
      data.id,
      data.contactId,
      data.contactName,
      data.contactAvatar,
      data.type,
      data.status,
      data.startTime,
      data.endTime,
      data.duration,
      data.isGroup,
      data.participants
    );
  }

  answer(): Call {
    return new Call(
      this.id,
      this.contactId,
      this.contactName,
      this.contactAvatar,
      this.type,
      "answered",
      this.startTime,
      this.endTime,
      this.duration,
      this.isGroup,
      this.participants
    );
  }

  end(endTime: string, duration: number): Call {
    return new Call(
      this.id,
      this.contactId,
      this.contactName,
      this.contactAvatar,
      this.type,
      "ended",
      this.startTime,
      endTime,
      duration,
      this.isGroup,
      this.participants
    );
  }

  markAsMissed(): Call {
    return new Call(
      this.id,
      this.contactId,
      this.contactName,
      this.contactAvatar,
      this.type,
      "missed",
      this.startTime,
      this.endTime,
      this.duration,
      this.isGroup,
      this.participants
    );
  }
}
