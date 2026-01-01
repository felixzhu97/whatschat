export enum StatusType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export enum StatusPrivacy {
  Contacts = 'contacts',
  ContactsExcept = 'contactsExcept',
  OnlyShareWith = 'onlyShareWith',
}

export interface Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: StatusType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  duration?: number;
  timestamp: Date;
  expiresAt: Date;
  privacy: StatusPrivacy;
  allowedViewers: string[];
  blockedViewers: string[];
  viewers: string[];
  metadata?: Record<string, any>;
}

export class StatusEntity implements Status {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: StatusType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: number;
  duration?: number;
  timestamp: Date;
  expiresAt: Date;
  privacy: StatusPrivacy;
  allowedViewers: string[];
  blockedViewers: string[];
  viewers: string[];
  metadata?: Record<string, any>;

  constructor(data: Status) {
    this.id = data.id;
    this.userId = data.userId;
    this.userName = data.userName;
    this.userAvatar = data.userAvatar;
    this.content = data.content;
    this.type = data.type;
    this.mediaUrl = data.mediaUrl;
    this.thumbnailUrl = data.thumbnailUrl;
    this.backgroundColor = data.backgroundColor;
    this.textColor = data.textColor;
    this.fontFamily = data.fontFamily;
    this.fontSize = data.fontSize;
    this.duration = data.duration;
    this.timestamp = data.timestamp;
    this.expiresAt = data.expiresAt;
    this.privacy = data.privacy ?? StatusPrivacy.Contacts;
    this.allowedViewers = data.allowedViewers ?? [];
    this.blockedViewers = data.blockedViewers ?? [];
    this.viewers = data.viewers ?? [];
    this.metadata = data.metadata;
  }

  copyWith(updates: Partial<Status>): StatusEntity {
    return new StatusEntity({
      id: updates.id ?? this.id,
      userId: updates.userId ?? this.userId,
      userName: updates.userName ?? this.userName,
      userAvatar: updates.userAvatar ?? this.userAvatar,
      content: updates.content ?? this.content,
      type: updates.type ?? this.type,
      mediaUrl: updates.mediaUrl ?? this.mediaUrl,
      thumbnailUrl: updates.thumbnailUrl ?? this.thumbnailUrl,
      backgroundColor: updates.backgroundColor ?? this.backgroundColor,
      textColor: updates.textColor ?? this.textColor,
      fontFamily: updates.fontFamily ?? this.fontFamily,
      fontSize: updates.fontSize ?? this.fontSize,
      duration: updates.duration ?? this.duration,
      timestamp: updates.timestamp ?? this.timestamp,
      expiresAt: updates.expiresAt ?? this.expiresAt,
      privacy: updates.privacy ?? this.privacy,
      allowedViewers: updates.allowedViewers ?? this.allowedViewers,
      blockedViewers: updates.blockedViewers ?? this.blockedViewers,
      viewers: updates.viewers ?? this.viewers,
      metadata: updates.metadata ?? this.metadata,
    });
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userAvatar: this.userAvatar,
      content: this.content,
      type: this.type,
      mediaUrl: this.mediaUrl,
      thumbnailUrl: this.thumbnailUrl,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      duration: this.duration,
      timestamp: this.timestamp.getTime(),
      expiresAt: this.expiresAt.getTime(),
      privacy: this.privacy,
      allowedViewers: this.allowedViewers,
      blockedViewers: this.blockedViewers,
      viewers: this.viewers,
      metadata: this.metadata,
    };
  }

  static fromMap(map: Record<string, any>): StatusEntity {
    const statusTypeMap: Record<number, StatusType> = {
      0: StatusType.Text,
      1: StatusType.Image,
      2: StatusType.Video,
    };

    const statusPrivacyMap: Record<number, StatusPrivacy> = {
      0: StatusPrivacy.Contacts,
      1: StatusPrivacy.ContactsExcept,
      2: StatusPrivacy.OnlyShareWith,
    };

    return new StatusEntity({
      id: map.id ?? '',
      userId: map.userId ?? '',
      userName: map.userName ?? '',
      userAvatar: map.userAvatar,
      content: map.content ?? '',
      type: statusTypeMap[map.type ?? 0] ?? StatusType.Text,
      mediaUrl: map.mediaUrl,
      thumbnailUrl: map.thumbnailUrl,
      backgroundColor: map.backgroundColor,
      textColor: map.textColor,
      fontFamily: map.fontFamily,
      fontSize: map.fontSize,
      duration: map.duration,
      timestamp: new Date(map.timestamp),
      expiresAt: new Date(map.expiresAt),
      privacy: statusPrivacyMap[map.privacy ?? 0] ?? StatusPrivacy.Contacts,
      allowedViewers: Array.isArray(map.allowedViewers) ? map.allowedViewers : [],
      blockedViewers: Array.isArray(map.blockedViewers) ? map.blockedViewers : [],
      viewers: Array.isArray(map.viewers) ? map.viewers : [],
      metadata: map.metadata,
    });
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isText(): boolean {
    return this.type === StatusType.Text;
  }

  get isImage(): boolean {
    return this.type === StatusType.Image;
  }

  get isVideo(): boolean {
    return this.type === StatusType.Video;
  }

  toString(): string {
    return `Status(id: ${this.id}, userId: ${this.userId}, type: ${this.type}, timestamp: ${this.timestamp})`;
  }

  equals(other: Status): boolean {
    return this.id === other.id;
  }
}

