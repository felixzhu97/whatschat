/**
 * 屏幕共享管理器接口
 */
export interface ScreenShareConfig {
  audio?: boolean;
  video?: boolean | MediaTrackConstraints;
  surface?: "screen" | "window" | "browser";
}

export interface IScreenShareManager {
  /**
   * 开始屏幕共享
   */
  startScreenShare(config?: ScreenShareConfig): Promise<MediaStream>;

  /**
   * 停止屏幕共享
   */
  stopScreenShare(): void;

  /**
   * 获取屏幕共享状态
   */
  isScreenSharing(): boolean;

  /**
   * 获取屏幕共享流
   */
  getScreenShareStream(): MediaStream | null;

  /**
   * 切换屏幕共享
   */
  toggleScreenShare(config?: ScreenShareConfig): Promise<MediaStream | null>;

  /**
   * 事件监听
   */
  on(event: "screen-share-started", handler: (stream: MediaStream) => void): void;
  on(event: "screen-share-stopped", handler: () => void): void;
  on(event: "screen-share-error", handler: (error: Error) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
