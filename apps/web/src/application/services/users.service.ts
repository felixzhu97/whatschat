import { IUsersService } from "../../domain/interfaces/services/users.service.interface";
import { User } from "../../domain/entities/user.entity";
import { UserApiAdapter } from "../../infrastructure/adapters/api/user-api.adapter";
import { getApiClient } from "../../infrastructure/adapters/api/api-client.adapter";

export class UsersService implements IUsersService {
  private userApi: UserApiAdapter;

  constructor() {
    this.userApi = new UserApiAdapter(getApiClient());
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<User[]> {
    try {
      const response = await this.userApi.getUsers(params);
      if (response.success && response.data) {
        return response.data.map((user: any) => User.create(user));
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
        return User.create(response.data);
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
        return response.data.map((user: any) => User.create(user));
      }
      return [];
    } catch (error) {
      console.error("搜索用户失败:", error);
      return [];
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // 这里应该调用API更新用户信息
    // 暂时返回更新后的用户
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    return user;
  }
}

// 创建单例实例
let usersServiceInstance: UsersService | null = null;

export const getUsersService = (): IUsersService => {
  if (!usersServiceInstance) {
    usersServiceInstance = new UsersService();
  }
  return usersServiceInstance;
};

