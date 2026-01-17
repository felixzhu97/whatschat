/**
 * 录制管理器接口
 */
export interface RecordingConfig {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

export interface RecordingSegment {
  id: string;
  startTime: number;
  endTime: number;
  blob: Blob;
}

export interface IRecordManager {
  /**
   * 开始录制
   */
  startRecording(stream: MediaStream, config?: RecordingConfig): Promise<void>;

  /**
   * 停止录制
   */
  stopRecording(): Promise<Blob>;

  /**
   * 暂停录制
   */
  pauseRecording(): void;

  /**
   * 恢复录制
   */
  resumeRecording(): void;

  /**
   * 获取录制状态
   */
  getRecordingState(): "inactive" | "recording" | "paused";

  /**
   * 获取录制的分段
   */
  getSegments(): RecordingSegment[];

  /**
   * 合并分段
   */
  mergeSegments(segments: RecordingSegment[]): Promise<Blob>;

  /**
   * 事件监听
   */
  on(event: "recording-started", handler: () => void): void;
  on(event: "recording-stopped", handler: (blob: Blob) => void): void;
  on(event: "recording-paused", handler: () => void): void;
  on(event: "recording-resumed", handler: () => void): void;
  on(event: "segment-created", handler: (segment: RecordingSegment) => void): void;

  /**
   * 移除事件监听
   */
  off(event: string, handler: (...args: unknown[]) => void): void;
}
