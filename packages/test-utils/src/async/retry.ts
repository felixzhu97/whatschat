/**
 * 重试工具
 * 提供重试机制和带超时的 Promise
 */

/**
 * 重试选项
 */
export interface RetryOptions {
  /**
   * 最大重试次数
   * @default 3
   */
  maxAttempts?: number;
  /**
   * 重试间隔（毫秒）
   * @default 1000
   */
  delay?: number;
  /**
   * 是否在每次重试前延迟
   * @default true
   */
  delayBeforeRetry?: boolean;
}

/**
 * 重试函数执行
 * 
 * @param fn 要执行的函数
 * @param options 重试选项
 * @returns Promise，返回函数执行结果
 * @throws 所有重试都失败后抛出最后一个错误
 * 
 * @example
 * ```typescript
 * const result = await retry(() => fetchData(), {
 *   maxAttempts: 3,
 *   delay: 1000
 * });
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T> | T,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay: delayMs = 1000,
    delayBeforeRetry = true,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxAttempts) {
        if (delayBeforeRetry) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
  }

  throw lastError;
}

/**
 * 带超时的 Promise
 * 
 * @param promise 要执行的 Promise
 * @param timeoutMs 超时时间（毫秒）
 * @param errorMessage 超时时的错误消息
 * @returns Promise，在超时时间内完成则返回结果，否则抛出错误
 * 
 * @example
 * ```typescript
 * const result = await timeout(fetchData(), 5000, 'Request timeout');
 * ```
 */
export async function timeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          errorMessage || `Operation timed out after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
