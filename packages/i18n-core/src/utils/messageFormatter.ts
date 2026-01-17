/**
 * 消息格式化工具
 */

import type { Locale, MessageDescriptor, NestedMessages } from '../types';

/**
 * 简单的消息格式化函数（基本的变量替换）
 * 注意：这是回退实现。要获得完整的 ICU 消息格式支持（pluralization、select 等），
 * 请确保安装 @formatjs/intl 并在运行时使用它。
 * @param message - 消息模板
 * @param values - 变量值
 * @returns 格式化后的消息
 */
function simpleFormat(message: string, values?: Record<string, any>): string {
  if (!values || Object.keys(values).length === 0) {
    return message;
  }

  let result = message;
  for (const [key, value] of Object.entries(values)) {
    // 替换 {key} 和 { key } 格式
    const regex = new RegExp(`\\{\\s*${key}\\s*\\}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * 从嵌套的消息对象中获取消息值
 * @param messages - 嵌套的消息对象
 * @param id - 消息 ID（可以是点分隔的路径，如 'common.hello'）
 * @returns 消息值或 null
 */
export function getNestedMessage(
  messages: NestedMessages,
  id: string
): string | null {
  if (!messages || !id) {
    return null;
  }

  const parts = id.split('.');
  let current: any = messages;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return null;
    }

    if (typeof current !== 'object') {
      return null;
    }

    current = current[part];
  }

  return typeof current === 'string' ? current : null;
}

/**
 * 格式化消息
 * @param locale - 当前 locale
 * @param messages - 消息对象
 * @param id - 消息 ID 或描述符
 * @param values - 消息参数（用于变量插值）
 * @param defaultMessage - 默认消息（当消息未找到时使用）
 * @returns 格式化后的消息字符串
 */
export function formatMessage(
  locale: Locale,
  messages: NestedMessages,
  id: string | MessageDescriptor,
  values?: Record<string, any>,
  defaultMessage?: string
): string {
  let messageId: string;
  let descriptorDefaultMessage: string | undefined;

  if (typeof id === 'string') {
    messageId = id;
  } else {
    messageId = id.id;
    descriptorDefaultMessage = id.defaultMessage || defaultMessage;
  }

  // 从消息对象中获取消息
  let message = getNestedMessage(messages, messageId);

  // 如果没有找到消息，使用默认消息
  if (!message) {
    message = descriptorDefaultMessage || defaultMessage || messageId;
  }

  // 如果没有变量插值，直接返回消息
  if (!values || Object.keys(values).length === 0) {
    return message;
  }

  // 使用简单的格式化实现
  // 注意：此实现仅支持基本的变量替换 {key}。
  // 要获得完整的 ICU 消息格式支持（pluralization、select、rich text 等），
  // 建议在项目中使用 @formatjs/intl 或其他完整的消息格式化库。
  try {
    return simpleFormat(message, values);
  } catch (error) {
    // 如果格式化失败，返回原始消息
    console.warn(`[i18n-core] Failed to format message "${messageId}":`, error);
    return message;
  }
}
