import { FilterConfig, FilterChain, FilterState } from "../types";

/**
 * 滤镜管理器接口
 */
export interface IFilterManager {
  /**
   * 应用滤镜
   */
  applyFilter(config: FilterConfig): Promise<void>;

  /**
   * 移除滤镜
   */
  removeFilter(type: string): Promise<void>;

  /**
   * 应用滤镜链
   */
  applyFilterChain(chain: FilterChain): Promise<void>;

  /**
   * 清除所有滤镜
   */
  clearFilters(): Promise<void>;

  /**
   * 启用/禁用滤镜
   */
  toggleFilter(type: string, enabled: boolean): Promise<void>;

  /**
   * 获取当前滤镜列表
   */
  getActiveFilters(): FilterConfig[];

  /**
   * 获取滤镜状态
   */
  getFilterState(): FilterState;

  /**
   * 处理视频帧
   */
  processVideoFrame(frame: VideoFrame): Promise<VideoFrame | null>;

  /**
   * 处理视频流
   */
  processVideoStream(stream: MediaStream): MediaStream;

  /**
   * 事件监听
   */
  on(event: "filter-applied", handler: (config: FilterConfig) => void): void;
  on(event: "filter-removed", handler: (type: string) => void): void;
  on(event: "filter-state-change", handler: (state: FilterState) => void): void;
  on(event: "error", handler: (error: Error) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
