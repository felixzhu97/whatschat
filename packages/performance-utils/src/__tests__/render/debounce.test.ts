import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../render/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('应该延迟执行函数', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该在多次调用时只执行最后一次', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该支持立即执行选项', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300, { leading: true });

    debouncedFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该支持取消', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    (debouncedFn as any).cancel();

    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it('应该支持立即刷新', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 300);

    debouncedFn();
    (debouncedFn as any).flush();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('应该返回函数结果', () => {
    const fn = vi.fn(() => 'result');
    const debouncedFn = debounce(fn, 300);

    let result: any;
    debouncedFn();
    result = (debouncedFn as any).flush();

    expect(result).toBe('result');
  });
});
