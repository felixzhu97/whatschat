import { FilterConfig } from "../types";

/**
 * 滤镜适配器接口
 */
export interface IFilterAdapter {
  /**
   * 初始化适配器
   */
  initialize(): Promise<void>;

  /**
   * 应用滤镜
   */
  applyFilter(frame: VideoFrame, config: FilterConfig): Promise<VideoFrame | null>;

  /**
   * 处理视频流
   */
  processStream(stream: MediaStream, config: FilterConfig): MediaStream;

  /**
   * 释放资源
   */
  release(): Promise<void>;

  /**
   * 检查滤镜支持
   */
  isFilterSupported(type: string): boolean;
}
