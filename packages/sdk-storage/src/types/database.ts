/**
 * 数据库模型类型定义
 */

export interface CallHistory {
  id: string;
  roomId?: string;
  participants: string[];
  startTime: number;
  endTime?: number;
  duration?: number; // seconds
  type: "audio" | "video";
  status: "success" | "failed" | "missed";
  signalingUrl?: string;
  createdAt: number;
}

export interface UserSettings {
  id: string;
  defaultResolution?: {
    width: number;
    height: number;
  };
  defaultBitrate?: number;
  defaultFrameRate?: number;
  defaultAudioBitrate?: number;
  defaultBeautyIntensity?: number;
  defaultFilterPreset?: string;
  codecPreference?: "hardware" | "software";
  recordingFormat?: string;
  recordingQuality?: "low" | "medium" | "high";
  createdAt: number;
  updatedAt: number;
}

export interface Recording {
  id: string;
  callHistoryId?: string;
  filePath: string;
  fileName: string;
  fileSize: number; // bytes
  duration: number; // seconds
  format: string; // mime type
  resolution?: {
    width: number;
    height: number;
  };
  createdAt: number;
}

export interface DatabaseStats {
  totalCalls: number;
  totalDuration: number; // seconds
  totalRecordings: number;
  totalRecordingsSize: number; // bytes
}
