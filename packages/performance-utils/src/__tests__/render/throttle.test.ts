import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle } from '../../render/throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('应该限制函数执行频率', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该支持取消', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    (throttledFn as any).cancel();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该支持立即刷新', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 300);

    throttledFn();
    // 再次调用以设置 pending
    throttledFn();
    (throttledFn as any).flush();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('应该返回函数结果', () => {
    const fn = vi.fn(() => 'result');
    const throttledFn = throttle(fn, 300);

    const result = throttledFn();
    expect(result).toBe('result');
  });
});
