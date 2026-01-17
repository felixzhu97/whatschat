/**
 * 会话管理类型定义
 */

export interface Session {
  id: string;
  userId?: string;
  startedAt: number;
  lastActivityAt: number;
  duration: number;
  pageViews: number;
  events: number;
}

export interface SessionConfig {
  timeout?: number; // 会话超时时间（毫秒），默认 30 分钟
  checkInterval?: number; // 检查间隔（毫秒），默认 1 分钟
}

export type SessionCallback = (session: Session) => void | Promise<void>;
