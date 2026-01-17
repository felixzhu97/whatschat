import {
  ISessionManager,
  Session,
  SessionConfig,
  SessionCallback,
} from "@whatschat/analytics-core";
import {
  createSession,
  isSessionExpired,
  updateSessionActivity,
  mergeSessionConfig,
} from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";

/**
 * React Native 平台会话管理器
 */
export class RNSessionManager implements ISessionManager {
  private config: Required<SessionConfig>;
  private checkTimer: ReturnType<typeof setInterval> | null = null;
  private startCallbacks: Set<SessionCallback> = new Set();
  private endCallbacks: Set<SessionCallback> = new Set();

  constructor(config?: SessionConfig) {
    this.config = mergeSessionConfig(config);
  }

  initialize(config?: SessionConfig): void {
    this.config = mergeSessionConfig(config);
    this.startCheckTimer();

    // 如果没有当前会话，创建一个
    if (!this.getCurrentSession()) {
      const userId = useAnalyticsStore.getState().userId;
      this.createSession(userId);
    }
  }

  getCurrentSession(): Session | null {
    const session = useAnalyticsStore.getState().currentSession;
    if (session && this.isSessionExpired()) {
      this.endSession();
      return null;
    }
    return session;
  }

  createSession(userId?: string): Session {
    // 结束旧会话
    const oldSession = this.getCurrentSession();
    if (oldSession) {
      this.endSession();
    }

    const session = createSession(userId);
    useAnalyticsStore.getState().setCurrentSession(session);

    // 触发回调
    this.startCallbacks.forEach((callback) => {
      try {
        callback(session);
      } catch (error) {
        console.error("Session start callback error:", error);
      }
    });

    return session;
  }

  extendSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      updateSessionActivity(session);
      useAnalyticsStore.getState().setCurrentSession(session);
    }
  }

  endSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      useAnalyticsStore.getState().setCurrentSession(null);

      // 触发回调
      this.endCallbacks.forEach((callback) => {
        try {
          callback(session);
        } catch (error) {
          console.error("Session end callback error:", error);
        }
      });
    }
  }

  isSessionExpired(): boolean {
    const session = this.getCurrentSession();
    if (!session) {
      return true;
    }
    return isSessionExpired(session, this.config.timeout);
  }

  getConfig(): SessionConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SessionConfig>): void {
    this.config = mergeSessionConfig({ ...this.config, ...config });
    this.restartCheckTimer();
  }

  onSessionStart(callback: SessionCallback): void {
    this.startCallbacks.add(callback);
  }

  onSessionEnd(callback: SessionCallback): void {
    this.endCallbacks.add(callback);
  }

  offSessionStart(callback: SessionCallback): void {
    this.startCallbacks.delete(callback);
  }

  offSessionEnd(callback: SessionCallback): void {
    this.endCallbacks.delete(callback);
  }

  private startCheckTimer(): void {
    this.stopCheckTimer();
    this.checkTimer = setInterval(() => {
      if (this.isSessionExpired()) {
        this.endSession();
        // 创建新会话
        const userId = useAnalyticsStore.getState().userId;
        this.createSession(userId);
      }
    }, this.config.checkInterval);
  }

  private stopCheckTimer(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  private restartCheckTimer(): void {
    this.stopCheckTimer();
    this.startCheckTimer();
  }

  destroy(): void {
    this.stopCheckTimer();
    this.endSession();
    this.startCallbacks.clear();
    this.endCallbacks.clear();
  }
}
