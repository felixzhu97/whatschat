import { create } from "zustand";
import { User, Session, Funnel } from "../types";

interface AnalyticsStore {
  // 用户信息
  user: User | null;
  userId: string | undefined;

  // 会话信息
  currentSession: Session | null;

  // 漏斗定义
  funnels: Map<string, Funnel>;

  // 启用状态
  enabled: boolean;

  // 配置
  config: {
    apiKey?: string;
    endpoint?: string;
    debug?: boolean;
  };

  // Actions
  setUser: (user: User | null) => void;
  setUserId: (userId: string | undefined) => void;
  setCurrentSession: (session: Session | null) => void;
  addFunnel: (funnel: Funnel) => void;
  removeFunnel: (funnelId: string) => void;
  getFunnel: (funnelId: string) => Funnel | undefined;
  setEnabled: (enabled: boolean) => void;
  setConfig: (config: Partial<AnalyticsStore["config"]>) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  userId: undefined,
  currentSession: null,
  funnels: new Map<string, Funnel>(),
  enabled: true,
  config: {
    apiKey: undefined,
    endpoint: undefined,
    debug: false,
  },
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      userId: user?.id,
    }),

  setUserId: (userId) =>
    set({
      userId,
      user: userId && get().user ? { ...get().user!, id: userId } : get().user,
    }),

  setCurrentSession: (session) => set({ currentSession: session }),

  addFunnel: (funnel) =>
    set((state) => {
      const funnels = new Map(state.funnels);
      funnels.set(funnel.id, funnel);
      return { funnels };
    }),

  removeFunnel: (funnelId) =>
    set((state) => {
      const funnels = new Map(state.funnels);
      funnels.delete(funnelId);
      return { funnels };
    }),

  getFunnel: (funnelId) => get().funnels.get(funnelId),

  setEnabled: (enabled) => set({ enabled }),

  setConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  reset: () => set(initialState),
}));
