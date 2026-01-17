/**
 * 代码分割辅助工具
 * 提供路由级代码分割工具
 */

import type { CodeSplitOptions } from '../types';

/**
 * 代码分割辅助函数
 * 用于路由级代码分割
 */
export function codeSplit<T>(
  importFn: (route: string) => Promise<{ default: T }>,
  route: string,
  options?: CodeSplitOptions
): Promise<T> {
  return new Promise((resolve, reject) => {
    // 设置预加载
    if (options?.preload) {
      // 预加载下一个可能的路由
      // 这里可以根据实际需求实现预加载逻辑
    }

    importFn(route)
      .then((module) => {
        resolve(module.default);
      })
      .catch((error) => {
        if (options?.onError) {
          options.onError(error);
        }
        reject(error);
      });
  });
}

/**
 * 创建路由代码分割器
 */
export function createRouteSplitter<T = any>(
  routeMap: Record<string, () => Promise<{ default: T }>>,
  options?: CodeSplitOptions
) {
  return {
    /**
     * 加载指定路由
     */
    loadRoute: async (route: string): Promise<T> => {
      const importFn = routeMap[route];

      if (!importFn) {
        throw new Error(`路由 ${route} 不存在`);
      }

      return codeSplit(
        async () => importFn(),
        route,
        options
      );
    },

    /**
     * 预加载指定路由
     */
    preloadRoute: async function preloadRoute(this: any, route: string): Promise<void> {
      const importFn = routeMap[route];

      if (importFn) {
        await importFn().catch((error) => {
          if (options?.onError) {
            options.onError(error);
          }
        });
      }
    },

    /**
     * 预加载多个路由
     */
    preloadRoutes: async function preloadRoutes(this: any, routes: string[]): Promise<void> {
      await Promise.all(
        routes.map((route) => this.preloadRoute(route))
      );
    },
  };
}

/**
 * 动态导入辅助
 */
export async function dynamicImport<T>(
  path: string
): Promise<T> {
  try {
    const module = await import(path);
    return module.default || module as T;
  } catch (error) {
    throw new Error(`无法导入模块: ${path}`);
  }
}
