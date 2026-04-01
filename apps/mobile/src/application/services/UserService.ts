import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import { User } from '@/src/domain/entities';
import { getHttpClient } from '@/src/infrastructure/composition-root';

export class UserService {
  constructor(private readonly _http: IHttpClient) {}

  async getCurrentUser(): Promise<User | null> {
    return null;
  }

  async getUserById(userId: string): Promise<User | null> {
    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    throw new Error('Not implemented');
  }
}

export const userService = new UserService(getHttpClient());
