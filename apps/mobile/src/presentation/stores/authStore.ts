import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '@/src/domain/entities';

const TOKEN_KEY = '@whatschat_token';
const REFRESH_TOKEN_KEY = '@whatschat_refresh_token';
const USER_KEY = '@whatschat_user';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isReady: boolean;
  setAuth: (token: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isReady: false,

  setAuth: async (token, refreshToken, user) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [REFRESH_TOKEN_KEY, refreshToken],
      [USER_KEY, JSON.stringify(user)],
    ]);
    set({ token, refreshToken, user });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    set({ token: null, refreshToken: null, user: null });
  },

  hydrate: async () => {
    try {
      const [[, token], [, refreshToken], [, userJson]] = await AsyncStorage.multiGet([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);
      const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
      set({
        token: token ?? null,
        refreshToken: refreshToken ?? null,
        user,
        isReady: true,
      });
    } catch {
      set({ isReady: true });
    }
  },
}));
