import { IAuthService, AuthState, RegisterData, LoginData } from "../../domain/interfaces/services/auth.service.interface";
import { User } from "../../domain/entities/user.entity";
import { getApiClient } from "../../infrastructure/adapters/api/api-client.adapter";
import { AuthApiAdapter } from "../../infrastructure/adapters/api/auth-api.adapter";
import { getStorageAdapter } from "../../infrastructure/adapters/storage/storage.adapter";

const STORAGE_KEYS = {
  USER: "whatsapp_user",
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export class AuthService implements IAuthService {
  private apiClient = getApiClient();
  private authApi = new AuthApiAdapter(this.apiClient);
  private storage = getStorageAdapter();
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  constructor() {
    this.initializeAuth();
  }

  async initializeAuth(): Promise<void> {
    try {
      const savedUser = this.storage.load<string>(STORAGE_KEYS.USER, null);
      const accessToken = this.storage.load<string>(STORAGE_KEYS.ACCESS_TOKEN, null);
      const refreshToken = this.storage.load<string>(STORAGE_KEYS.REFRESH_TOKEN, null);

      if (savedUser && accessToken) {
        this.apiClient.setToken(accessToken);

        try {
          const response: any = await this.authApi.getCurrentUser();
          if (response.success && response.data) {
            this.authState = {
              user: User.create(response.data.user),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
            return;
          }
        } catch (error) {
          if (refreshToken) {
            try {
              const refreshResponse: any = await this.authApi.refreshToken(refreshToken);
              if (refreshResponse.success && refreshResponse.data) {
                const { token } = refreshResponse.data;
                this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
                this.apiClient.setToken(token);

                this.authState = {
                  user: User.create(JSON.parse(savedUser)),
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                };
                return;
              }
            } catch (refreshError) {
              console.error("Token刷新失败:", refreshError);
            }
          }
        }
      }

      this.clearAuthStorage();
      this.authState = { ...this.authState, isLoading: false };
    } catch (error) {
      console.error("认证初始化失败:", error);
      this.clearAuthStorage();
      this.authState = { ...this.authState, isLoading: false };
    }
  }

  private clearAuthStorage(): void {
    this.storage.remove(STORAGE_KEYS.USER);
    this.storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    this.authState = { ...this.authState, isLoading: true, error: null };

    try {
      const response: any = await this.authApi.login(data);

      if (response.success && response.data) {
        const { user, token } = response.data;

        this.storage.save(STORAGE_KEYS.USER, JSON.stringify(user));
        this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
        this.apiClient.setToken(token);
        // Keep WebSocket adapter compatible: also store raw token for socket handshake
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
        }

        this.authState = {
          user: User.create(user),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };

        return { success: true };
      } else {
        throw new Error(response.message || "登录失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "登录失败，请检查邮箱和密码";
      this.authState = {
        ...this.authState,
        isLoading: false,
        error: errorMessage,
      };
      return { success: false, error: errorMessage };
    }
  }

  async register(
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> {
    this.authState = { ...this.authState, isLoading: true, error: null };

    try {
      const response: any = await this.authApi.register(data);

      if (response.success && response.data) {
        const { user, token } = response.data;

        this.storage.save(STORAGE_KEYS.USER, JSON.stringify(user));
        this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
        this.apiClient.setToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
        }

        this.authState = {
          user: User.create(user),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };

        return { success: true };
      } else {
        throw new Error(response.message || "注册失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "注册失败，请稍后重试";
      this.authState = {
        ...this.authState,
        isLoading: false,
        error: errorMessage,
      };
      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.logout();
    } catch (error) {
      console.error("登出API调用失败:", error);
    } finally {
      this.clearAuthStorage();
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response: any = await this.authApi.getCurrentUser();
      if (response.success && response.data) {
        const user = User.create(response.data.user);
        this.authState = { ...this.authState, user };
        return user;
      }
      return null;
    } catch (error) {
      console.error("获取当前用户失败:", error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response: any = await this.authApi.refreshToken(refreshToken);
      if (response.success && response.data) {
        const { token } = response.data;
        this.storage.save(STORAGE_KEYS.ACCESS_TOKEN, token);
        this.apiClient.setToken(token);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("刷新token失败:", error);
      return null;
    }
  }

  async updateUser(updates: {
    username?: string;
    name?: string;
    about?: string;
    status?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: "用户未登录" };
    }

    try {
      const response: any = await this.authApi.updateProfile(updates);

      if (response.success && response.data) {
        const updatedUser = User.create(response.data.user);
        this.storage.save(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        this.authState = { ...this.authState, user: updatedUser };
        return { success: true };
      } else {
        throw new Error(response.message || "更新失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "更新用户信息失败";
      this.authState = { ...this.authState, error: errorMessage };
      return { success: false, error: errorMessage };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (!this.authState.user) {
      return { success: false, error: "用户未登录" };
    }

    try {
      const response = await this.authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        this.clearAuthStorage();
        this.authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        };
        return { success: true, message: "密码修改成功，请重新登录" };
      } else {
        throw new Error(response.message || "密码修改失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "密码修改失败";
      return { success: false, error: errorMessage };
    }
  }

  async forgotPassword(email: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      const response = await this.authApi.forgotPassword(email);
      if (response.success) {
        return {
          success: true,
          message: response.message || "重置链接已发送到邮箱",
        };
      } else {
        throw new Error(response.message || "发送重置链接失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "发送重置链接失败";
      return { success: false, error: errorMessage };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await this.authApi.resetPassword({ token, newPassword });
      if (response.success) {
        return { success: true, message: response.message || "密码重置成功" };
      } else {
        throw new Error(response.message || "密码重置失败");
      }
    } catch (error: any) {
      const errorMessage = error.message || "密码重置失败";
      return { success: false, error: errorMessage };
    }
  }

  clearError(): void {
    this.authState = { ...this.authState, error: null };
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }
}

// 创建单例实例
let authServiceInstance: AuthService | null = null;

export const getAuthService = (): IAuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

