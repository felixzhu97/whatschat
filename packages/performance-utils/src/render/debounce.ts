/**
 * 防抖函数
 * 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时
 */

import type { DebounceOptions } from '../types';

/**
 * 防抖函数类型
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

/**
 * 防抖实现
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: Omit<DebounceOptions, 'wait'>
): DebouncedFunction<T> {
  const {
    leading = false,
    trailing = true,
    maxWait,
  } = options || {};

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let result: ReturnType<T> | undefined;

  // 检查是否可以调用
  const shouldInvoke = (time: number): boolean => {
    const timeSinceLastCall = lastCallTime ? time - lastCallTime : Number.MAX_SAFE_INTEGER;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  // 调用函数
  const invokeFunc = (time: number): ReturnType<T> => {
    const args = lastArgs!;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func(...args);
    return result as ReturnType<T>;
  };

  // 前导调用
  const leadingEdge = (time: number): ReturnType<T> | undefined => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : (result as ReturnType<T> | undefined);
  };

  // 计算剩余时间
  const remainingWait = (time: number): number => {
    const timeSinceLastCall = lastCallTime ? time - lastCallTime : 0;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  // 定时器过期
  const timerExpired = (): void => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  };

  // 尾随调用
  const trailingEdge = (time: number): ReturnType<T> | undefined => {
    timeoutId = undefined;

    // 只有在有参数时才调用
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    return result;
  };

  // 取消函数
  const cancel = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    timeoutId = undefined;
    maxTimeoutId = undefined;
  };

  // 立即调用
  const flush = (): ReturnType<T> | undefined => {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };

  // 检查是否正在等待
  const pending = (): boolean => {
    return timeoutId !== undefined;
  };

  // 防抖函数
  const debounced = function (this: any, ...args: Parameters<T>): void {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(time) as any;
      }
      if (maxWait !== undefined) {
        // 设置最大等待定时器
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(time) as any;
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }
  } as DebouncedFunction<T> & {
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
    pending: () => boolean;
  };

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}
