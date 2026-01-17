import { Recording } from "../types";

/**
 * 录制文件模型
 */
export class RecordingModel implements Recording {
  id: string;
  callHistoryId?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  duration: number;
  format: string;
  resolution?: { width: number; height: number };
  createdAt: number;

  constructor(data: Recording) {
    this.id = data.id;
    this.callHistoryId = data.callHistoryId;
    this.filePath = data.filePath;
    this.fileName = data.fileName;
    this.fileSize = data.fileSize;
    this.duration = data.duration;
    this.format = data.format;
    this.resolution = data.resolution;
    this.createdAt = data.createdAt;
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Recording {
    return {
      id: this.id,
      callHistoryId: this.callHistoryId,
      filePath: this.filePath,
      fileName: this.fileName,
      fileSize: this.fileSize,
      duration: this.duration,
      format: this.format,
      resolution: this.resolution,
      createdAt: this.createdAt,
    };
  }
}
