import {
  IAnalytics,
  AnalyticsConfig,
  UserProperties,
  EventProperties,
  Funnel,
} from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";
import { RNEventTracker } from "./trackers/RNEventTracker";
import { RNPageViewTracker } from "./trackers/RNPageViewTracker";
import { RNPerformanceMonitor } from "./trackers/RNPerformanceMonitor";
import { RNErrorTracker } from "./trackers/RNErrorTracker";
import { RNSessionManager } from "./trackers/RNSessionManager";

/**
 * React Native 平台分析工具主类
 */
export class ReactNativeAnalytics implements IAnalytics {
  readonly event: RNEventTracker;
  readonly session: RNSessionManager;
  readonly performance: RNPerformanceMonitor;
  readonly error: RNErrorTracker;
  readonly pageView: RNPageViewTracker;

  private initialized: boolean = false;

  constructor(config?: AnalyticsConfig) {
    this.event = new RNEventTracker(config?.endpoint);
    this.session = new RNSessionManager();
    this.performance = new RNPerformanceMonitor();
    this.error = new RNErrorTracker();
    this.pageView = new RNPageViewTracker();

    if (config) {
      this.initialize(config);
    }
  }

  initialize(config: AnalyticsConfig): void {
    if (this.initialized) {
      console.warn("Analytics already initialized");
      return;
    }

    this.initialized = true;

    // 更新 store 配置
    useAnalyticsStore.getState().setConfig({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      debug: config.debug,
    });

    useAnalyticsStore.getState().setEnabled(config.enabled ?? true);
    useAnalyticsStore.getState().setUserId(config.userId);

    // 初始化会话管理器
    this.session.initialize({
      timeout: 30 * 60 * 1000, // 30 分钟
      checkInterval: 60 * 1000, // 1 分钟
    });

    // 开始追踪
    if (config.enabled !== false) {
      this.pageView.start();
      this.performance.start();
      this.error.start();
    }

    if (config.debug) {
      console.log("[Analytics] Initialized", config);
    }
  }

  track(
    eventName: string,
    properties?: EventProperties,
    context?: Record<string, unknown>
  ): void {
    if (!this.isEnabled()) {
      return;
    }

    // 延长会话
    this.session.extendSession();

    // 更新会话事件计数
    const currentSession = this.session.getCurrentSession();
    if (currentSession) {
      currentSession.events++;
      useAnalyticsStore.getState().setCurrentSession(currentSession);
    }

    this.event.track(eventName, properties, context);
  }

  setUser(properties: UserProperties): void {
    const userId = properties.id || useAnalyticsStore.getState().userId;
    useAnalyticsStore.getState().setUser({
      id: userId!,
      properties,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 更新会话的用户 ID
    const session = this.session.getCurrentSession();
    if (session) {
      session.userId = userId;
      useAnalyticsStore.getState().setCurrentSession(session);
    }
  }

  clearUser(): void {
    useAnalyticsStore.getState().setUser(null);
    useAnalyticsStore.getState().setUserId(undefined);

    // 更新会话
    const session = this.session.getCurrentSession();
    if (session) {
      session.userId = undefined;
      useAnalyticsStore.getState().setCurrentSession(session);
    }
  }

  getUserId(): string | undefined {
    return useAnalyticsStore.getState().userId;
  }

  defineFunnel(funnel: Funnel): void {
    useAnalyticsStore.getState().addFunnel(funnel);
  }

  trackFunnelStep(funnelId: string, stepId: string): void {
    const funnel = useAnalyticsStore.getState().getFunnel(funnelId);
    if (!funnel) {
      console.warn(`Funnel ${funnelId} not found`);
      return;
    }

    const step = funnel.steps.find((s) => s.id === stepId);
    if (!step) {
      console.warn(`Step ${stepId} not found in funnel ${funnelId}`);
      return;
    }

    this.track(step.event, {
      funnelId,
      stepId,
      ...step.properties,
    });
  }

  enable(): void {
    useAnalyticsStore.getState().setEnabled(true);
    this.pageView.start();
    this.performance.start();
    this.error.start();
  }

  disable(): void {
    useAnalyticsStore.getState().setEnabled(false);
    this.pageView.stop();
    this.performance.stop();
    this.error.stop();
  }

  isEnabled(): boolean {
    return useAnalyticsStore.getState().enabled;
  }

  async flush(): Promise<void> {
    await this.event.flush();
  }

  reset(): void {
    useAnalyticsStore.getState().reset();
    this.event.clear();
    this.performance.clearMetrics();
    this.error.clearErrors();
    this.session.endSession();
  }

  async destroy(): Promise<void> {
    // 结束会话
    this.session.endSession();

    // 停止追踪
    this.pageView.stop();
    this.performance.stop();
    this.error.stop();

    // 刷新队列
    await this.flush();

    // 销毁所有组件
    (this.event as any).destroy?.();
    (this.session as any).destroy?.();
    (this.performance as any).destroy?.();
    (this.error as any).destroy?.();
    (this.pageView as any).destroy?.();

    this.initialized = false;
  }
}
