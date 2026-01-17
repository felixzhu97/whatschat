import {
  IAnalytics,
  AnalyticsConfig,
  UserProperties,
  EventProperties,
  Funnel,
} from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";
import { WebEventTracker } from "./trackers/WebEventTracker";
import { WebPageViewTracker } from "./trackers/WebPageViewTracker";
import { WebPerformanceMonitor } from "./trackers/WebPerformanceMonitor";
import { WebErrorTracker } from "./trackers/WebErrorTracker";
import { WebSessionManager } from "./trackers/WebSessionManager";

/**
 * Web 平台分析工具主类
 */
export class WebAnalytics implements IAnalytics {
  readonly event: WebEventTracker;
  readonly session: WebSessionManager;
  readonly performance: WebPerformanceMonitor;
  readonly error: WebErrorTracker;
  readonly pageView: WebPageViewTracker;

  private initialized: boolean = false;

  constructor(config?: AnalyticsConfig) {
    this.event = new WebEventTracker(config?.endpoint);
    this.session = new WebSessionManager();
    this.performance = new WebPerformanceMonitor();
    this.error = new WebErrorTracker();
    this.pageView = new WebPageViewTracker();

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

      // 监听页面浏览事件，自动触发追踪
      if (typeof window !== "undefined") {
        window.addEventListener("analytics:pageview", ((event: CustomEvent) => {
          this.track("page_view", {
            path: event.detail.path,
            title: event.detail.title,
            ...event.detail.properties,
          });
        }) as EventListener);
      }
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

    const step = funnel.steps.find((s: { id: string }) => s.id === stepId);
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
