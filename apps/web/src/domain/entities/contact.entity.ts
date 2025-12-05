export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: "member" | "admin" | "owner";
}

export class Contact {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly avatar: string,
    public readonly lastMessage: string,
    public readonly timestamp: string,
    public readonly unreadCount: number,
    public readonly isOnline: boolean,
    public readonly isGroup: boolean,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly phoneNumber?: string,
    public readonly status?: string,
    public readonly lastSeen?: string,
    public readonly pinned?: boolean,
    public readonly muted?: boolean,
    public readonly blocked?: boolean,
    public readonly members?: GroupMember[],
    public readonly memberCount?: number,
    public readonly description?: string,
    public readonly admin?: string[]
  ) {}

  static create(data: {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    isOnline?: boolean;
    isGroup?: boolean;
    phone?: string;
    email?: string;
    phoneNumber?: string;
    status?: string;
    lastSeen?: string;
    pinned?: boolean;
    muted?: boolean;
    blocked?: boolean;
    members?: GroupMember[];
    memberCount?: number;
    description?: string;
    admin?: string[];
  }): Contact {
    return new Contact(
      data.id,
      data.name,
      data.avatar,
      data.lastMessage,
      data.timestamp,
      data.unreadCount ?? 0,
      data.isOnline ?? false,
      data.isGroup ?? false,
      data.phone,
      data.email,
      data.phoneNumber,
      data.status,
      data.lastSeen,
      data.pinned,
      data.muted,
      data.blocked,
      data.members,
      data.memberCount,
      data.description,
      data.admin
    );
  }

  updateLastMessage(message: string, timestamp: string): Contact {
    return new Contact(
      this.id,
      this.name,
      this.avatar,
      message,
      timestamp,
      this.unreadCount,
      this.isOnline,
      this.isGroup,
      this.phone,
      this.email,
      this.phoneNumber,
      this.status,
      this.lastSeen,
      this.pinned,
      this.muted,
      this.blocked,
      this.members,
      this.memberCount,
      this.description,
      this.admin
    );
  }

  updateUnreadCount(count: number): Contact {
    return new Contact(
      this.id,
      this.name,
      this.avatar,
      this.lastMessage,
      this.timestamp,
      Math.max(0, count),
      this.isOnline,
      this.isGroup,
      this.phone,
      this.email,
      this.phoneNumber,
      this.status,
      this.lastSeen,
      this.pinned,
      this.muted,
      this.blocked,
      this.members,
      this.memberCount,
      this.description,
      this.admin
    );
  }

  setOnline(isOnline: boolean): Contact {
    return new Contact(
      this.id,
      this.name,
      this.avatar,
      this.lastMessage,
      this.timestamp,
      this.unreadCount,
      isOnline,
      this.isGroup,
      this.phone,
      this.email,
      this.phoneNumber,
      this.status,
      isOnline ? undefined : new Date().toISOString(),
      this.pinned,
      this.muted,
      this.blocked,
      this.members,
      this.memberCount,
      this.description,
      this.admin
    );
  }

  togglePin(): Contact {
    return new Contact(
      this.id,
      this.name,
      this.avatar,
      this.lastMessage,
      this.timestamp,
      this.unreadCount,
      this.isOnline,
      this.isGroup,
      this.phone,
      this.email,
      this.phoneNumber,
      this.status,
      this.lastSeen,
      !this.pinned,
      this.muted,
      this.blocked,
      this.members,
      this.memberCount,
      this.description,
      this.admin
    );
  }

  toggleMute(): Contact {
    return new Contact(
      this.id,
      this.name,
      this.avatar,
      this.lastMessage,
      this.timestamp,
      this.unreadCount,
      this.isOnline,
      this.isGroup,
      this.phone,
      this.email,
      this.phoneNumber,
      this.status,
      this.lastSeen,
      this.pinned,
      !this.muted,
      this.blocked,
      this.members,
      this.memberCount,
      this.description,
      this.admin
    );
  }
}
