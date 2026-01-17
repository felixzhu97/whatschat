/**
 * 流管理器接口
 */
export interface IStreamManager {
  /**
   * 推送本地流到对等连接
   */
  pushLocalStream(peerId: string, stream: MediaStream): Promise<void>;

  /**
   * 拉取远程流
   */
  pullRemoteStream(peerId: string): Promise<MediaStream | null>;

  /**
   * 添加远程流
   */
  addRemoteStream(peerId: string, stream: MediaStream): void;

  /**
   * 移除远程流
   */
  removeRemoteStream(peerId: string): void;

  /**
   * 获取远程流
   */
  getRemoteStream(peerId: string): MediaStream | null;

  /**
   * 获取所有远程流
   */
  getAllRemoteStreams(): Map<string, MediaStream>;

  /**
   * 事件监听
   */
  on(event: "stream-added", handler: (peerId: string, stream: MediaStream) => void): void;
  on(event: "stream-removed", handler: (peerId: string) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
