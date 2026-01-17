/**
 * 节流函数
 * 规定在一个单位时间内，只能触发一次函数
 */

import type { ThrottleOptions } from '../types';

/**
 * 节流函数类型
 */
export type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

/**
 * 节流实现
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: Omit<ThrottleOptions, 'wait'>
): ThrottledFunction<T> {
  const {
    leading = true,
    trailing = true,
  } = options || {};

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | undefined;
  let result: ReturnType<T> | undefined;

  // 调用函数
  const invokeFunc = (time: number): ReturnType<T> => {
    const args = lastArgs!;
    const thisArg = undefined;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
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
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastInvoke;
    return timeWaiting;
  };

  // 定时器过期
  const timerExpired = (): void => {
    const time = Date.now();
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    timeoutId = undefined;
    lastArgs = undefined;
  };

  // 取消函数
  const cancel = (): void => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    timeoutId = undefined;
  };

  // 立即调用
  const flush = (): ReturnType<T> | undefined => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    if (lastArgs) {
      return invokeFunc(Date.now());
    }
    return result;
  };

  // 检查是否正在等待
  const pending = (): boolean => {
    return timeoutId !== undefined;
  };

  // 节流函数
  const throttled = function (this: any, ...args: Parameters<T>): void {
    const time = Date.now();

    lastArgs = args;

    if (lastInvokeTime === 0 && leading === false) {
      lastInvokeTime = time;
    }

    const timeSinceLastInvoke = time - lastInvokeTime;
    const remaining = remainingWait(time);

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      lastInvokeTime = time;
      return invokeFunc(time) as any;
    }

    if (timeoutId === undefined && trailing !== false) {
      timeoutId = setTimeout(timerExpired, remaining);
    }
  } as ThrottledFunction<T> & {
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
    pending: () => boolean;
  };

  throttled.cancel = cancel;
  throttled.flush = flush;
  throttled.pending = pending;

  return throttled;
}
