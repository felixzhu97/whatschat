import { IPageViewTracker } from "@whatschat/analytics-core";
import { useAnalyticsStore } from "@whatschat/analytics-core";

/**
 * Web 平台页面浏览追踪器
 */
export class WebPageViewTracker implements IPageViewTracker {
  private currentPath: string | null = null;
  private pageStartTime: number = 0;
  private isTracking: boolean = false;
  private originalPushState: typeof history.pushState;
  private originalReplaceState: typeof history.replaceState;
  private onPopStateHandler: (event: PopStateEvent) => void;

  constructor() {
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;
    this.onPopStateHandler = this.handlePopState.bind(this);

    // 拦截 history.pushState
    history.pushState = new Proxy(this.originalPushState, {
      apply: (target, thisArg, args) => {
        const result = Reflect.apply(target, thisArg, args);
        this.handleRouteChange();
        return result;
      },
    });

    // 拦截 history.replaceState
    history.replaceState = new Proxy(this.originalReplaceState, {
      apply: (target, thisArg, args) => {
        const result = Reflect.apply(target, thisArg, args);
        this.handleRouteChange();
        return result;
      },
    });
  }

  start(): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.currentPath = window.location.pathname;
    this.pageStartTime = Date.now();

    // 监听 popstate 事件
    window.addEventListener("popstate", this.onPopStateHandler);

    // 追踪初始页面
    this.trackPageView(this.currentPath, document.title);
  }

  stop(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
    window.removeEventListener("popstate", this.onPopStateHandler);

    // 恢复原始方法
    history.pushState = this.originalPushState;
    history.replaceState = this.originalReplaceState;
  }

  trackPageView(
    path: string,
    title?: string,
    properties?: Record<string, unknown>
  ): void {
    const eventTracker = useAnalyticsStore.getState();
    if (!eventTracker.enabled) {
      return;
    }

    const session = useAnalyticsStore.getState().currentSession;
    if (session) {
      session.pageViews++;
      useAnalyticsStore.getState().setCurrentSession(session);
    }

    // 通过事件追踪器上报页面浏览事件
    // 这里需要从外部注入事件追踪器，或者通过事件总线
    // 暂时使用自定义事件
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("analytics:pageview", {
          detail: { path, title, properties },
        })
      );
    }

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

  private handlePopState(): void {
    this.handleRouteChange();
  }

  private handleRouteChange(): void {
    if (!this.isTracking) {
      return;
    }

    const newPath = window.location.pathname;
    if (newPath !== this.currentPath) {
      this.trackPageView(newPath, document.title);
    }
  }

  destroy(): void {
    this.stop();
  }
}
