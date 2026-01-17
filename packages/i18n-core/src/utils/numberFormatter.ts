/**
 * 数字格式化工具
 */

import type { Locale, NumberFormatOptions } from '../types';

/**
 * 格式化数字
 * @param locale - 当前 locale
 * @param value - 要格式化的数字
 * @param options - 格式化选项
 * @returns 格式化后的数字字符串
 */
export function formatNumber(
  locale: Locale,
  value: number,
  options?: NumberFormatOptions
): string {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError('Invalid number value');
  }

  // 默认选项
  const formatOptions: Intl.NumberFormatOptions = {
    ...options,
  };

  // 使用 Intl.NumberFormat 进行格式化
  try {
    const formatter = new Intl.NumberFormat(locale, formatOptions);
    return formatter.format(value);
  } catch (error) {
    // 如果格式化失败，回退到默认格式
    console.warn(`[i18n-core] Failed to format number with locale "${locale}":`, error);
    const fallbackFormatter = new Intl.NumberFormat('en', formatOptions);
    return fallbackFormatter.format(value);
  }
}

/**
 * 格式化货币
 * @param locale - 当前 locale
 * @param value - 要格式化的数字
 * @param currency - 货币代码（如 'USD', 'CNY'）
 * @param options - 额外的格式化选项
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(
  locale: Locale,
  value: number,
  currency: string,
  options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>
): string {
  return formatNumber(locale, value, {
    ...options,
    style: 'currency',
    currency,
  });
}

/**
 * 格式化百分比
 * @param locale - 当前 locale
 * @param value - 要格式化的数字（0-1 之间的小数或百分比值）
 * @param options - 额外的格式化选项
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(
  locale: Locale,
  value: number,
  options?: Omit<Intl.NumberFormatOptions, 'style'>
): string {
  return formatNumber(locale, value, {
    ...options,
    style: 'percent',
  });
}
