import { EventEmitter } from "../utils/events";
import { SignalingMessage } from "../types";

/**
 * 信令客户端抽象类
 */
export abstract class SignalingClient extends EventEmitter {
  protected url: string | null = null;
  protected connected: boolean = false;

  /**
   * 连接到信令服务器
   */
  abstract connect(url: string): Promise<void>;

  /**
   * 断开连接
   */
  abstract disconnect(): Promise<void>;

  /**
   * 发送消息
   */
  abstract send(message: SignalingMessage): Promise<void>;

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 获取连接 URL
   */
  getUrl(): string | null {
    return this.url;
  }
}
