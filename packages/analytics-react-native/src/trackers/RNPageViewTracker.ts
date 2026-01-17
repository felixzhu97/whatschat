import { IPageViewTracker } from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";

/**
 * React Native 平台页面浏览追踪器
 * 
 * 注意：需要与路由库（如 React Navigation）集成才能自动追踪页面浏览
 */
export class RNPageViewTracker implements IPageViewTracker {
  private currentPath: string | null = null;
  private pageStartTime: number = 0;
  private isTracking: boolean = false;

  constructor() {
    // React Native 平台需要手动追踪或通过路由库集成
  }

  start(): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.pageStartTime = Date.now();
  }

  stop(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
  }

  trackPageView(
    path: string,
    title?: string,
    properties?: Record<string, unknown>
  ): void {
    if (!this.isTracking) {
      return;
    }

    const store = useAnalyticsStore.getState();
    if (!store.enabled) {
      return;
    }

    const session = store.currentSession;
    if (session) {
      session.pageViews++;
      store.setCurrentSession(session);
    }

    // 触发页面浏览事件
    // 实际使用中可以通过事件总线或其他机制通知主类追踪事件
    this.currentPath = path;
    this.pageStartTime = Date.now();
  }

  getCurrentPath(): string | null {
    return this.currentPath;
  }

  getPageDuration(): number {
    if (this.pageStartTime === 0) {
      return 0;
    }
    return Date.now() - this.pageStartTime;
  }

  /**
   * 与 React Navigation 集成
   * 在导航状态变化时调用此方法
   */
  handleNavigationStateChange(
    prevState: unknown,
    currentState: unknown,
    action: unknown
  ): void {
    // 需要根据实际的导航状态结构来提取当前路由信息
    // 这里提供接口，具体实现需要根据使用的路由库来适配
  }

  destroy(): void {
    this.stop();
  }
}
