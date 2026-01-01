export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  about?: string;
  lastSeen?: Date;
  isOnline: boolean;
  isTyping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity implements User {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  about?: string;
  lastSeen?: Date;
  isOnline: boolean;
  isTyping: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: User) {
    this.id = data.id;
    this.name = data.name;
    this.phoneNumber = data.phoneNumber;
    this.profilePicture = data.profilePicture;
    this.about = data.about ?? '嗨，我正在使用 WhatsChat！';
    this.lastSeen = data.lastSeen;
    this.isOnline = data.isOnline ?? false;
    this.isTyping = data.isTyping ?? false;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  copyWith(updates: Partial<User>): UserEntity {
    return new UserEntity({
      id: updates.id ?? this.id,
      name: updates.name ?? this.name,
      phoneNumber: updates.phoneNumber ?? this.phoneNumber,
      profilePicture: updates.profilePicture ?? this.profilePicture,
      about: updates.about ?? this.about,
      lastSeen: updates.lastSeen ?? this.lastSeen,
      isOnline: updates.isOnline ?? this.isOnline,
      isTyping: updates.isTyping ?? this.isTyping,
      createdAt: updates.createdAt ?? this.createdAt,
      updatedAt: updates.updatedAt ?? this.updatedAt,
    });
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      phoneNumber: this.phoneNumber,
      profilePicture: this.profilePicture,
      about: this.about,
      lastSeen: this.lastSeen?.getTime(),
      isOnline: this.isOnline,
      isTyping: this.isTyping,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  static fromMap(map: Record<string, any>): UserEntity {
    return new UserEntity({
      id: map.id ?? '',
      name: map.name ?? '',
      phoneNumber: map.phoneNumber ?? '',
      profilePicture: map.profilePicture,
      about: map.about,
      lastSeen: map.lastSeen ? new Date(map.lastSeen) : undefined,
      isOnline: map.isOnline ?? false,
      isTyping: map.isTyping ?? false,
      createdAt: new Date(map.createdAt),
      updatedAt: new Date(map.updatedAt),
    });
  }

  toString(): string {
    return `User(id: ${this.id}, name: ${this.name}, phoneNumber: ${this.phoneNumber}, isOnline: ${this.isOnline})`;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}

