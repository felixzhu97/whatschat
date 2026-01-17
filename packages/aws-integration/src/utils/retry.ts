import { normalizeAWSError, isRetryableError } from './errors';

/**
 * 重试选项
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: (error: unknown) => boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

/**
 * 计算重试延迟
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * 等待指定时间
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带重试的执行函数
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const normalizedError = normalizeAWSError(error);

      // 如果不是最后一次尝试且错误可重试
      if (attempt < opts.maxAttempts && opts.retryableErrors(normalizedError)) {
        const delay = calculateDelay(attempt, opts);
        await sleep(delay);
        continue;
      }

      // 最后一次尝试或不可重试的错误，直接抛出
      throw normalizedError;
    }
  }

  // 理论上不会执行到这里
  throw normalizeAWSError(lastError);
}