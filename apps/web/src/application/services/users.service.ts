import { IUsersService } from "../../domain/interfaces/services/users.service.interface";
import { User } from "../../domain/entities/user.entity";
import { UserApiAdapter } from "../../infrastructure/adapters/api/user-api.adapter";
import { getAppComposition } from "../../infrastructure/composition-root";
import { mapUnknownToUser } from "../mappers/users.mapper";

export class UsersService implements IUsersService {
  constructor(private readonly userApi: UserApiAdapter) {}

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]> {
    try {
      const response = await this.userApi.getUsers(params);
      if (response.success && response.data) {
        const rows = response.data as unknown[];
        return rows.map((user) => mapUnknownToUser(user));
      }
      return [];
    } catch (error) {
      console.error("获取用户列表失败:", error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await this.userApi.getUserById(userId);
      if (response.success && response.data) {
        return mapUnknownToUser(response.data);
      }
      return null;
    } catch (error) {
      console.error("获取用户详情失败:", error);
      return null;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await this.userApi.searchUsers(query);
      if (response.success && response.data) {
        const rows = response.data as unknown[];
        return rows.map((user) => mapUnknownToUser(user));
      }
      return [];
    } catch (error) {
      console.error("搜索用户失败:", error);
      return [];
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    return user;
  }
}

let usersServiceInstance: UsersService | null = null;

export const getUsersService = (): IUsersService => {
  if (!usersServiceInstance) {
    usersServiceInstance = new UsersService(getAppComposition().userApi);
  }
  return usersServiceInstance;
};
