/**
 * 缓存策略
 * 提供 LRU 缓存、时间过期缓存、条件缓存等功能
 */

import type { CacheStrategyOptions, CacheEntry, CacheOptions } from '../types';

/**
 * 缓存策略接口
 */
export interface ICacheStrategy<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, options?: CacheOptions): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * 时间过期缓存
 */
export class TimeExpiryCache<T> implements ICacheStrategy<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * 获取值
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * 设置值
   */
  set(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl ?? this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
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
    return this.cache.size;
  }

  /**
   * 清理过期条目
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * LRU 缓存（最近最少使用）
 */
export class LRUCache<T> implements ICacheStrategy<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * 获取值
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // 更新访问顺序（移动到末尾）
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * 设置值
   */
  set(key: string, value: T, options?: CacheOptions): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 如果超过最大大小，删除最旧的项（第一个）
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const ttl = options?.ttl ?? Infinity;
    const expiresAt = ttl === Infinity ? Infinity : Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
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
    return this.cache.size;
  }
}

/**
 * 创建缓存策略
 */
export function createCacheStrategy<T>(
  options?: CacheStrategyOptions
): ICacheStrategy<T> {
  if (options?.maxSize) {
    return new LRUCache<T>(options.maxSize);
  }

  return new TimeExpiryCache<T>(options?.ttl);
}

/**
 * 创建带获取或设置的缓存
 */
export async function getOrSet<T>(
  cache: ICacheStrategy<T>,
  key: string,
  factory: () => Promise<T> | T,
  options?: CacheOptions
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await factory();
  cache.set(key, value, options);
  return value;
}
