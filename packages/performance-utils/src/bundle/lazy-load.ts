/**
 * 懒加载辅助工具
 * 提供动态导入包装器和组件懒加载辅助
 */

import type { LazyLoadOptions } from '../types';

/**
 * 懒加载包装器
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>,
  options?: LazyLoadOptions
): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<T>((resolve, reject) => {
    // 设置超时
    if (options?.timeout) {
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          cancelled = true;
          const error = new Error('懒加载超时');
          if (options.onError) {
            options.onError(error);
          }
          reject(error);
        }
      }, options.timeout);
    }

    // 动态导入
    importFn()
      .then((module) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!cancelled) {
          resolve(module.default);
        }
      })
      .catch((error) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!cancelled) {
          if (options?.onError) {
            options.onError(error);
          }
          reject(error);
        }
      });
  });

  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}

/**
 * 预加载模块
 */
export async function preloadModule<T>(
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  return importFn();
}

/**
 * 创建懒加载组件工厂（用于 React）
 */
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: T }>,
  options?: LazyLoadOptions
) {
  // 这是一个辅助函数，实际使用时需要 React.lazy
  return {
    importFn,
    options,
    // 在实际使用时，应该这样调用：
    // React.lazy(() => createLazyComponent(...).importFn())
  };
}
