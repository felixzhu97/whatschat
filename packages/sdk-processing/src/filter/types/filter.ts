/**
 * 滤镜特效类型定义
 */

export type FilterType = "beauty" | "color" | "background" | "ar" | "custom";

export interface BeautyFilterConfig {
  intensity: number; // 0-1
  smoothness?: number; // 0-1
  whitening?: number; // 0-1
}

export interface ColorFilterConfig {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  hue?: number; // -180 to 180
  gamma?: number; // 0.1 to 5.0
}

export interface BackgroundFilterConfig {
  type: "blur" | "image" | "video" | "remove";
  intensity?: number; // 0-1
  imageUrl?: string;
  videoUrl?: string;
}

export interface ARStickerConfig {
  stickerId: string;
  position: "face" | "body" | "background";
  scale?: number; // 0-2
  rotation?: number; // 0-360
}

export interface FilterConfig {
  type: FilterType;
  enabled: boolean;
  beauty?: BeautyFilterConfig;
  color?: ColorFilterConfig;
  background?: BackgroundFilterConfig;
  ar?: ARStickerConfig;
  custom?: Record<string, unknown>;
}

export type FilterChain = FilterConfig[];

export enum FilterState {
  Idle = "idle",
  Processing = "processing",
  Error = "error",
}
