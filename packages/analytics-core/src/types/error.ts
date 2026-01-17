/**
 * 错误追踪类型定义
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  context?: Record<string, unknown>;
}

export interface ErrorEvent {
  id: string;
  type: ErrorType;
  error: ErrorInfo;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page?: string;
  userAgent?: string;
  url?: string;
}

export enum ErrorType {
  JavaScript = "javascript",
  PromiseRejection = "promise_rejection",
  Resource = "resource",
  Network = "network",
  Custom = "custom",
}

export type ErrorCallback = (error: ErrorEvent) => void | Promise<void>;
