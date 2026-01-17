import { Session, SessionConfig, SessionCallback } from "../types";

/**
 * 会话管理器接口
 */
export interface ISessionManager {
  /**
   * 初始化会话管理器
   */
  initialize(config?: SessionConfig): void;

  /**
   * 获取当前会话
   */
  getCurrentSession(): Session | null;

  /**
   * 创建新会话
   */
  createSession(userId?: string): Session;

  /**
   * 延长会话（更新最后活动时间）
   */
  extendSession(): void;

  /**
   * 结束当前会话
   */
  endSession(): void;

  /**
   * 检查会话是否超时
   */
  isSessionExpired(): boolean;

  /**
   * 获取会话超时配置
   */
  getConfig(): SessionConfig;

  /**
   * 更新会话配置
   */
  updateConfig(config: Partial<SessionConfig>): void;

  /**
   * 添加会话回调
   */
  onSessionStart(callback: SessionCallback): void;
  onSessionEnd(callback: SessionCallback): void;

  /**
   * 移除会话回调
   */
  offSessionStart(callback: SessionCallback): void;
  offSessionEnd(callback: SessionCallback): void;
}
