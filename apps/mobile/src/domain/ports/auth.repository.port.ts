import type { AuthUser } from '../entities';

export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export interface AuthRegisterPayload {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthSession>;
  register(payload: AuthRegisterPayload): Promise<AuthSession>;
  isAuthError(error: unknown): boolean;
}
