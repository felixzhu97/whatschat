import { AnalyticsEvent, EventQueueConfig } from "../types";
import { generateEventId } from "./idGenerator";

/**
 * 默认事件队列配置
 */
export const DEFAULT_EVENT_QUEUE_CONFIG: Required<EventQueueConfig> = {
  maxSize: 100,
  flushInterval: 5000, // 5 秒
  batchSize: 10,
};

/**
 * 事件队列类
 */
export class EventQueue {
  private queue: AnalyticsEvent[] = [];
  private config: Required<EventQueueConfig>;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushCallback?: (events: AnalyticsEvent[]) => Promise<void>;

  constructor(
    config?: EventQueueConfig,
    flushCallback?: (events: AnalyticsEvent[]) => Promise<void>
  ) {
    this.config = {
      maxSize: config?.maxSize ?? DEFAULT_EVENT_QUEUE_CONFIG.maxSize,
      flushInterval:
        config?.flushInterval ?? DEFAULT_EVENT_QUEUE_CONFIG.flushInterval,
      batchSize: config?.batchSize ?? DEFAULT_EVENT_QUEUE_CONFIG.batchSize,
    };
    this.flushCallback = flushCallback;
    this.startFlushTimer();
  }

  /**
   * 添加事件到队列
   */
  enqueue(event: Omit<AnalyticsEvent, "id">): void {
    const eventWithId: AnalyticsEvent = {
      ...event,
      id: generateEventId(),
    };

    // 如果队列已满，移除最旧的事件
    if (this.queue.length >= this.config.maxSize) {
      this.queue.shift();
    }

    this.queue.push(eventWithId);

    // 如果达到批次大小，立即刷新
    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch((error) => {
        console.error("Failed to flush event queue:", error);
      });
    }
  }

  /**
   * 获取队列中的所有事件（不移除）
   */
  peek(): AnalyticsEvent[] {
    return [...this.queue];
  }

  /**
   * 获取并清空队列中的事件
   */
  dequeueAll(): AnalyticsEvent[] {
    const events = [...this.queue];
    this.queue = [];
    return events;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * 刷新队列（上报事件）
   */
  async flush(): Promise<void> {
    const events = this.dequeueAll();
    if (events.length > 0 && this.flushCallback) {
      await this.flushCallback(events);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<EventQueueConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this.restartFlushTimer();
  }

  /**
   * 启动刷新定时器
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => {
        console.error("Failed to flush event queue:", error);
      });
    }, this.config.flushInterval);
  }

  /**
   * 重启刷新定时器
   */
  private restartFlushTimer(): void {
    this.stopFlushTimer();
    this.startFlushTimer();
  }

  /**
   * 停止刷新定时器
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * 销毁队列
   */
  destroy(): void {
    this.stopFlushTimer();
    this.clear();
    this.flushCallback = undefined;
  }
}
