import { UserSettings } from "../types";

/**
 * 用户设置模型
 */
export class UserSettingsModel implements UserSettings {
  id: string;
  defaultResolution?: { width: number; height: number };
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

  constructor(data: UserSettings) {
    this.id = data.id;
    this.defaultResolution = data.defaultResolution;
    this.defaultBitrate = data.defaultBitrate;
    this.defaultFrameRate = data.defaultFrameRate;
    this.defaultAudioBitrate = data.defaultAudioBitrate;
    this.defaultBeautyIntensity = data.defaultBeautyIntensity;
    this.defaultFilterPreset = data.defaultFilterPreset;
    this.codecPreference = data.codecPreference;
    this.recordingFormat = data.recordingFormat;
    this.recordingQuality = data.recordingQuality;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * 更新设置
   */
  update(settings: Partial<Omit<UserSettings, "id" | "createdAt" | "updatedAt">>): void {
    Object.assign(this, settings);
    this.updatedAt = Date.now();
  }

  /**
   * 转换为 JSON
   */
  toJSON(): UserSettings {
    return {
      id: this.id,
      defaultResolution: this.defaultResolution,
      defaultBitrate: this.defaultBitrate,
      defaultFrameRate: this.defaultFrameRate,
      defaultAudioBitrate: this.defaultAudioBitrate,
      defaultBeautyIntensity: this.defaultBeautyIntensity,
      defaultFilterPreset: this.defaultFilterPreset,
      codecPreference: this.codecPreference,
      recordingFormat: this.recordingFormat,
      recordingQuality: this.recordingQuality,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
