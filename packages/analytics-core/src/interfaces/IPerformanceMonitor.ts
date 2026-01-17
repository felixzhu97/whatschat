import {
  PerformanceMetrics,
  PerformanceCallback,
  ResourceMetric,
  APIMetric,
} from "../types";

/**
 * 性能监控器接口
 */
export interface IPerformanceMonitor {
  /**
   * 开始监控性能
   */
  start(): void;

  /**
   * 停止监控性能
   */
  stop(): void;

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics;

  /**
   * 追踪资源加载
   */
  trackResource(metric: ResourceMetric): void;

  /**
   * 追踪 API 请求
   */
  trackAPI(metric: APIMetric): void;

  /**
   * 清空性能指标
   */
  clearMetrics(): void;

  /**
   * 添加性能指标回调
   */
  onMetrics(callback: PerformanceCallback): void;

  /**
   * 移除性能指标回调
   */
  offMetrics(callback: PerformanceCallback): void;
}
