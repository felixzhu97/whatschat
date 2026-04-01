import { AxiosError, isAxiosError } from 'axios';
import type { IHttpClient } from '@/src/domain/ports/http-client.port';
import type { AuthRegisterPayload, AuthSession, IAuthRepository } from '@/src/domain/ports/auth.repository.port';
import type { AuthUser } from '@/src/domain/entities';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
    refreshToken: string;
  };
}

export class AuthRepositoryAdapter implements IAuthRepository {
  constructor(private readonly http: IHttpClient) {}

  async login(email: string, password: string): Promise<AuthSession> {
    const { data } = await this.http.post<AuthResponse>('/auth/login', { email, password });
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Login failed');
    }
    return data.data;
  }

  async register(payload: AuthRegisterPayload): Promise<AuthSession> {
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
