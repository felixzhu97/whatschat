/**
 * 性能监控类型定义
 */

export interface PerformanceMetrics {
  // 页面加载指标
  pageLoadTime?: number;
  domContentLoaded?: number;
  firstByte?: number;

  // Web Vitals (Web 平台)
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;

  // 资源加载指标
  resources?: ResourceMetric[];

  // API 请求指标
  apiRequests?: APIMetric[];
}

export interface ResourceMetric {
  name: string;
  type: string;
  duration: number;
  size?: number;
  startTime: number;
}

export interface APIMetric {
  url: string;
  method: string;
  duration: number;
  statusCode?: number;
  success: boolean;
  timestamp: number;
}

export type PerformanceCallback = (metrics: PerformanceMetrics) => void | Promise<void>;
