import { MediaConfig, MediaStreamConfig, MediaDeviceInfo } from "../types";

/**
 * 媒体管理器接口
 */
export interface IMediaManager {
  /**
   * 获取用户媒体流
   */
  getUserMedia(config: MediaStreamConfig): Promise<MediaStream>;

  /**
   * 停止媒体流
   */
  stopMediaStream(stream: MediaStream): void;

  /**
   * 获取可用的媒体设备
   */
  getDevices(): Promise<MediaDeviceInfo[]>;

  /**
   * 切换音频设备
   */
  switchAudioInput(deviceId: string): Promise<void>;

  /**
   * 切换视频设备
   */
  switchVideoInput(deviceId: string): Promise<void>;

  /**
   * 静音/取消静音
   */
  toggleMute(): boolean;

  /**
   * 开启/关闭视频
   */
  toggleVideo(): boolean;

  /**
   * 获取当前媒体流
   */
  getLocalStream(): MediaStream | null;

  /**
   * 事件监听
   */
  on(event: "device-changed", handler: () => void): void;
  on(event: "mute-changed", handler: (muted: boolean) => void): void;
  on(event: "video-changed", handler: (enabled: boolean) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
