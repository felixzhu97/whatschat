import { User } from "../../entities/user.entity";

export interface IUsersService {
  getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]>;
  getUserById(userId: string): Promise<User | null>;
  searchUsers(query: string): Promise<User[]>;
  updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User>;
}

