/**
 * I18n 配置接口
 */

import type { Locale, Messages } from '../types';
import type { IMessageLoader } from './IMessageLoader';

/**
 * I18n 配置选项
 */
export interface II18nConfig {
  /**
   * 默认 locale（如 'en', 'zh-CN'）
   */
  defaultLocale: Locale;

  /**
   * Fallback locale，当消息在当前 locale 中不存在时使用
   */
  fallbackLocale?: Locale;

  /**
   * 预加载的消息对象，键为 locale，值为消息对象
   */
  messages?: Messages;

  /**
   * 异步消息加载器，用于动态加载语言包
   */
  messageLoader?: IMessageLoader;

  /**
   * 是否在开发模式下启用严格模式（检查消息格式等）
   */
  strictMode?: boolean;

  /**
   * 是否缓存已加载的消息
   */
  cacheMessages?: boolean;

  /**
   * 自定义日期时间格式选项
   */
  dateTimeFormats?: Record<string, Intl.DateTimeFormatOptions>;

  /**
   * 自定义数字格式选项
   */
  numberFormats?: Record<string, Intl.NumberFormatOptions>;
}
