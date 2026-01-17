/**
 * 内存使用分析器
 * 提供内存快照和内存使用报告
 */

import type { MemorySnapshot } from '../types';

/**
 * 内存使用分析器
 */
export class MemoryAnalyzer {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots: number = 50;

  /**
   * 获取内存快照
   */
  takeSnapshot(): MemorySnapshot {
    const snapshot = this.getCurrentMemory();

    this.snapshots.push(snapshot);

    // 只保留最近 N 个快照
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * 获取当前内存使用情况
   */
  private getCurrentMemory(): MemorySnapshot {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      // 浏览器环境（Chrome）
      const memory = (performance as any).memory;
      return {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        timestamp: Date.now(),
      };
    }

    if (typeof process !== 'undefined' && process.memoryUsage) {
      // Node.js 环境
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

  /**
   * 分析内存使用趋势
   */
  analyze(snapshot?: MemorySnapshot): {
    current: MemorySnapshot;
    peak: MemorySnapshot | null;
    average: MemorySnapshot | null;
    trend: 'increasing' | 'decreasing' | 'stable';
    growth: number;
    growthRate: number;
  } {
    const current = snapshot || this.getCurrentMemory();

    if (this.snapshots.length === 0) {
      return {
        current,
        peak: null,
        average: null,
        trend: 'stable',
        growth: 0,
        growthRate: 0,
      };
    }

    // 找出峰值
    const peak = this.snapshots.reduce((max, snapshot) =>
      snapshot.heapUsed > max.heapUsed ? snapshot : max
    );

    // 计算平均值
    const totalHeapUsed = this.snapshots.reduce(
      (sum, snapshot) => sum + snapshot.heapUsed,
      0
    );
    const averageHeapUsed = totalHeapUsed / this.snapshots.length;

    const totalHeapTotal = this.snapshots.reduce(
      (sum, snapshot) => sum + snapshot.heapTotal,
      0
    );
    const averageHeapTotal = totalHeapTotal / this.snapshots.length;

    const average: MemorySnapshot = {
      heapUsed: averageHeapUsed,
      heapTotal: averageHeapTotal,
      timestamp: Date.now(),
    };

    // 计算增长趋势
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const growth = current.heapUsed - first.heapUsed;
    const timeDiff = current.timestamp - first.timestamp;
    const growthRate = timeDiff > 0 ? (growth / timeDiff) * 1000 : 0; // 每秒增长字节数

    // 判断趋势
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (this.snapshots.length >= 3) {
      const recent = this.snapshots.slice(-3);
      const recentGrowth = recent[recent.length - 1].heapUsed - recent[0].heapUsed;
      const threshold = current.heapUsed * 0.05; // 5% 阈值

      if (recentGrowth > threshold) {
        trend = 'increasing';
      } else if (recentGrowth < -threshold) {
        trend = 'decreasing';
      }
    }

    return {
      current,
      peak,
      average,
      trend,
      growth,
      growthRate,
    };
  }

  /**
   * 生成内存使用报告
   */
  generateReport(): {
    summary: {
      currentMemory: string;
      peakMemory: string;
      averageMemory: string;
      totalSnapshots: number;
      trend: string;
      growthRate: string;
    };
    snapshots: MemorySnapshot[];
    recommendations: string[];
  } {
    const analysis = this.analyze();
    const recommendations: string[] = [];

    // 生成建议
    if (analysis.trend === 'increasing' && analysis.growthRate > 1024 * 1024) {
      recommendations.push('检测到内存持续增长，建议检查是否存在内存泄漏');
    }

    if (analysis.peak && analysis.current.heapUsed > analysis.peak.heapUsed * 0.9) {
      recommendations.push('当前内存使用接近峰值，建议优化内存使用');
    }

    if (analysis.current.heapUsed / analysis.current.heapTotal > 0.8) {
      recommendations.push('堆内存使用率超过 80%，建议释放不必要的对象');
    }

    return {
      summary: {
        currentMemory: this.formatBytes(analysis.current.heapUsed),
        peakMemory: analysis.peak ? this.formatBytes(analysis.peak.heapUsed) : 'N/A',
        averageMemory: analysis.average
          ? this.formatBytes(analysis.average.heapUsed)
          : 'N/A',
        totalSnapshots: this.snapshots.length,
        trend: this.getTrendLabel(analysis.trend),
        growthRate: `${this.formatBytes(analysis.growthRate)}/秒`,
      },
      snapshots: this.snapshots.slice(),
      recommendations,
    };
  }

  /**
   * 获取趋势标签
   */
  private getTrendLabel(trend: 'increasing' | 'decreasing' | 'stable'): string {
    const labels = {
      increasing: '增长',
      decreasing: '下降',
      stable: '稳定',
    };
    return labels[trend];
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 清除所有快照
   */
  clear(): void {
    this.snapshots = [];
  }

  /**
   * 设置最大快照数
   */
  setMaxSnapshots(max: number): void {
    this.maxSnapshots = max;
    if (this.snapshots.length > max) {
      this.snapshots = this.snapshots.slice(-max);
    }
  }
}

/**
 * 创建内存分析器
 */
export function memoryAnalyzer(): MemoryAnalyzer {
  return new MemoryAnalyzer();
}
