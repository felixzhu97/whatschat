import {
  IPerformanceMonitor,
  PerformanceMetrics,
  PerformanceCallback,
  ResourceMetric,
  APIMetric,
} from "@whatschat/analytics-core";

/**
 * React Native 平台性能监控器
 */
export class RNPerformanceMonitor implements IPerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private callbacks: Set<PerformanceCallback> = new Set();
  private isMonitoring: boolean = false;
  private appStartTime: number = 0;

  constructor() {
    this.appStartTime = Date.now();
    this.initializeMetrics();
  }

  start(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.initializeMetrics();
  }

  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
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
    const now = Date.now();
    // React Native 平台可以使用 Performance API（如果可用）
    // 或使用第三方库如 react-native-performance-monitor
    this.metrics = {
      pageLoadTime: now - this.appStartTime,
    };
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
