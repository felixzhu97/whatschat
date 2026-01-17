/**
 * 请求去重器
 * 相同请求合并，防止重复 API 调用
 */

import type { RequestKeyGenerator } from '../types';

/**
 * 请求去重器
 */
export class RequestDedupe {
  private pendingRequests: Map<
    string,
    {
      promise: Promise<any>;
      resolve: (value: any) => void;
      reject: (reason: any) => void;
    }
  > = new Map();

  /**
   * 去重请求
   */
  dedupe<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // 如果已经有相同的请求在进行，返回该请求的 Promise
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      return existingRequest.promise;
    }

    // 创建新的请求
    let resolve!: (value: T) => void;
    let reject!: (reason: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.pendingRequests.set(key, {
      promise,
      resolve,
      reject,
    });

    // 异步执行请求
    Promise.resolve()
      .then(() => requestFn())
      .then((result) => {
        resolve(result);
        this.pendingRequests.delete(key);
      })
      .catch((error) => {
        reject(error);
        this.pendingRequests.delete(key);
      });

    return promise;
  }

  /**
   * 根据参数生成键
   */
  static createKeyGenerator<T extends (...args: any[]) => any>(
    fn?: RequestKeyGenerator<T>
  ): RequestKeyGenerator<T> {
    return fn || ((...args) => JSON.stringify(args));
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAll(): void {
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error('请求已取消'));
    });
    this.pendingRequests.clear();
  }

  /**
   * 取消指定键的请求
   */
  cancel(key: string): boolean {
    const request = this.pendingRequests.get(key);
    if (request) {
      request.reject(new Error('请求已取消'));
      this.pendingRequests.delete(key);
      return true;
    }
    return false;
  }

  /**
   * 检查是否有待处理的请求
   */
  hasPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }

  /**
   * 获取所有待处理的请求键
   */
  getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.cancelAll();
  }
}

/**
 * 创建请求去重器
 */
export function requestDedupe(): RequestDedupe {
  return new RequestDedupe();
}

/**
 * 创建带键生成器的请求去重器
 */
export function createDedupeRequest<T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  keyGenerator?: RequestKeyGenerator<T>
): T {
  const dedupe = new RequestDedupe();
  const generateKey = RequestDedupe.createKeyGenerator(keyGenerator);

  return ((...args: Parameters<T>) => {
    const key = generateKey(...args);
    return dedupe.dedupe(key, () => requestFn(...args));
  }) as T;
}
