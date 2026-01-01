export enum MessageType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  File = 'file',
  Location = 'location',
  Contact = 'contact',
  Sticker = 'sticker',
  Gif = 'gif',
  Voice = 'voice',
  System = 'system',
}

export enum MessageStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Failed = 'failed',
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  updatedAt?: Date;
  fileName?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  duration?: number;
  replyToId?: string;
  replyToContent?: string;
  isForwarded: boolean;
  forwardedFrom: string[];
  metadata?: Record<string, any>;
}

export class MessageEntity implements Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  updatedAt?: Date;
  fileName?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  duration?: number;
  replyToId?: string;
  replyToContent?: string;
  isForwarded: boolean;
  forwardedFrom: string[];
  metadata?: Record<string, any>;

  constructor(data: Message) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.senderId = data.senderId;
    this.senderName = data.senderName;
    this.senderAvatar = data.senderAvatar;
    this.content = data.content;
    this.type = data.type;
    this.status = data.status ?? MessageStatus.Sent;
    this.timestamp = data.timestamp;
    this.updatedAt = data.updatedAt;
    this.fileName = data.fileName;
    this.fileUrl = data.fileUrl;
    this.thumbnailUrl = data.thumbnailUrl;
    this.fileSize = data.fileSize;
    this.mimeType = data.mimeType;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.locationName = data.locationName;
    this.duration = data.duration;
    this.replyToId = data.replyToId;
    this.replyToContent = data.replyToContent;
    this.isForwarded = data.isForwarded ?? false;
    this.forwardedFrom = data.forwardedFrom ?? [];
    this.metadata = data.metadata;
  }

  copyWith(updates: Partial<Message>): MessageEntity {
    return new MessageEntity({
      id: updates.id ?? this.id,
      chatId: updates.chatId ?? this.chatId,
      senderId: updates.senderId ?? this.senderId,
      senderName: updates.senderName ?? this.senderName,
      senderAvatar: updates.senderAvatar ?? this.senderAvatar,
      content: updates.content ?? this.content,
      type: updates.type ?? this.type,
      status: updates.status ?? this.status,
      timestamp: updates.timestamp ?? this.timestamp,
      updatedAt: updates.updatedAt ?? this.updatedAt,
      fileName: updates.fileName ?? this.fileName,
      fileUrl: updates.fileUrl ?? this.fileUrl,
      thumbnailUrl: updates.thumbnailUrl ?? this.thumbnailUrl,
      fileSize: updates.fileSize ?? this.fileSize,
      mimeType: updates.mimeType ?? this.mimeType,
      latitude: updates.latitude ?? this.latitude,
      longitude: updates.longitude ?? this.longitude,
      locationName: updates.locationName ?? this.locationName,
      duration: updates.duration ?? this.duration,
      replyToId: updates.replyToId ?? this.replyToId,
      replyToContent: updates.replyToContent ?? this.replyToContent,
      isForwarded: updates.isForwarded ?? this.isForwarded,
      forwardedFrom: updates.forwardedFrom ?? this.forwardedFrom,
      metadata: updates.metadata ?? this.metadata,
    });
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      senderName: this.senderName,
      senderAvatar: this.senderAvatar,
      content: this.content,
      type: this.type,
      status: this.status,
      timestamp: this.timestamp.getTime(),
      updatedAt: this.updatedAt?.getTime(),
      fileName: this.fileName,
      fileUrl: this.fileUrl,
      thumbnailUrl: this.thumbnailUrl,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      latitude: this.latitude,
      longitude: this.longitude,
      locationName: this.locationName,
      duration: this.duration,
      replyToId: this.replyToId,
      replyToContent: this.replyToContent,
      isForwarded: this.isForwarded,
      forwardedFrom: this.forwardedFrom,
      metadata: this.metadata,
    };
  }

  static fromMap(map: Record<string, any>): MessageEntity {
    const messageTypeMap: Record<number, MessageType> = {
      0: MessageType.Text,
      1: MessageType.Image,
      2: MessageType.Video,
      3: MessageType.Audio,
      4: MessageType.File,
      5: MessageType.Location,
      6: MessageType.Contact,
      7: MessageType.Sticker,
      8: MessageType.Gif,
      9: MessageType.Voice,
      10: MessageType.System,
    };

    const messageStatusMap: Record<number, MessageStatus> = {
      0: MessageStatus.Sent,
      1: MessageStatus.Delivered,
      2: MessageStatus.Read,
      3: MessageStatus.Failed,
    };

    return new MessageEntity({
      id: map.id ?? '',
      chatId: map.chatId ?? '',
      senderId: map.senderId ?? '',
      senderName: map.senderName ?? '',
      senderAvatar: map.senderAvatar,
      content: map.content ?? '',
      type: messageTypeMap[map.type ?? 0] ?? MessageType.Text,
      status: messageStatusMap[map.status ?? 0] ?? MessageStatus.Sent,
      timestamp: new Date(map.timestamp),
      updatedAt: map.updatedAt ? new Date(map.updatedAt) : undefined,
      fileName: map.fileName,
      fileUrl: map.fileUrl,
      thumbnailUrl: map.thumbnailUrl,
      fileSize: map.fileSize,
      mimeType: map.mimeType,
      latitude: map.latitude,
      longitude: map.longitude,
      locationName: map.locationName,
      duration: map.duration,
      replyToId: map.replyToId,
      replyToContent: map.replyToContent,
      isForwarded: map.isForwarded ?? false,
      forwardedFrom: Array.isArray(map.forwardedFrom) ? map.forwardedFrom : [],
      metadata: map.metadata,
    });
  }

  toString(): string {
    return `Message(id: ${this.id}, type: ${this.type}, content: ${this.content}, timestamp: ${this.timestamp})`;
  }

  equals(other: Message): boolean {
    return this.id === other.id;
  }
}

