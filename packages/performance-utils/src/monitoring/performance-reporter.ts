/**
 * 性能报告器
 * 生成性能报告、性能趋势分析
 */

import type { PerformanceReport, PerformanceMetrics } from '../types';
import { MetricsCollector } from './metrics-collector';

/**
 * 性能报告器
 */
export class PerformanceReporter {
  private collector: MetricsCollector;
  private reports: PerformanceReport[] = [];
  private maxReports: number = 100;

  constructor(collector?: MetricsCollector) {
    this.collector = collector || new MetricsCollector();
  }

  /**
   * 生成性能报告
   */
  async generateReport(): Promise<PerformanceReport> {
    // 收集所有指标
    this.collector.collectNavigationTiming();
    this.collector.collectResourceTiming();

    const metrics = this.collector.getMetrics();

    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: this.getCurrentUrl(),
      metrics,
      userAgent: this.getUserAgent(),
    };

    this.reports.push(report);

    // 只保留最近 N 个报告
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    return report;
  }

  /**
   * 获取性能趋势分析
   */
  getTrendAnalysis(): {
    averageMetrics: PerformanceMetrics;
    trendMetrics: {
      metric: string;
      trend: 'improving' | 'degrading' | 'stable';
      change: number;
    }[];
    recommendations: string[];
  } {
    if (this.reports.length < 2) {
      return {
        averageMetrics: {},
        trendMetrics: [],
        recommendations: ['需要更多报告数据来进行趋势分析'],
      };
    }

    const recent = this.reports.slice(-10);
    const old = this.reports.slice(0, Math.max(0, this.reports.length - 10));

    // 计算平均指标
    const averageMetrics = this.calculateAverageMetrics(recent);

    // 分析趋势
    const trendMetrics: Array<{
      metric: string;
      trend: 'improving' | 'degrading' | 'stable';
      change: number;
    }> = [];

    // 分析 Web Vitals 趋势
    if (recent[0]?.metrics.webVitals && old[0]?.metrics.webVitals) {
      const recentVitals = recent[0].metrics.webVitals!;
      const oldVitals = old[0].metrics.webVitals!;

      // FCP 趋势
      if (recentVitals.fcp !== undefined && oldVitals.fcp !== undefined) {
        const change = recentVitals.fcp - oldVitals.fcp;
        trendMetrics.push({
          metric: 'FCP',
          trend: change < 0 ? 'improving' : change > 0 ? 'degrading' : 'stable',
          change,
        });
      }

      // LCP 趋势
      if (recentVitals.lcp !== undefined && oldVitals.lcp !== undefined) {
        const change = recentVitals.lcp - oldVitals.lcp;
        trendMetrics.push({
          metric: 'LCP',
          trend: change < 0 ? 'improving' : change > 0 ? 'degrading' : 'stable',
          change,
        });
      }

      // FID 趋势
      if (recentVitals.fid !== undefined && oldVitals.fid !== undefined) {
        const change = recentVitals.fid - oldVitals.fid;
        trendMetrics.push({
          metric: 'FID',
          trend: change < 0 ? 'improving' : change > 0 ? 'degrading' : 'stable',
          change,
        });
      }

      // CLS 趋势
      if (recentVitals.cls !== undefined && oldVitals.cls !== undefined) {
        const change = recentVitals.cls - oldVitals.cls;
        trendMetrics.push({
          metric: 'CLS',
          trend: change < 0 ? 'improving' : change > 0 ? 'degrading' : 'stable',
          change,
        });
      }
    }

    // 生成建议
    const recommendations: string[] = [];
    trendMetrics.forEach(({ metric, trend, change }) => {
      if (trend === 'degrading') {
        recommendations.push(
          `${metric} 性能下降 ${Math.abs(change).toFixed(2)}ms，建议检查相关优化`
        );
      }
    });

    return {
      averageMetrics,
      trendMetrics,
      recommendations,
    };
  }

  /**
   * 计算平均指标
   */
  private calculateAverageMetrics(
    reports: PerformanceReport[]
  ): PerformanceMetrics {
    if (reports.length === 0) {
      return {};
    }

    const metrics: PerformanceMetrics = {};

    // 计算 Web Vitals 平均值
    const vitals = reports
      .map((r) => r.metrics.webVitals)
      .filter((v) => v !== undefined);

    if (vitals.length > 0) {
      metrics.webVitals = {
        fcp: this.average(vitals.map((v) => v?.fcp).filter((v) => v !== undefined) as number[]),
        lcp: this.average(vitals.map((v) => v?.lcp).filter((v) => v !== undefined) as number[]),
        fid: this.average(vitals.map((v) => v?.fid).filter((v) => v !== undefined) as number[]),
        cls: this.average(vitals.map((v) => v?.cls).filter((v) => v !== undefined) as number[]),
        ttfb: this.average(vitals.map((v) => v?.ttfb).filter((v) => v !== undefined) as number[]),
      };
    }

    return metrics;
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * 获取当前 URL
   */
  private getCurrentUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  }

  /**
   * 获取用户代理
   */
  private getUserAgent(): string | undefined {
    if (typeof window !== 'undefined' && window.navigator) {
      return window.navigator.userAgent;
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env['USER_AGENT'];
    }
    return undefined;
  }

  /**
   * 获取所有报告
   */
  getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * 清除所有报告
   */
  clear(): void {
    this.reports = [];
  }
}

/**
 * 创建性能报告器
 */
export function performanceReporter(
  collector?: MetricsCollector
): PerformanceReporter {
  return new PerformanceReporter(collector);
}
