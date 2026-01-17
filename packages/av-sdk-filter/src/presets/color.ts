import { ColorFilterConfig, FilterConfig } from "../types";

/**
 * 色彩滤镜预设
 */
export const colorPresets: Record<string, ColorFilterConfig> = {
  vivid: {
    saturation: 20,
    contrast: 10,
  },
  soft: {
    saturation: -10,
    contrast: -5,
    brightness: 5,
  },
  warm: {
    hue: 10,
    saturation: 15,
    brightness: 5,
  },
  cool: {
    hue: -10,
    saturation: 10,
    brightness: -5,
  },
  blackwhite: {
    saturation: -100,
    contrast: 10,
  },
};

/**
 * 创建色彩滤镜配置
 */
export function createColorFilter(
  preset: keyof typeof colorPresets = "vivid"
): FilterConfig {
  return {
    type: "color",
    enabled: true,
    color: colorPresets[preset],
  };
}
