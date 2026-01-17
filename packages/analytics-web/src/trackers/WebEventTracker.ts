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
 * Web 平台事件追踪器
 */
export class WebEventTracker implements IEventTracker {
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
    useAnalyticsStore.subscribe((state: { enabled: boolean }) => {
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
        page: this.getPageContext(),
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
        page: this.getPageContext(),
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

  private getPageContext() {
    if (typeof window === "undefined") {
      return undefined;
    }
    return {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || undefined,
    };
  }

  private getDeviceContext() {
    if (typeof navigator === "undefined") {
      return undefined;
    }
    return {
      type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
        ? "mobile"
        : "desktop",
      os: this.getOS(),
      browser: this.getBrowser(),
    };
  }

  private getOS(): string | undefined {
    if (typeof navigator === "undefined") {
      return undefined;
    }
    const ua = navigator.userAgent;
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return undefined;
  }

  private getBrowser(): string | undefined {
    if (typeof navigator === "undefined") {
      return undefined;
    }
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return undefined;
  }

  destroy(): void {
    this.queue.destroy();
    this.callbacks.clear();
  }
}
