import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createCacheStrategy,
  TimeExpiryCache,
  LRUCache,
  getOrSet,
} from '../../network/cache-strategy';

describe('TimeExpiryCache', () => {
  let cache: TimeExpiryCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new TimeExpiryCache<string>(1000);
  });

  it('应该设置和获取值', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('应该在过期后返回 undefined', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    vi.advanceTimersByTime(1001);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('应该检查键是否存在', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('应该删除键', () => {
    cache.set('key1', 'value1');
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('应该清空缓存', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('应该清理过期条目', () => {
    cache.set('key1', 'value1', { ttl: 500 });
    cache.set('key2', 'value2', { ttl: 2000 });

    vi.advanceTimersByTime(501);
    const cleaned = cache.cleanExpired();
    expect(cleaned).toBe(1);
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
  });

  vi.useRealTimers();
});

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3);
  });

  it('应该设置和获取值', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('应该移除最旧的条目当超过最大大小', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key4')).toBe('value4');
  });

  it('应该在访问时更新顺序', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    // 访问 key1，使其成为最新的
    cache.get('key1');
    cache.set('key4', 'value4');

    // key1 应该还在，key2 应该被移除
    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeUndefined();
  });
});

describe('getOrSet', () => {
  it('应该获取已存在的值', async () => {
    const cache = createCacheStrategy<string>();
    cache.set('key1', 'value1');

    const result = await getOrSet(cache, 'key1', () =>
      Promise.resolve('new value')
    );

    expect(result).toBe('value1');
  });

  it('应该在值不存在时设置新值', async () => {
    const cache = createCacheStrategy<string>();
    const factory = vi.fn().mockResolvedValue('new value');

    const result = await getOrSet(cache, 'key1', factory);

    expect(result).toBe('new value');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(cache.get('key1')).toBe('new value');
  });
});
