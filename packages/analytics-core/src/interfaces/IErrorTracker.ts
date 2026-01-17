import { ErrorEvent, ErrorInfo, ErrorType, ErrorCallback } from "../types";

/**
 * 错误追踪器接口
 */
export interface IErrorTracker {
  /**
   * 开始错误追踪
   */
  start(): void;

  /**
   * 停止错误追踪
   */
  stop(): void;

  /**
   * 手动捕获错误
   */
  captureError(
    error: Error | ErrorInfo,
    context?: Record<string, unknown>
  ): void;

  /**
   * 捕获自定义错误
   */
  captureCustomError(message: string, context?: Record<string, unknown>): void;

  /**
   * 获取错误事件列表
   */
  getErrors(): ErrorEvent[];

  /**
   * 清空错误列表
   */
  clearErrors(): void;

  /**
   * 添加错误回调
   */
  onError(callback: ErrorCallback): void;

  /**
   * 移除错误回调
   */
  offError(callback: ErrorCallback): void;
}
