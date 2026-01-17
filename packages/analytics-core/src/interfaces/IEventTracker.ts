import {
  AnalyticsEvent,
  EventProperties,
  EventCallback,
  EventQueueConfig,
} from "../types";

/**
 * 事件追踪器接口
 */
export interface IEventTracker {
  /**
   * 追踪事件
   */
  track(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): void;

  /**
   * 立即上报事件（绕过队列）
   */
  trackImmediate(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): Promise<void>;

  /**
   * 刷新事件队列（立即上报所有待上报事件）
   */
  flush(): Promise<void>;

  /**
   * 清空事件队列
   */
  clear(): void;

  /**
   * 获取队列中的事件数量
   */
  getQueueSize(): number;

  /**
   * 配置事件队列
   */
  configureQueue(config: EventQueueConfig): void;

  /**
   * 添加事件回调
   */
  onEvent(callback: EventCallback): void;

  /**
   * 移除事件回调
   */
  offEvent(callback: EventCallback): void;
}
