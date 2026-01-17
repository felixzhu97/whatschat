import {
  IEventTracker,
  AnalyticsEvent,
  EventProperties,
  EventCallback,
  EventQueueConfig,
} from "@whatschat/analytics-core";
import { EventQueue } from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";
import { generateEventId } from "@whatschat/analytics-core";

/**
 * React Native 平台事件追踪器
 */
export class RNEventTracker implements IEventTracker {
  private queue: EventQueue;
  private callbacks: Set<EventCallback> = new Set();
  private endpoint?: string;
  private enabled: boolean = true;

  constructor(endpoint?: string) {
    this.endpoint = endpoint;
    this.queue = new EventQueue(
      {
        maxSize: 100,
        flushInterval: 5000,
        batchSize: 10,
      },
      this.flushEvents.bind(this)
    );
    this.enabled = useAnalyticsStore.getState().enabled;
    useAnalyticsStore.subscribe((state) => {
      this.enabled = state.enabled;
    });
  }

  track(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): void {
    if (!this.enabled) {
      return;
    }

    const session = useAnalyticsStore.getState().currentSession;
    const userId = useAnalyticsStore.getState().userId;

    const event: Omit<AnalyticsEvent, "id"> = {
      name: eventName,
      properties,
      context: {
        ...context,
        device: this.getDeviceContext(),
      },
      timestamp: Date.now(),
      sessionId: session?.id || "",
      userId,
    };

    this.queue.enqueue(event);

    // 触发回调
    const eventWithId: AnalyticsEvent = {
      ...event,
      id: generateEventId(),
    };
    this.callbacks.forEach((callback) => {
      try {
        callback(eventWithId);
      } catch (error) {
        console.error("Event callback error:", error);
      }
    });
  }

  async trackImmediate(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const session = useAnalyticsStore.getState().currentSession;
    const userId = useAnalyticsStore.getState().userId;

    const event: AnalyticsEvent = {
      id: generateEventId(),
      name: eventName,
      properties,
      context: {
        ...context,
        device: this.getDeviceContext(),
      },
      timestamp: Date.now(),
      sessionId: session?.id || "",
      userId,
    };

    await this.sendEvents([event]);

    // 触发回调
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Event callback error:", error);
      }
    });
  }

  async flush(): Promise<void> {
    await this.queue.flush();
  }

  clear(): void {
    this.queue.clear();
  }

  getQueueSize(): number {
    return this.queue.size();
  }

  configureQueue(config: EventQueueConfig): void {
    this.queue.updateConfig(config);
  }

  onEvent(callback: EventCallback): void {
    this.callbacks.add(callback);
  }

  offEvent(callback: EventCallback): void {
    this.callbacks.delete(callback);
  }

  private async flushEvents(events: AnalyticsEvent[]): Promise<void> {
    await this.sendEvents(events);
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.endpoint || events.length === 0) {
      return;
    }

    try {
      // React Native 使用 fetch API
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error("Failed to send events:", error);
      // 重新加入队列（失败重试）
      events.forEach((event) => this.queue.enqueue(event));
    }
  }

  private getDeviceContext() {
    // React Native 平台可以使用 react-native-device-info 等库获取设备信息
    // 这里简化处理
    return {
      type: "mobile",
      platform: this.getPlatform(),
    };
  }

  private getPlatform(): string | undefined {
    // 在 React Native 中，可以使用 Platform.OS
    // 这里简化处理，实际使用时需要导入 Platform
    return undefined;
  }

  destroy(): void {
    this.queue.destroy();
    this.callbacks.clear();
  }
}
