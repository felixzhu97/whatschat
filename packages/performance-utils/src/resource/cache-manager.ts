/**
 * 缓存管理器
 * 统一的缓存接口、多种缓存策略
 */

import type { CacheOptions, CacheEntry } from '../types';
import { TimeExpiryCache, LRUCache, ICacheStrategy } from '../network/cache-strategy';

/**
 * 缓存管理器
 */
export class CacheManager<T> {
  private cache: ICacheStrategy<T>;

  constructor(
    strategy: 'time-expiry' | 'lru' = 'time-expiry',
    options?: CacheOptions
  ) {
    if (strategy === 'lru') {
      this.cache = new LRUCache<T>(options?.maxSize || 100);
    } else {
      this.cache = new TimeExpiryCache<T>(options?.ttl);
    }
  }

  /**
   * 获取值
   */
  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  /**
   * 设置值
   */
  set(key: string, value: T, options?: CacheOptions): void {
    this.cache.set(key, value, options);
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除值
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size();
  }

  /**
   * 获取或设置值
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * 批量获取
   */
  getMany(keys: string[]): Map<string, T | undefined> {
    const result = new Map<string, T | undefined>();
    keys.forEach((key) => {
      result.set(key, this.get(key));
    });
    return result;
  }

  /**
   * 批量设置
   */
  setMany(
    entries: Array<{ key: string; value: T }>,
    options?: CacheOptions
  ): void {
    entries.forEach(({ key, value }) => {
      this.set(key, value, options);
    });
  }

  /**
   * 批量删除
   */
  deleteMany(keys: string[]): number {
    let deleted = 0;
    keys.forEach((key) => {
      if (this.delete(key)) {
        deleted++;
      }
    });
    return deleted;
  }

  /**
   * 清理过期条目（仅适用于 TimeExpiryCache）
   */
  cleanExpired(): number {
    if (this.cache instanceof TimeExpiryCache) {
      return this.cache.cleanExpired();
    }
    return 0;
  }
}

/**
 * 创建缓存管理器
 */
export function cacheManager<T>(
  strategy?: 'time-expiry' | 'lru',
  options?: CacheOptions
): CacheManager<T> {
  return new CacheManager<T>(strategy, options);
}
