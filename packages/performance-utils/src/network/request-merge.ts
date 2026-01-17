/**
 * 请求合并
 * 批量请求合并和拆解
 */

import type { RequestMergeOptions } from '../types';

/**
 * 请求合并器
 */
export class RequestMerger<T> {
  private pendingItems: T[] = [];
  private timeoutId?: ReturnType<typeof setTimeout>;
  private options: Required<Omit<RequestMergeOptions<T>, 'mergeFn'>> & {
    mergeFn?: RequestMergeOptions<T>['mergeFn'];
  };

  constructor(options?: RequestMergeOptions<T>) {
    this.options = {
      mergeDelay: options?.mergeDelay ?? 50,
      maxBatchSize: options?.maxBatchSize ?? 10,
      mergeFn: options?.mergeFn,
      ...options,
    };
  }

  /**
   * 添加请求项
   */
  add(item: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestItem = {
        item,
        resolve,
        reject,
      };

      this.pendingItems.push(requestItem as any);

      // 如果达到最大批次大小，立即处理
      if (this.pendingItems.length >= this.options.maxBatchSize) {
        this.flush();
        return;
      }

      // 清除之前的定时器
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      // 设置新的定时器
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.options.mergeDelay);
    });
  }

  /**
   * 立即处理所有待处理的请求
   */
  async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    if (this.pendingItems.length === 0) {
      return;
    }

    const items = this.pendingItems.splice(0);
    const itemValues = items.map((item: any) => item.item);

    try {
      let results: any[];

      if (this.options.mergeFn) {
        // 使用自定义合并函数
        results = await this.options.mergeFn(itemValues);
        // 如果返回的是单个结果，包装成数组
        if (!Array.isArray(results)) {
          results = [results];
        }
      } else {
        // 默认行为：返回原始项
        results = itemValues;
      }

      // 分发结果
      items.forEach((requestItem: any, index: number) => {
        requestItem.resolve(results[index]);
      });
    } catch (error) {
      // 分发错误
      items.forEach((requestItem: any) => {
        requestItem.reject(error);
      });
    }
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAll(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.pendingItems.forEach((item: any) => {
      item.reject(new Error('请求已取消'));
    });

    this.pendingItems = [];
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.cancelAll();
  }
}

/**
 * 创建请求合并函数
 */
export function requestMerge<T>(
  mergeFn?: (items: T[]) => Promise<any[]>,
  options?: Omit<RequestMergeOptions<T>, 'mergeFn'>
) {
  const merger = new RequestMerger<T>({
    ...options,
    mergeFn: mergeFn as any,
  });

  return (items: T[]): Promise<any[]> => {
    return Promise.all(items.map((item) => merger.add(item)));
  };
}

/**
 * 批量请求助手
 */
export async function batchRequest<T, R>(
  items: T[],
  batchFn: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await batchFn(batch);
    results.push(...batchResults);
  }

  return results;
}
