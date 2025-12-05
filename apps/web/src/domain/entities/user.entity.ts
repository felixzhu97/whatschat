export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly phone?: string,
    public readonly avatar?: string,
    public readonly status?: string,
    public readonly name?: string,
    public readonly about?: string,
    public readonly isOnline: boolean = false,
    public readonly lastSeen: Date | string = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    status?: string;
    name?: string;
    about?: string;
    isOnline?: boolean;
    lastSeen?: Date | string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User(
      data.id,
      data.username,
      data.email,
      data.phone,
      data.avatar,
      data.status,
      data.name,
      data.about,
      data.isOnline ?? false,
      data.lastSeen ?? new Date(),
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }

  updateStatus(status: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phone,
      this.avatar,
      status,
      this.name,
      this.about,
      this.isOnline,
      this.lastSeen,
      this.createdAt,
      new Date()
    );
  }

  setOnline(isOnline: boolean): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.phone,
      this.avatar,
      this.status,
      this.name,
      this.about,
      isOnline,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  updateProfile(updates: {
    username?: string;
    name?: string;
    about?: string;
    avatar?: string;
    status?: string;
  }): User {
    return new User(
      this.id,
      updates.username ?? this.username,
      this.email,
      this.phone,
      updates.avatar ?? this.avatar,
      updates.status ?? this.status,
      updates.name ?? this.name,
      updates.about ?? this.about,
      this.isOnline,
      this.lastSeen,
      this.createdAt,
      new Date()
    );
  }
}

