import { FilterConfig, FilterChain } from "../types";

/**
 * 验证滤镜配置
 */
export function validateFilterConfig(config: FilterConfig): boolean {
  if (!config.type || typeof config.enabled !== "boolean") {
    return false;
  }

  switch (config.type) {
    case "beauty":
      if (config.beauty) {
        const { intensity } = config.beauty;
        if (intensity < 0 || intensity > 1) {
          return false;
        }
      }
      break;
    case "color":
      if (config.color) {
        const { brightness, contrast, saturation, hue } = config.color;
        if (
          (brightness !== undefined && (brightness < -100 || brightness > 100)) ||
          (contrast !== undefined && (contrast < -100 || contrast > 100)) ||
          (saturation !== undefined && (saturation < -100 || saturation > 100)) ||
          (hue !== undefined && (hue < -180 || hue > 180))
        ) {
          return false;
        }
      }
      break;
  }

  return true;
}

/**
 * 合并滤镜链
 */
export function mergeFilterChains(chains: FilterChain[]): FilterChain {
  const merged: FilterConfig[] = [];
  const typeMap = new Map<string, FilterConfig>();

  for (const chain of chains) {
    for (const filter of chain) {
      typeMap.set(filter.type, filter);
    }
  }

  return Array.from(typeMap.values());
}

/**
 * 排序滤镜链（按优先级）
 */
export function sortFilterChain(chain: FilterChain): FilterChain {
  const order: Record<string, number> = {
    beauty: 1,
    color: 2,
    background: 3,
    ar: 4,
    custom: 5,
  };

  return [...chain].sort((a, b) => {
    const orderA = order[a.type] ?? 99;
    const orderB = order[b.type] ?? 99;
    return orderA - orderB;
  });
}
