export type ParticipantRole = "ADMIN" | "MEMBER" | "member" | "admin" | "owner";

export interface GroupParticipant {
  userId: string;
  role: ParticipantRole;
  joinedAt: Date | string;
  addedBy?: string;
}

export interface GroupMember {
  userId: string;
  userName?: string;
  userAvatar?: string;
  role: ParticipantRole;
  joinedAt: string;
  lastSeen?: string;
}

export interface GroupSettings {
  onlyAdminsCanSendMessages?: boolean;
  onlyAdminsCanEditInfo?: boolean;
  onlyAdminsCanAddParticipants?: boolean;
  whoCanSendMessages?: "everyone" | "admins";
  whoCanEditGroupInfo?: "everyone" | "admins";
  whoCanAddMembers?: "everyone" | "admins";
  disappearingMessages?: boolean;
  disappearingMessagesDuration?: number;
}

export interface Group {
  id: string;
  name: string;
  creatorId?: string;
  createdBy?: string;
  description?: string;
  avatar?: string;
  participants?: GroupParticipant[];
  members?: GroupMember[];
  admins?: string[];
  settings?: GroupSettings;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  inviteLink?: string;
}
