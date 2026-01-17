/**
 * 格式化器接口
 */

import type { Locale, MessageDescriptor, FormatMessageOptions, DateTimeFormatOptions, NumberFormatOptions, RelativeTimeFormatOptions } from '../types';

/**
 * 格式化器接口，提供消息、日期、数字等格式化功能
 */
export interface IFormatter {
  /**
   * 格式化消息
   * @param id - 消息 ID 或描述符
   * @param values - 消息参数（用于变量插值）
   * @param defaultMessage - 默认消息（当消息未找到时使用）
   * @returns 格式化后的消息字符串
   */
  formatMessage(
    id: string | MessageDescriptor,
    values?: Record<string, any>,
    defaultMessage?: string
  ): string;

  /**
   * 格式化日期时间
   * @param date - 日期对象、时间戳或日期字符串
   * @param options - 格式化选项
   * @returns 格式化后的日期时间字符串
   */
  formatDate(
    date: Date | number | string,
    options?: DateTimeFormatOptions
  ): string;

  /**
   * 格式化数字
   * @param value - 要格式化的数字
   * @param options - 格式化选项
   * @returns 格式化后的数字字符串
   */
  formatNumber(
    value: number,
    options?: NumberFormatOptions
  ): string;

  /**
   * 格式化相对时间（如 "2 days ago"）
   * @param options - 相对时间格式化选项
   * @returns 格式化后的相对时间字符串
   */
  formatRelativeTime(
    options: RelativeTimeFormatOptions
  ): string;

  /**
   * 获取当前 locale
   * @returns 当前 locale 字符串
   */
  getLocale(): Locale;
}
