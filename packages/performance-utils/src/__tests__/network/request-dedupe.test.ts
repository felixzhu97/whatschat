import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestDedupe, createDedupeRequest } from '../../network/request-dedupe';

describe('requestDedupe', () => {
  let dedupe: ReturnType<typeof requestDedupe>;

  beforeEach(() => {
    dedupe = requestDedupe();
  });

  it('应该合并相同的请求', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');

    const promise1 = dedupe.dedupe('key1', mockFn);
    const promise2 = dedupe.dedupe('key1', mockFn);
    const promise3 = dedupe.dedupe('key1', mockFn);

    expect(promise1).toBe(promise2);
    expect(promise2).toBe(promise3);

    const result = await promise1;
    expect(result).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该处理不同的请求键', async () => {
    const mockFn = vi.fn().mockImplementation((key: string) =>
      Promise.resolve(`result-${key}`)
    );

    const result1 = await dedupe.dedupe('key1', () => mockFn('key1'));
    const result2 = await dedupe.dedupe('key2', () => mockFn('key2'));

    expect(result1).toBe('result-key1');
    expect(result2).toBe('result-key2');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应该处理错误', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('test error'));

    const promise1 = dedupe.dedupe('key1', mockFn);
    const promise2 = dedupe.dedupe('key1', mockFn);

    expect(promise1).toBe(promise2);

    // 等待 Promise 完成
    try {
      await promise1;
    } catch (error) {
      expect((error as Error).message).toBe('test error');
    }
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该支持取消', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');

    const promise = dedupe.dedupe('key1', mockFn);
    const cancelled = dedupe.cancel('key1');

    expect(cancelled).toBe(true);

    // 等待 Promise 被拒绝
    try {
      await promise;
    } catch (error) {
      expect((error as Error).message).toBe('请求已取消');
    }
  });

  it('应该检查是否有待处理的请求', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');

    const promise = dedupe.dedupe('key1', mockFn);
    expect(dedupe.hasPending('key1')).toBe(true);

    // 等待请求完成
    await promise;
    expect(dedupe.hasPending('key1')).toBe(false);
  });
});

describe('createDedupeRequest', () => {
  it('应该创建去重请求函数', async () => {
    const mockFn = vi
      .fn()
      .mockImplementation((a: number, b: number) =>
        Promise.resolve(a + b)
      );

    const dedupeFn = createDedupeRequest(mockFn);

    const promise1 = dedupeFn(1, 2);
    const promise2 = dedupeFn(1, 2);

    expect(promise1).toBe(promise2);

    const result = await promise1;
    expect(result).toBe(3);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
