/**
 * 垃圾回收监控器
 * 追踪 GC 事件和内存使用趋势（Node.js 环境）
 */

import type { GCEvent } from '../types';

/**
 * 垃圾回收监控器
 * 注意：仅在 Node.js 环境中可用
 */
export class GCMonitor {
  private gcEvents: GCEvent[] = [];
  private listeners: Map<string, Set<(event: GCEvent) => void>> = new Map();
  private isMonitoring: boolean = false;

  /**
   * 开始监控
   */
  start(): void {
    if (this.isMonitoring) {
      return;
    }

    if (typeof process === 'undefined' || !process.on) {
      console.warn('[GCMonitor] 仅在 Node.js 环境中可用');
      return;
    }

    // 启用 GC 统计（需要 --expose-gc 标志）
    if (typeof global !== 'undefined' && (global as any).gc) {
      this.isMonitoring = true;
      this.startTracking();
    } else {
      console.warn('[GCMonitor] 需要 --expose-gc 标志来启用 GC 监控');
    }
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * 开始跟踪 GC 事件
   */
  private startTracking(): void {
    // Node.js 的 v8 模块提供了 GC 事件
    try {
      const v8 = require('v8');
      if (v8.getHeapStatistics) {
        const previousStats = v8.getHeapStatistics();

        // 定期检查堆统计变化
        const interval = setInterval(() => {
          if (!this.isMonitoring) {
            clearInterval(interval);
            return;
          }

          const currentStats = v8.getHeapStatistics();
          const heapDelta = currentStats.used_heap_size - previousStats.used_heap_size;

          // 如果堆使用量显著减少，可能是发生了 GC
          if (heapDelta < -1024 * 1024) {
            // 超过 1MB 的减少，可能是 GC
            const event: GCEvent = {
              type: 'marksweep', // 通常是大对象 GC
              duration: 0, // 无法精确测量
              timestamp: Date.now(),
              heapDelta,
            };

            this.recordGCEvent(event);
          }

          Object.assign(previousStats, currentStats);
        }, 1000);
      }
    } catch (error) {
      // v8 模块不可用
      console.warn('[GCMonitor] 无法访问 v8 模块');
    }
  }

  /**
   * 手动触发 GC（仅用于测试）
   */
  forceGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      const before = this.getHeapSize();
      (global as any).gc();
      const after = this.getHeapSize();
      const delta = before - after;

      if (delta > 0) {
        const event: GCEvent = {
          type: 'marksweep',
          duration: 0,
          timestamp: Date.now(),
          heapDelta: -delta,
        };

        this.recordGCEvent(event);
      }
    }
  }

  /**
   * 记录 GC 事件
   */
  private recordGCEvent(event: GCEvent): void {
    this.gcEvents.push(event);

    // 只保留最近 100 个事件
    if (this.gcEvents.length > 100) {
      this.gcEvents.shift();
    }

    // 触发监听器
    const listeners = this.listeners.get('gc') || new Set();
    listeners.forEach((listener) => listener(event));
  }

  /**
   * 添加事件监听器
   */
  on(event: 'gc', listener: (event: GCEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: 'gc', listener: (event: GCEvent) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 获取 GC 事件统计
   */
  getStats(): {
    totalEvents: number;
    averageHeapDelta: number;
    eventsByType: Record<string, number>;
    recentEvents: GCEvent[];
  } {
    const eventsByType: Record<string, number> = {};
    let totalHeapDelta = 0;

    this.gcEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      if (event.heapDelta) {
        totalHeapDelta += Math.abs(event.heapDelta);
      }
    });

    return {
      totalEvents: this.gcEvents.length,
      averageHeapDelta:
        this.gcEvents.length > 0 ? totalHeapDelta / this.gcEvents.length : 0,
      eventsByType,
      recentEvents: this.gcEvents.slice(-10),
    };
  }

  /**
   * 获取当前堆大小
   */
  private getHeapSize(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stop();
    this.gcEvents = [];
    this.listeners.clear();
  }
}

/**
 * 创建垃圾回收监控器
 */
export function gcMonitor(): GCMonitor {
  return new GCMonitor();
}
