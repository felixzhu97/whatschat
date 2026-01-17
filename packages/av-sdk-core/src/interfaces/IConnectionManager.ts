import { ConnectionState, PeerConnection, ConnectionConfig } from "../types";

/**
 * 连接管理器接口
 */
export interface IConnectionManager {
  /**
   * 连接到信令服务器
   */
  connect(config: ConnectionConfig): Promise<void>;

  /**
   * 断开连接
   */
  disconnect(): Promise<void>;

  /**
   * 加入房间
   */
  joinRoom(roomId: string, peerId: string): Promise<void>;

  /**
   * 离开房间
   */
  leaveRoom(): Promise<void>;

  /**
   * 创建对等连接
   */
  createPeerConnection(peerId: string): Promise<PeerConnection>;

  /**
   * 关闭对等连接
   */
  closePeerConnection(peerId: string): Promise<void>;

  /**
   * 获取连接状态
   */
  getConnectionState(): ConnectionState;

  /**
   * 获取所有对等连接
   */
  getPeerConnections(): Map<string, PeerConnection>;

  /**
   * 事件监听
   */
  on(event: "connection-state-change", handler: (state: ConnectionState) => void): void;
  on(event: "peer-joined", handler: (peerId: string) => void): void;
  on(event: "peer-left", handler: (peerId: string) => void): void;
  on(event: "error", handler: (error: Error) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
