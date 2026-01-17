import { IEventTracker } from "./IEventTracker";
import { ISessionManager } from "./ISessionManager";
import { IPerformanceMonitor } from "./IPerformanceMonitor";
import { IErrorTracker } from "./IErrorTracker";
import { IPageViewTracker } from "./IPageViewTracker";
import { UserProperties, EventProperties, Funnel } from "../types";

/**
 * 分析配置接口
 */
export interface AnalyticsConfig {
  apiKey?: string;
  endpoint?: string;
  userId?: string;
  enabled?: boolean;
  debug?: boolean;
  flushInterval?: number;
  batchSize?: number;
}

/**
 * 主分析接口
 */
export interface IAnalytics {
  // 子模块
  readonly event: IEventTracker;
  readonly session: ISessionManager;
  readonly performance: IPerformanceMonitor;
  readonly error: IErrorTracker;
  readonly pageView: IPageViewTracker;

  /**
   * 初始化分析工具
   */
  initialize(config: AnalyticsConfig): void;

  /**
   * 追踪事件（快捷方法）
   */
  track(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): void;

  /**
   * 设置用户
   */
  setUser(properties: UserProperties): void;

  /**
   * 清除用户
   */
  clearUser(): void;

  /**
   * 获取当前用户 ID
   */
  getUserId(): string | undefined;

  /**
   * 定义转化漏斗
   */
  defineFunnel(funnel: Funnel): void;

  /**
   * 追踪漏斗步骤
   */
  trackFunnelStep(funnelId: string, stepId: string): void;

  /**
   * 启用分析工具
   */
  enable(): void;

  /**
   * 禁用分析工具
   */
  disable(): void;

  /**
   * 是否已启用
   */
  isEnabled(): boolean;

  /**
   * 立即上报所有数据
   */
  flush(): Promise<void>;

  /**
   * 重置分析工具（清除所有数据）
   */
  reset(): void;

  /**
   * 销毁分析工具
   */
  destroy(): Promise<void>;
}
