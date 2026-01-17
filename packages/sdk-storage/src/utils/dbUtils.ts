import { CallHistory, UserSettings, Recording } from "../types";

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证通话记录数据
 */
export function validateCallHistory(data: Partial<CallHistory>): boolean {
  if (!data.participants || data.participants.length === 0) {
    return false;
  }
  if (!data.startTime || data.startTime <= 0) {
    return false;
  }
  if (!data.type || !["audio", "video"].includes(data.type)) {
    return false;
  }
  if (!data.status || !["success", "failed", "missed"].includes(data.status)) {
    return false;
  }
  return true;
}

/**
 * 验证用户设置数据
 */
export function validateUserSettings(data: Partial<UserSettings>): boolean {
  if (data.defaultBitrate && data.defaultBitrate < 0) {
    return false;
  }
  if (data.defaultFrameRate && (data.defaultFrameRate < 0 || data.defaultFrameRate > 120)) {
    return false;
  }
  if (data.defaultBeautyIntensity && (data.defaultBeautyIntensity < 0 || data.defaultBeautyIntensity > 1)) {
    return false;
  }
  if (data.recordingQuality && !["low", "medium", "high"].includes(data.recordingQuality)) {
    return false;
  }
  return true;
}

/**
 * 验证录制文件数据
 */
export function validateRecording(data: Partial<Recording>): boolean {
  if (!data.filePath || !data.fileName) {
    return false;
  }
  if (data.fileSize === undefined || data.fileSize < 0) {
    return false;
  }
  if (data.duration === undefined || data.duration < 0) {
    return false;
  }
  if (!data.format) {
    return false;
  }
  return true;
}
