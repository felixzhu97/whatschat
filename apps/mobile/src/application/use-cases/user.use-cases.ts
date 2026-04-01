import type { IUserRepository } from '@/src/domain/ports/user.repository.port';
import type { User } from '@/src/domain/entities';

export class UserUseCases {
  constructor(private readonly userRepository: IUserRepository) {}

  getCurrentUser() {
    return this.userRepository.getCurrentUser();
  }

  getUserById(userId: string) {
    return this.userRepository.getUserById(userId);
  }

  updateUser(userId: string, updates: Partial<User>) {
    return this.userRepository.updateUser(userId, updates);
  }
}
