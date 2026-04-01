import { AxiosError, isAxiosError } from 'axios';
import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import { AuthUser } from '@/src/domain/entities';
import { getHttpClient } from '@/src/infrastructure/composition-root';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  };
}

export class AuthService {
  constructor(private readonly http: IHttpClient) {}

  async login(payload: LoginPayload): Promise<AuthResponse['data']> {
    const { data } = await this.http.post<AuthResponse>('/auth/login', payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Login failed');
    }
    return data.data;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse['data']> {
    const { data } = await this.http.post<AuthResponse>('/auth/register', payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Register failed');
    }
    return data.data;
  }

  isAuthError(error: unknown): boolean {
    if (isAxiosError(error)) {
      const status = (error as AxiosError).response?.status;
      return status === 401 || status === 403;
    }
    return false;
  }
}

export const authService = new AuthService(getHttpClient());
