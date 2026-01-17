/**
 * 性能优化工具包类型定义
 */

// ==================== 内存优化类型 ====================

/**
 * 内存泄漏检测器选项
 */
export interface LeakDetectorOptions {
  /** 检查间隔（毫秒） */
  checkInterval?: number;
  /** 内存增长阈值（字节） */
  growthThreshold?: number;
  /** 最大跟踪对象数 */
  maxTrackedObjects?: number;
}

/**
 * 内存快照
 */
export interface MemorySnapshot {
  /** 堆使用量（字节） */
  heapUsed: number;
  /** 堆总量（字节） */
  heapTotal: number;
  /** 外部内存使用量（字节） */
  external?: number;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 垃圾回收事件
 */
export interface GCEvent {
  /** GC 类型 */
  type: 'scavenge' | 'marksweep' | 'incremental' | 'weakcallback';
  /** 执行时间（毫秒） */
  duration: number;
  /** 时间戳 */
  timestamp: number;
  /** 堆使用量变化（字节） */
  heapDelta?: number;
}

// ==================== 渲染优化类型 ====================

/**
 * 防抖选项
 */
export interface DebounceOptions {
  /** 延迟时间（毫秒） */
  wait: number;
  /** 是否立即执行 */
  leading?: boolean;
  /** 是否尾随执行 */
  trailing?: boolean;
  /** 最大等待时间（毫秒） */
  maxWait?: number;
}

/**
 * 节流选项
 */
export interface ThrottleOptions {
  /** 间隔时间（毫秒） */
  wait: number;
  /** 是否立即执行 */
  leading?: boolean;
  /** 是否尾随执行 */
  trailing?: boolean;
}

/**
 * 虚拟滚动选项
 */
export interface VirtualScrollOptions {
  /** 每项高度 */
  itemHeight: number;
  /** 容器高度 */
  containerHeight: number;
  /** 总项数 */
  totalItems: number;
  /** 滚动位置 */
  scrollTop: number;
  /** 缓冲项数 */
  bufferSize?: number;
}

/**
 * 虚拟滚动结果
 */
export interface VirtualScrollResult {
  /** 开始索引 */
  startIndex: number;
  /** 结束索引 */
  endIndex: number;
  /** 总高度 */
  totalHeight: number;
  /** 偏移量 */
  offsetY: number;
  /** 可见项数 */
  visibleCount: number;
}

/**
 * 比较函数类型
 */
export type Comparator<T> = (prev: T, next: T) => boolean;

// ==================== 网络优化类型 ====================

/**
 * 请求去重器键生成函数
 */
export type RequestKeyGenerator<T extends (...args: any[]) => any> = (...args: Parameters<T>) => string;

/**
 * 缓存策略选项
 */
export interface CacheStrategyOptions {
  /** 过期时间（毫秒） */
  ttl?: number;
  /** 最大缓存条目数 */
  maxSize?: number;
  /** 自定义键生成函数 */
  keyGenerator?: <T>(...args: any[]) => string;
}

/**
 * 重试选项
 */
export interface RetryOptions {
  /** 最大重试次数 */
  maxRetries?: number;
  /** 初始延迟（毫秒） */
  initialDelay?: number;
  /** 最大延迟（毫秒） */
  maxDelay?: number;
  /** 退避倍数 */
  backoffFactor?: number;
  /** 重试条件函数 */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * 请求合并选项
 */
export interface RequestMergeOptions<T> {
  /** 合并延迟（毫秒） */
  mergeDelay?: number;
  /** 最大批次大小 */
  maxBatchSize?: number;
  /** 合并函数 */
  mergeFn?: (items: T[]) => Promise<any>;
}

// ==================== 打包优化类型 ====================

/**
 * 懒加载选项
 */
export interface LazyLoadOptions {
  /** 加载超时时间（毫秒） */
  timeout?: number;
  /** 错误处理函数 */
  onError?: (error: Error) => void;
}

/**
 * 代码分割选项
 */
export interface CodeSplitOptions {
  /** 预加载优先级 */
  preload?: boolean;
  /** 错误处理函数 */
  onError?: (error: Error) => void;
}

/**
 * 打包分析结果
 */
export interface BundleAnalysisResult {
  /** 总大小（字节） */
  totalSize: number;
  /** 压缩后大小（字节） */
  gzippedSize?: number;
  /** 文件列表 */
  files: Array<{
    name: string;
    size: number;
    gzippedSize?: number;
  }>;
  /** 最大的块 */
  largestChunks: Array<{
    name: string;
    size: number;
  }>;
}

// ==================== 性能监控类型 ====================

/**
 * Web Vitals 指标
 */
export interface WebVitalsMetrics {
  /** FCP - First Contentful Paint */
  fcp?: number;
  /** LCP - Largest Contentful Paint */
  lcp?: number;
  /** FID - First Input Delay */
  fid?: number;
  /** CLS - Cumulative Layout Shift */
  cls?: number;
  /** TTFB - Time to First Byte */
  ttfb?: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** DOM 加载时间 */
  domContentLoaded?: number;
  /** 页面加载时间 */
  loadComplete?: number;
  /** 资源加载时间 */
  resourceTiming?: any[];
  /** 导航时间 */
  navigationTiming?: any;
  /** Web Vitals */
  webVitals?: WebVitalsMetrics;
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 时间戳 */
  timestamp: number;
  /** URL */
  url: string;
  /** 指标 */
  metrics: PerformanceMetrics;
  /** 用户代理 */
  userAgent?: string;
}

/**
 * 性能预算配置
 */
export interface PerformanceBudget {
  /** 包大小限制（字节） */
  bundleSize?: number;
  /** 加载时间限制（毫秒） */
  loadTime?: number;
  /** FCP 限制（毫秒） */
  fcp?: number;
  /** LCP 限制（毫秒） */
  lcp?: number;
}

/**
 * 预算检查结果
 */
export interface BudgetCheckResult {
  /** 是否通过 */
  passed: boolean;
  /** 违反的项目 */
  violations: Array<{
    metric: string;
    actual: number;
    budget: number;
  }>;
}

// ==================== 资源优化类型 ====================

/**
 * 图片懒加载选项
 */
export interface ImageLazyLoadOptions {
  /** 根边距（用于 IntersectionObserver） */
  rootMargin?: string;
  /** 阈值 */
  threshold?: number | number[];
  /** 占位图片 URL */
  placeholder?: string;
  /** 加载错误时的处理 */
  onError?: (img: HTMLImageElement) => void;
}

/**
 * 预加载选项
 */
export interface PreloadOptions {
  /** 优先级 */
  priority?: 'high' | 'low' | 'auto';
  /** 资源类型 */
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch';
  /** 跨域设置 */
  crossorigin?: 'anonymous' | 'use-credentials';
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 过期时间（毫秒） */
  ttl?: number;
  /** 最大条目数 */
  maxSize?: number;
}

/**
 * 缓存条目
 */
export interface CacheEntry<T> {
  /** 值 */
  value: T;
  /** 过期时间戳 */
  expiresAt: number;
  /** 创建时间戳 */
  createdAt: number;
}
