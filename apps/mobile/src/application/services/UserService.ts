import { User } from '@/src/domain/entities';

export class UserService {
  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement API call
    return null;
  }

  async getUserById(userId: string): Promise<User | null> {
    // TODO: Implement API call
    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // TODO: Implement API call
    throw new Error('Not implemented');
  }
}

