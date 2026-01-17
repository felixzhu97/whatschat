/**
 * 消息加载器接口
 */

import type { Locale, NestedMessages } from '../types';

/**
 * 消息加载器接口，用于异步加载语言包
 */
export interface IMessageLoader {
  /**
   * 加载指定 locale 的消息
   * @param locale - 要加载的 locale
   * @returns Promise，解析为消息对象
   */
  load(locale: Locale): Promise<NestedMessages>;

  /**
   * 检查指定 locale 的消息是否可用
   * @param locale - 要检查的 locale
   * @returns Promise，解析为是否可用
   */
  has(locale: Locale): Promise<boolean>;
}
