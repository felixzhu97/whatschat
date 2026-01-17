/**
 * 内存泄漏检测器
 * 监控对象创建和销毁，检测潜在内存泄漏
 */

import type { LeakDetectorOptions, MemorySnapshot } from '../types';

/**
 * 内存泄漏检测器
 */
export class LeakDetector {
  private trackedObjects: WeakMap<object, number> = new WeakMap();
  private objectCount: number = 0;
  private checkInterval?: NodeJS.Timeout;
  private snapshots: MemorySnapshot[] = [];
  private options: Required<LeakDetectorOptions>;

  constructor(options: LeakDetectorOptions = {}) {
    this.options = {
      checkInterval: options.checkInterval ?? 5000,
      growthThreshold: options.growthThreshold ?? 10 * 1024 * 1024, // 10MB
      maxTrackedObjects: options.maxTrackedObjects ?? 1000,
      ...options,
    };
  }

  /**
   * 跟踪对象
   */
  track(obj: object): void {
    if (this.objectCount >= this.options.maxTrackedObjects) {
      console.warn('[LeakDetector] 已达到最大跟踪对象数');
      return;
    }

    this.trackedObjects.set(obj, Date.now());
    this.objectCount++;
  }

  /**
   * 停止跟踪对象
   */
  untrack(obj: object): void {
    if (this.trackedObjects.has(obj)) {
      this.trackedObjects.delete(obj);
      this.objectCount--;
    }
  }

  /**
   * 获取内存快照
   */
  takeSnapshot(): MemorySnapshot {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      // Node.js 环境
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        return {
          heapUsed: usage.heapUsed,
          heapTotal: usage.heapTotal,
          external: usage.external,
          timestamp: Date.now(),
        };
      }

      // 不支持的环境
      return {
        heapUsed: 0,
        heapTotal: 0,
        timestamp: Date.now(),
      };
    }

    // 浏览器环境（Chrome）
    const perf = performance as any;
    const memory = perf.memory as { usedJSHeapSize: number; totalJSHeapSize: number } | undefined;
    if (!memory) {
      return {
        heapUsed: 0,
        heapTotal: 0,
        timestamp: Date.now(),
      };
    }
    return {
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      timestamp: Date.now(),
    };
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.checkInterval) {
      return;
    }

    // 初始快照
    this.snapshots.push(this.takeSnapshot());

    this.checkInterval = setInterval(() => {
      const snapshot = this.takeSnapshot();
      this.snapshots.push(snapshot);

      // 只保留最近 10 个快照
      if (this.snapshots.length > 10) {
        this.snapshots.shift();
      }

      // 检测内存增长
      this.checkMemoryGrowth();
    }, this.options.checkInterval);
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * 检查内存增长
   */
  private checkMemoryGrowth(): void {
    if (this.snapshots.length < 2) {
      return;
    }

    const previous = this.snapshots[this.snapshots.length - 2];
    const current = this.snapshots[this.snapshots.length - 1];

    const growth = current.heapUsed - previous.heapUsed;

    if (growth > this.options.growthThreshold) {
      console.warn(
        `[LeakDetector] 检测到内存增长: ${this.formatBytes(growth)} (阈值: ${this.formatBytes(this.options.growthThreshold)})`
      );
    }
  }

  /**
   * 检查潜在泄漏
   */
  check(): {
    hasLeak: boolean;
    trackedObjects: number;
    memoryGrowth: number;
    recommendation: string;
  } {
    const result = {
      hasLeak: false,
      trackedObjects: this.objectCount,
      memoryGrowth: 0,
      recommendation: '',
    };

    if (this.snapshots.length < 2) {
      result.recommendation = '需要更多快照数据来进行分析';
      return result;
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    result.memoryGrowth = last.heapUsed - first.heapUsed;

    if (result.memoryGrowth > this.options.growthThreshold) {
      result.hasLeak = true;
      result.recommendation = `检测到内存增长 ${this.formatBytes(result.memoryGrowth)}，可能存在内存泄漏`;
    } else {
      result.recommendation = '未检测到明显的内存泄漏';
    }

    return result;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop();
    this.trackedObjects = new WeakMap();
    this.objectCount = 0;
    this.snapshots = [];
  }
}

/**
 * 创建内存泄漏检测器
 */
export function leakDetector(options?: LeakDetectorOptions): LeakDetector {
  return new LeakDetector(options);
}
