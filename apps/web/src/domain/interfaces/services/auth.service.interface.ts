import { User } from "../../entities/user.entity";
import type {
  AuthState as SharedAuthState,
  AuthTokens,
} from "@whatschat/shared-types";
export type { AuthTokens } from "@whatschat/shared-types";
export type AuthState = SharedAuthState<User>;

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}


export interface IAuthService {
  login(data: LoginData): Promise<{ success: boolean; error?: string }>;
  register(
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(refreshToken: string): Promise<AuthTokens | null>;
  updateUser(updates: {
    username?: string;
    name?: string;
    about?: string;
    status?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }>;
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }>;
  forgotPassword(email: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }>;
  initializeAuth(): Promise<void>;
  clearError(): void;
  getAuthState(): AuthState;
}

