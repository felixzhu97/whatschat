/**
 * 格式化选项类型定义
 */

/**
 * 日期时间格式化选项
 */
export interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  /**
   * 预设格式名称
   */
  format?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /**
   * 预设格式名称
   */
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
}

/**
 * 相对时间格式化选项
 */
export interface RelativeTimeFormatOptions {
  /**
   * 相对时间单位
   */
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

  /**
   * 数值
   */
  value: number;

  /**
   * 格式风格（numeric 或 style）
   */
  numeric?: 'always' | 'auto';
}
