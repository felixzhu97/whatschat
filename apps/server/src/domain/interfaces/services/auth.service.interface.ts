import { User } from "../../entities/user.entity";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface IAuthService {
  register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }>;
  login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  validateToken(token: string): Promise<{ userId: string; email: string; username: string }>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}

