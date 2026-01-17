/**
 * 日期时间格式化工具
 */

import type { Locale, DateTimeFormatOptions, RelativeTimeFormatOptions } from '../types';

/**
 * 预设日期格式选项
 */
const PRESET_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  },
  medium: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  full: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  },
};

/**
 * 格式化日期时间
 * @param locale - 当前 locale
 * @param date - 日期对象、时间戳或日期字符串
 * @param options - 格式化选项
 * @returns 格式化后的日期时间字符串
 */
export function formatDate(
  locale: Locale,
  date: Date | number | string,
  options?: DateTimeFormatOptions
): string {
  // 转换为 Date 对象
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    throw new TypeError('Invalid date type');
  }

  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    throw new RangeError('Invalid date value');
  }

  // 处理预设格式
  let formatOptions: Intl.DateTimeFormatOptions = {};

  if (options?.format && PRESET_FORMATS[options.format]) {
    formatOptions = { ...PRESET_FORMATS[options.format] };
  }

  // 合并用户提供的选项
  if (options) {
    const { format: _, ...restOptions } = options;
    formatOptions = { ...formatOptions, ...restOptions };
  }

  // 使用 Intl.DateTimeFormat 进行格式化
  try {
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    return formatter.format(dateObj);
  } catch (error) {
    // 如果格式化失败，回退到默认格式
    console.warn(`[i18n-core] Failed to format date with locale "${locale}":`, error);
    const fallbackFormatter = new Intl.DateTimeFormat('en', formatOptions);
    return fallbackFormatter.format(dateObj);
  }
}

/**
 * 格式化相对时间（如 "2 days ago"）
 * @param locale - 当前 locale
 * @param options - 相对时间格式化选项
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(
  locale: Locale,
  options: RelativeTimeFormatOptions
): string {
  const { unit, value, numeric = 'auto' } = options;

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric });
    return formatter.format(value, unit);
  } catch (error) {
    console.warn(`[i18n-core] Failed to format relative time with locale "${locale}":`, error);
    const fallbackFormatter = new Intl.RelativeTimeFormat('en', { numeric });
    return fallbackFormatter.format(value, unit);
  }
}
