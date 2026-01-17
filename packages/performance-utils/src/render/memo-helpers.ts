/**
 * React.memo 辅助工具
 * 提供深度比较函数和自定义比较函数生成器
 */

import type { Comparator } from '../types';

/**
 * 深度比较函数
 * 用于 React.memo 的比较函数
 */
export function deepEqual<T>(prev: T, next: T): boolean {
  if (prev === next) {
    return true;
  }

  if (
    prev == null ||
    next == null ||
    typeof prev !== 'object' ||
    typeof next !== 'object'
  ) {
    return false;
  }

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!nextKeys.includes(key)) {
      return false;
    }

    const prevValue = (prev as any)[key];
    const nextValue = (next as any)[key];

    if (typeof prevValue === 'object' && typeof nextValue === 'object') {
      if (!deepEqual(prevValue, nextValue)) {
        return false;
      }
    } else if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

/**
 * 浅比较函数
 * 用于 React.memo 的浅比较
 */
export function shallowEqual<T>(prev: T, next: T): boolean {
  if (prev === next) {
    return true;
  }

  if (
    prev == null ||
    next == null ||
    typeof prev !== 'object' ||
    typeof next !== 'object'
  ) {
    return false;
  }

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!nextKeys.includes(key)) {
      return false;
    }

    if ((prev as any)[key] !== (next as any)[key]) {
      return false;
    }
  }

  return true;
}

/**
 * 创建基于指定键的比较函数
 * 只比较指定的属性
 */
export function createMemoComparator<T>(
  keys: (keyof T)[]
): Comparator<T> {
  return (prev: T, next: T): boolean => {
    if (prev === next) {
      return true;
    }

    for (const key of keys) {
      if (prev[key] !== next[key]) {
        return false;
      }
    }

    return true;
  };
}

/**
 * 创建基于自定义比较器的比较函数
 */
export function createCustomComparator<T>(
  comparator: (prev: T, next: T) => boolean
): Comparator<T> {
  return comparator;
}

/**
 * 忽略指定键的比较函数
 * 比较时忽略指定的属性
 */
export function createIgnoringComparator<T>(
  keysToIgnore: (keyof T)[]
): Comparator<T> {
  return (prev: T, next: T): boolean => {
    if (prev === next) {
      return true;
    }

    if (
      prev == null ||
      next == null ||
      typeof prev !== 'object' ||
      typeof next !== 'object'
    ) {
      return false;
    }

    const prevKeys = Object.keys(prev) as (keyof T)[];
    const nextKeys = Object.keys(next) as (keyof T)[];

    const filteredPrevKeys = prevKeys.filter((key) => !keysToIgnore.includes(key));
    const filteredNextKeys = nextKeys.filter((key) => !keysToIgnore.includes(key));

    if (filteredPrevKeys.length !== filteredNextKeys.length) {
      return false;
    }

    for (const key of filteredPrevKeys) {
      if (!filteredNextKeys.includes(key)) {
        return false;
      }

      if (prev[key] !== next[key]) {
        return false;
      }
    }

    return true;
  };
}
