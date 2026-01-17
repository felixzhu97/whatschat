import { Session, SessionConfig } from "../types";
import { generateSessionId } from "./idGenerator";

/**
 * 默认会话配置
 */
export const DEFAULT_SESSION_CONFIG: Required<SessionConfig> = {
  timeout: 30 * 60 * 1000, // 30 分钟
  checkInterval: 60 * 1000, // 1 分钟
};

/**
 * 创建新会话
 */
export function createSession(userId?: string): Session {
  const now = Date.now();
  return {
    id: generateSessionId(),
    userId,
    startedAt: now,
    lastActivityAt: now,
    duration: 0,
    pageViews: 0,
    events: 0,
  };
}

/**
 * 检查会话是否超时
 */
export function isSessionExpired(
  session: Session,
  timeout: number = DEFAULT_SESSION_CONFIG.timeout
): boolean {
  const now = Date.now();
  return now - session.lastActivityAt > timeout;
}

/**
 * 更新会话活动时间
 */
export function updateSessionActivity(session: Session): void {
  const now = Date.now();
  session.lastActivityAt = now;
  session.duration = now - session.startedAt;
}

/**
 * 合并会话配置
 */
export function mergeSessionConfig(
  config?: SessionConfig
): Required<SessionConfig> {
  return {
    timeout: config?.timeout ?? DEFAULT_SESSION_CONFIG.timeout,
    checkInterval: config?.checkInterval ?? DEFAULT_SESSION_CONFIG.checkInterval,
  };
}
