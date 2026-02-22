import axios, { AxiosError } from 'axios';
import { API_V1 } from '@/src/config/api';
import { AuthUser } from '@/src/domain/entities';

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
  async login(payload: LoginPayload): Promise<AuthResponse['data']> {
    const { data } = await axios.post<AuthResponse>(`${API_V1}/auth/login`, payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Login failed');
    }
    return data.data;
  }

  async register(payload: RegisterPayload): Promise<AuthResponse['data']> {
    const { data } = await axios.post<AuthResponse>(`${API_V1}/auth/register`, payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Register failed');
    }
    return data.data;
  }

  isAuthError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const status = (error as AxiosError).response?.status;
      return status === 401 || status === 403;
    }
    return false;
  }
}

export const authService = new AuthService();
