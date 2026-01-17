/**
 * 页面浏览追踪器接口
 */
export interface IPageViewTracker {
  /**
   * 开始页面追踪
   */
  start(): void;

  /**
   * 停止页面追踪
   */
  stop(): void;

  /**
   * 追踪页面浏览
   */
  trackPageView(
    path: string,
    title?: string,
    properties?: Record<string, unknown>
  ): void;

  /**
   * 获取当前页面路径
   */
  getCurrentPath(): string | null;

  /**
   * 获取页面停留时间（毫秒）
   */
  getPageDuration(): number;
}
