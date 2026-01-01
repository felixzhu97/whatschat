import { create } from 'zustand';
import { ThemeMode } from '@/src/presentation/shared/theme';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),
}));

