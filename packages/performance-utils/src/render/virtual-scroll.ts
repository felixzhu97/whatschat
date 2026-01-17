/**
 * 虚拟滚动工具
 * 计算可见区域和渲染范围，适用于长列表
 */

import type { VirtualScrollOptions, VirtualScrollResult } from '../types';

/**
 * 虚拟滚动计算函数
 */
export function useVirtualScroll(
  options: VirtualScrollOptions
): VirtualScrollResult {
  const {
    itemHeight,
    containerHeight,
    totalItems,
    scrollTop,
    bufferSize = 3,
  } = options;

  // 计算可见项数
  const visibleCount = Math.ceil(containerHeight / itemHeight);

  // 计算开始索引（考虑缓冲区）
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - bufferSize
  );

  // 计算结束索引（考虑缓冲区）
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleCount + bufferSize * 2
  );

  // 计算总高度
  const totalHeight = totalItems * itemHeight;

  // 计算偏移量
  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    visibleCount,
  };
}

/**
 * 虚拟滚动计算辅助函数
 * 计算滚动相关的数据
 */
export function calculateVirtualScroll(options: VirtualScrollOptions): {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  totalHeight: number;
  offsetY: number;
} {
  const result = useVirtualScroll(options);
  const visibleItems: number[] = [];

  for (let i = result.startIndex; i <= result.endIndex; i++) {
    visibleItems.push(i);
  }

  return {
    ...result,
    visibleItems,
  };
}
