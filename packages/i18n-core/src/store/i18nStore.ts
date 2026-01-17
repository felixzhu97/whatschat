/**
 * I18n 状态存储
 */

import type { Locale, Messages, NestedMessages } from '../types';
import type { II18nConfig, IMessageLoader } from '../interfaces';
import { normalizeLocale } from '../utils/localeUtils';

/**
 * I18n Store 类，用于管理 locale 和消息
 */
export class I18nStore {
  private currentLocale: Locale;
  private fallbackLocale: Locale;
  private messages: Messages;
  private messageCache: Map<Locale, NestedMessages>;
  private messageLoader?: IMessageLoader;
  private cacheMessages: boolean;

  /**
   * 创建 I18n Store 实例
   * @param config - I18n 配置
   */
  constructor(config: II18nConfig) {
    this.currentLocale = normalizeLocale(config.defaultLocale);
    this.fallbackLocale = normalizeLocale(config.fallbackLocale || config.defaultLocale);
    this.messages = config.messages || {};
    this.messageCache = new Map();
    this.messageLoader = config.messageLoader;
    this.cacheMessages = config.cacheMessages !== false;

    // 将预加载的消息添加到缓存
    if (this.messages) {
      for (const [locale, messages] of Object.entries(this.messages)) {
        this.messageCache.set(normalizeLocale(locale), messages);
      }
    }
  }

  /**
   * 获取当前 locale
   * @returns 当前 locale 字符串
   */
  getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * 设置当前 locale
   * @param locale - 要设置的 locale
   */
  setLocale(locale: Locale): void {
    this.currentLocale = normalizeLocale(locale);
  }

  /**
   * 获取 fallback locale
   * @returns fallback locale 字符串
   */
  getFallbackLocale(): Locale {
    return this.fallbackLocale;
  }

  /**
   * 设置 fallback locale
   * @param locale - 要设置的 fallback locale
   */
  setFallbackLocale(locale: Locale): void {
    this.fallbackLocale = normalizeLocale(locale);
  }

  /**
   * 获取消息对象
   * @param locale - locale 字符串（可选，默认使用当前 locale）
   * @returns 消息对象
   */
  getMessages(locale?: Locale): NestedMessages {
    const targetLocale = normalizeLocale(locale || this.currentLocale);
    return this.messageCache.get(targetLocale) || this.messageCache.get(this.fallbackLocale) || {};
  }

  /**
   * 设置消息对象
   * @param locale - locale 字符串
   * @param messages - 消息对象
   */
  setMessages(locale: Locale, messages: NestedMessages): void {
    const normalizedLocale = normalizeLocale(locale);
    this.messageCache.set(normalizedLocale, messages);
    this.messages[normalizedLocale] = messages;
  }

  /**
   * 异步加载消息
   * @param locale - 要加载的 locale
   * @returns Promise，解析为是否加载成功
   */
  async loadMessages(locale: Locale): Promise<boolean> {
    const normalizedLocale = normalizeLocale(locale);

    // 如果已缓存，直接返回
    if (this.messageCache.has(normalizedLocale)) {
      return true;
    }

    // 如果没有消息加载器，返回 false
    if (!this.messageLoader) {
      return false;
    }

    try {
      const messages = await this.messageLoader.load(normalizedLocale);
      if (this.cacheMessages) {
        this.messageCache.set(normalizedLocale, messages);
        this.messages[normalizedLocale] = messages;
      }
      return true;
    } catch (error) {
      console.error(`[i18n-core] Failed to load messages for locale "${normalizedLocale}":`, error);
      return false;
    }
  }

  /**
   * 检查消息是否已加载
   * @param locale - 要检查的 locale
   * @returns 是否已加载
   */
  hasMessages(locale: Locale): boolean {
    const normalizedLocale = normalizeLocale(locale);
    return this.messageCache.has(normalizedLocale);
  }

  /**
   * 清除消息缓存
   * @param locale - 要清除的 locale（可选，如果不提供则清除所有）
   */
  clearCache(locale?: Locale): void {
    if (locale) {
      const normalizedLocale = normalizeLocale(locale);
      this.messageCache.delete(normalizedLocale);
      delete this.messages[normalizedLocale];
    } else {
      this.messageCache.clear();
      // 保留预加载的消息
      for (const [localeKey, messages] of Object.entries(this.messages)) {
        this.messageCache.set(normalizeLocale(localeKey), messages);
      }
    }
  }

  /**
   * 获取所有已加载的 locales
   * @returns 已加载的 locale 列表
   */
  getLoadedLocales(): Locale[] {
    return Array.from(this.messageCache.keys());
  }
}

/**
 * 创建 I18n Store 实例
 * @param config - I18n 配置
 * @returns I18n Store 实例
 */
export function createI18nStore(config: II18nConfig): I18nStore {
  return new I18nStore(config);
}
