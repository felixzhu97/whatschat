/**
 * I18n 核心包主导出文件
 */

// Types
export * from './types';

// Interfaces
export * from './interfaces';

// Utils
export * from './utils';

// Store
export * from './store';

// 便捷函数：创建 I18n 实例并返回格式化器
import { createI18nStore } from './store';
import { formatMessage as formatMessageUtil, formatDate as formatDateUtil, formatRelativeTime as formatRelativeTimeUtil } from './utils';
import { formatNumber as formatNumberUtil, formatCurrency, formatPercent } from './utils';
import type { Locale, MessageDescriptor, DateTimeFormatOptions, NumberFormatOptions, RelativeTimeFormatOptions } from './types';
import type { II18nConfig } from './interfaces';
import type { IFormatter } from './interfaces';

/**
 * I18n 实例，提供格式化功能
 */
export class I18n implements IFormatter {
  private store: ReturnType<typeof createI18nStore>;

  constructor(config: II18nConfig) {
    this.store = createI18nStore(config);
  }

  /**
   * 格式化消息
   */
  formatMessage(
    id: string | MessageDescriptor,
    values?: Record<string, any>,
    defaultMessage?: string
  ): string {
    return formatMessageUtil(
      this.store.getLocale(),
      this.store.getMessages(),
      id,
      values,
      defaultMessage
    );
  }

  /**
   * 格式化日期时间
   */
  formatDate(
    date: Date | number | string,
    options?: DateTimeFormatOptions
  ): string {
    return formatDateUtil(this.store.getLocale(), date, options);
  }

  /**
   * 格式化数字
   */
  formatNumber(
    value: number,
    options?: NumberFormatOptions
  ): string {
    return formatNumberUtil(this.store.getLocale(), value, options);
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(
    options: RelativeTimeFormatOptions
  ): string {
    return formatRelativeTimeUtil(this.store.getLocale(), options);
  }

  /**
   * 获取当前 locale
   */
  getLocale(): Locale {
    return this.store.getLocale();
  }

  /**
   * 设置当前 locale
   */
  setLocale(locale: Locale): void {
    this.store.setLocale(locale);
  }

  /**
   * 获取 Store 实例（用于高级用法）
   */
  getStore() {
    return this.store;
  }
}

/**
 * 创建 I18n 实例
 * @param config - I18n 配置
 * @returns I18n 实例
 */
export function createI18n(config: II18nConfig): I18n {
  return new I18n(config);
}

// 导出便捷的格式化函数
/**
 * 格式化消息（使用默认配置的便捷函数）
 * @deprecated 推荐使用 createI18n 创建实例后调用 formatMessage
 */
export function formatMessage(
  i18n: I18n,
  id: string | MessageDescriptor,
  values?: Record<string, any>,
  defaultMessage?: string
): string {
  return i18n.formatMessage(id, values, defaultMessage);
}
