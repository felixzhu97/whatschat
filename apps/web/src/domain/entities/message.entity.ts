export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "contact"
  | "voice";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface Attachment {
  id: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export class Message {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly content: string,
    public readonly timestamp: string,
    public readonly type: MessageType,
    public readonly status: MessageStatus,
    public readonly replyTo?: string,
    public readonly isEdited?: boolean,
    public readonly editedAt?: string,
    public readonly isStarred?: boolean,
    public readonly isForwarded?: boolean,
    public readonly attachments?: Attachment[],
    public readonly duration?: number,
    public readonly fileName?: string,
    public readonly fileSize?: string,
    public readonly location?: Location
  ) {}

  static create(data: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type?: MessageType;
    status?: MessageStatus;
    replyTo?: string;
    isEdited?: boolean;
    editedAt?: string;
    isStarred?: boolean;
    isForwarded?: boolean;
    attachments?: Attachment[];
    duration?: number;
    fileName?: string;
    fileSize?: string;
    location?: Location;
  }): Message {
    return new Message(
      data.id,
      data.senderId,
      data.senderName,
      data.content,
      data.timestamp,
      data.type ?? "text",
      data.status ?? "sending",
      data.replyTo,
      data.isEdited,
      data.editedAt,
      data.isStarred,
      data.isForwarded,
      data.attachments,
      data.duration,
      data.fileName,
      data.fileSize,
      data.location
    );
  }

  updateStatus(status: MessageStatus): Message {
    return new Message(
      this.id,
      this.senderId,
      this.senderName,
      this.content,
      this.timestamp,
      this.type,
      status,
      this.replyTo,
      this.isEdited,
      this.editedAt,
      this.isStarred,
      this.isForwarded,
      this.attachments,
      this.duration,
      this.fileName,
      this.fileSize,
      this.location
    );
  }

  edit(newContent: string): Message {
    return new Message(
      this.id,
      this.senderId,
      this.senderName,
      newContent,
      this.timestamp,
      this.type,
      this.status,
      this.replyTo,
      true,
      new Date().toISOString(),
      this.isStarred,
      this.isForwarded,
      this.attachments,
      this.duration,
      this.fileName,
      this.fileSize,
      this.location
    );
  }

  toggleStar(): Message {
    return new Message(
      this.id,
      this.senderId,
      this.senderName,
      this.content,
      this.timestamp,
      this.type,
      this.status,
      this.replyTo,
      this.isEdited,
      this.editedAt,
      !this.isStarred,
      this.isForwarded,
      this.attachments,
      this.duration,
      this.fileName,
      this.fileSize,
      this.location
    );
  }
}

