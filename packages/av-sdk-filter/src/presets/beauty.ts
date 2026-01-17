import { BeautyFilterConfig, FilterConfig } from "../types";

/**
 * 美颜滤镜预设
 */
export const beautyPresets: Record<string, BeautyFilterConfig> = {
  natural: {
    intensity: 0.3,
    smoothness: 0.2,
    whitening: 0.1,
  },
  moderate: {
    intensity: 0.5,
    smoothness: 0.4,
    whitening: 0.3,
  },
  strong: {
    intensity: 0.7,
    smoothness: 0.6,
    whitening: 0.5,
  },
};

/**
 * 创建美颜滤镜配置
 */
export function createBeautyFilter(
  preset: keyof typeof beautyPresets = "moderate"
): FilterConfig {
  return {
    type: "beauty",
    enabled: true,
    beauty: beautyPresets[preset],
  };
}
