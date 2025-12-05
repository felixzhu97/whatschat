export interface GroupMember {
  userId: string;
  userName: string;
  userAvatar: string;
  role: "member" | "admin" | "owner";
  joinedAt: string;
  lastSeen?: string;
}

export interface GroupSettings {
  whoCanSendMessages: "everyone" | "admins";
  whoCanEditGroupInfo: "everyone" | "admins";
  whoCanAddMembers: "everyone" | "admins";
  disappearingMessages: boolean;
  disappearingMessagesDuration: number;
}

export class Group {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly avatar: string,
    public readonly createdBy: string,
    public readonly createdAt: string,
    public readonly members: GroupMember[],
    public readonly admins: string[],
    public readonly settings: GroupSettings,
    public readonly description?: string,
    public readonly inviteLink?: string
  ) {}

  static create(data: {
    id: string;
    name: string;
    avatar: string;
    createdBy: string;
    createdAt: string;
    members: GroupMember[];
    admins: string[];
    settings: GroupSettings;
    description?: string;
    inviteLink?: string;
  }): Group {
    return new Group(
      data.id,
      data.name,
      data.avatar,
      data.createdBy,
      data.createdAt,
      data.members,
      data.admins,
      data.settings,
      data.description,
      data.inviteLink
    );
  }

  addMember(member: GroupMember): Group {
    return new Group(
      this.id,
      this.name,
      this.avatar,
      this.createdBy,
      this.createdAt,
      [...this.members, member],
      this.admins,
      this.settings,
      this.description,
      this.inviteLink
    );
  }

  removeMember(userId: string): Group {
    return new Group(
      this.id,
      this.name,
      this.avatar,
      this.createdBy,
      this.createdAt,
      this.members.filter((m) => m.userId !== userId),
      this.admins.filter((id) => id !== userId),
      this.settings,
      this.description,
      this.inviteLink
    );
  }

  updateSettings(settings: Partial<GroupSettings>): Group {
    return new Group(
      this.id,
      this.name,
      this.avatar,
      this.createdBy,
      this.createdAt,
      this.members,
      this.admins,
      { ...this.settings, ...settings },
      this.description,
      this.inviteLink
    );
  }

  updateInfo(name: string, description?: string, avatar?: string): Group {
    return new Group(
      this.id,
      name,
      avatar ?? this.avatar,
      this.createdBy,
      this.createdAt,
      this.members,
      this.admins,
      this.settings,
      description ?? this.description,
      this.inviteLink
    );
  }
}
