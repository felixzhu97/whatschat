/**
 * 指标收集器
 * Web Vitals、自定义性能指标收集
 */

import type { WebVitalsMetrics, PerformanceMetrics } from '../types';

/**
 * 指标收集器
 */
export class MetricsCollector {
  private metrics: PerformanceMetrics = {};
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();

  /**
   * 收集 Web Vitals 指标
   */
  collectWebVitals(
    callback?: (metrics: WebVitalsMetrics) => void
  ): void {
    if (typeof window === 'undefined' || !window.performance) {
      console.warn('[MetricsCollector] Web Vitals 收集仅在浏览器环境中可用');
      return;
    }

    // 收集 FCP (First Contentful Paint)
    this.collectFCP(callback);

    // 收集 LCP (Largest Contentful Paint)
    this.collectLCP(callback);

    // 收集 FID (First Input Delay)
    this.collectFID(callback);

    // 收集 CLS (Cumulative Layout Shift)
    this.collectCLS(callback);

    // 收集 TTFB (Time to First Byte)
    this.collectTTFB(callback);
  }

  /**
   * 收集 FCP
   */
  private collectFCP(callback?: (metrics: WebVitalsMetrics) => void): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            this.metrics.webVitals = {
              ...this.metrics.webVitals,
              fcp,
            };

            if (callback) {
              callback({ fcp });
            }

            this.notifyListeners();
            observer.disconnect();
            break;
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集 FCP:', error);
    }
  }

  /**
   * 收集 LCP
   */
  private collectLCP(callback?: (metrics: WebVitalsMetrics) => void): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      let lcpValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        lcpValue = lastEntry.renderTime || lastEntry.loadTime;

        this.metrics.webVitals = {
          ...this.metrics.webVitals,
          lcp: lcpValue,
        };

        if (callback) {
          callback({ lcp: lcpValue });
        }

        this.notifyListeners();
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集 LCP:', error);
    }
  }

  /**
   * 收集 FID
   */
  private collectFID(callback?: (metrics: WebVitalsMetrics) => void): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;

          this.metrics.webVitals = {
            ...this.metrics.webVitals,
            fid,
          };

          if (callback) {
            callback({ fid });
          }

          this.notifyListeners();
          observer.disconnect();
          break;
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集 FID:', error);
    }
  }

  /**
   * 收集 CLS
   */
  private collectCLS(callback?: (metrics: WebVitalsMetrics) => void): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        this.metrics.webVitals = {
          ...this.metrics.webVitals,
          cls: clsValue,
        };

        if (callback) {
          callback({ cls: clsValue });
        }

        this.notifyListeners();
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集 CLS:', error);
    }
  }

  /**
   * 收集 TTFB
   */
  private collectTTFB(callback?: (metrics: WebVitalsMetrics) => void): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    try {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;

      this.metrics.webVitals = {
        ...this.metrics.webVitals,
        ttfb,
      };

      if (callback) {
        callback({ ttfb });
      }

      this.notifyListeners();
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集 TTFB:', error);
    }
  }

  /**
   * 收集导航时间指标
   */
  collectNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    try {
      const timing = window.performance.timing;
      const navigation = window.performance.navigation;

      this.metrics.domContentLoaded =
        timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
      this.metrics.navigationTiming = window.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      this.notifyListeners();
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集导航时间:', error);
    }
  }

  /**
   * 收集资源时间指标
   */
  collectResourceTiming(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    try {
      this.metrics.resourceTiming = window.performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];

      this.notifyListeners();
    } catch (error) {
      console.warn('[MetricsCollector] 无法收集资源时间:', error);
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 添加指标更新监听器
   */
  onMetricsUpdate(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);

    // 返回取消监听的函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.getMetrics());
      } catch (error) {
        console.error('[MetricsCollector] 监听器执行错误:', error);
      }
    });
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.listeners.clear();
    this.metrics = {};
  }
}

/**
 * 创建指标收集器
 */
export function metricsCollector(): MetricsCollector {
  return new MetricsCollector();
}
