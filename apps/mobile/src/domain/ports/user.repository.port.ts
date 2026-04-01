import type { User } from '../entities';

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
}
