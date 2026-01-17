/**
 * 重试机制
 * 提供指数退避重试、自定义重试策略
 */

import type { RetryOptions } from '../types';

/**
 * 重试函数
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options || {};

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 如果不应该重试，直接抛出错误
      if (!shouldRetry(error)) {
        throw error;
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw error;
      }

      // 等待后重试
      await sleep(delay);

      // 计算下一次延迟（指数退避）
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * 固定延迟重试
 */
export async function retryWithFixedDelay<T>(
  fn: () => Promise<T>,
  options?: Omit<RetryOptions, 'backoffFactor' | 'maxDelay'>
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    shouldRetry = () => true,
  } = options || {};

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error)) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      await sleep(initialDelay);
    }
  }

  throw lastError;
}

/**
 * 线性退避重试
 */
export async function retryWithLinearBackoff<T>(
  fn: () => Promise<T>,
  options?: Omit<RetryOptions, 'backoffFactor'>
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options || {};

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error)) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw error;
      }

      // 线性增加延迟
      const delay = Math.min(initialDelay * (attempt + 1), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 创建重试函数
 */
export function createRetryFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return ((...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}
