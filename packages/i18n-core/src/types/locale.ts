/**
 * Locale 相关类型定义
 */

/**
 * Locale 字符串类型（如 'en', 'zh-CN', 'en-US'）
 */
export type Locale = string;

/**
 * 支持的 Locale 列表
 */
export type SupportedLocale = string;

/**
 * Locale 配置选项
 */
export interface LocaleOptions {
  /**
   * 当前 locale
   */
  locale: Locale;

  /**
   * 是否使用标准化格式（如 'zh-CN' -> 'zh-Hans-CN'）
   */
  normalized?: boolean;
}

/**
 * Locale 信息
 */
export interface LocaleInfo {
  /**
   * Locale 代码（如 'en-US'）
   */
  code: Locale;

  /**
   * 语言代码（如 'en'）
   */
  language: string;

  /**
   * 地区代码（如 'US'），可能为空
   */
  region?: string;

  /**
   * 脚本代码（如 'Hans'），可能为空
   */
  script?: string;
}
