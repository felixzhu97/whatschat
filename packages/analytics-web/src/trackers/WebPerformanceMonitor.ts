import {
  IPerformanceMonitor,
  PerformanceMetrics,
  PerformanceCallback,
  ResourceMetric,
  APIMetric,
} from "@whatschat/analytics-core";

/**
 * Web 平台性能监控器
 */
export class WebPerformanceMonitor implements IPerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private callbacks: Set<PerformanceCallback> = new Set();
  private isMonitoring: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private resourceObserver?: PerformanceObserver;

  constructor() {
    // 初始化指标
    if (typeof window !== "undefined" && window.performance) {
      this.initializeMetrics();
    }
  }

  start(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.initializeMetrics();

    // 监听资源加载
    if (typeof PerformanceObserver !== "undefined") {
      try {
        this.resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "resource") {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.trackResource({
                name: resourceEntry.name,
                type: this.getResourceType(resourceEntry.name),
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize || undefined,
                startTime: resourceEntry.startTime,
              });
            }
          });
        });
        this.resourceObserver.observe({ entryTypes: ["resource"] });
      } catch (error) {
        console.warn("PerformanceObserver not supported:", error);
      }
    }
  }

  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }

    if (this.resourceObserver) {
      this.resourceObserver.disconnect();
      this.resourceObserver = undefined;
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  trackResource(metric: ResourceMetric): void {
    if (!this.metrics.resources) {
      this.metrics.resources = [];
    }
    this.metrics.resources.push(metric);
    this.notifyCallbacks();
  }

  trackAPI(metric: APIMetric): void {
    if (!this.metrics.apiRequests) {
      this.metrics.apiRequests = [];
    }
    this.metrics.apiRequests.push(metric);
    this.notifyCallbacks();
  }

  clearMetrics(): void {
    this.metrics = {};
    this.initializeMetrics();
  }

  onMetrics(callback: PerformanceCallback): void {
    this.callbacks.add(callback);
  }

  offMetrics(callback: PerformanceCallback): void {
    this.callbacks.delete(callback);
  }

  private initializeMetrics(): void {
    if (typeof window === "undefined" || !window.performance) {
      return;
    }

    const perf = window.performance;
    const navigation = perf.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded =
        navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.firstByte = navigation.responseStart - navigation.fetchStart;
      this.metrics.timeToInteractive =
        navigation.domInteractive - navigation.fetchStart;
    }
  }

  private getResourceType(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return "image";
    }
    if (["js"].includes(extension)) {
      return "script";
    }
    if (["css"].includes(extension)) {
      return "stylesheet";
    }
    if (["woff", "woff2", "ttf", "otf"].includes(extension)) {
      return "font";
    }
    return "other";
  }

  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    this.callbacks.forEach((callback) => {
      try {
        callback(metrics);
      } catch (error) {
        console.error("Performance callback error:", error);
      }
    });
  }

  destroy(): void {
    this.stop();
    this.callbacks.clear();
    this.clearMetrics();
  }
}
