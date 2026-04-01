import type { IUserRepository } from '@/src/domain/ports/user.repository.port';
import type { User } from '@/src/domain/entities';

export class UserRepositoryAdapter implements IUserRepository {
  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  async getUserById(_userId: string): Promise<User | null> {
    return null;
  }

  async updateUser(_userId: string, _updates: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }
}
