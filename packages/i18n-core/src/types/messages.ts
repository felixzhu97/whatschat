/**
 * Messages 相关类型定义
 */

/**
 * 嵌套的消息对象，支持任意深度的嵌套结构
 */
export type NestedMessages = {
  [key: string]: string | NestedMessages;
};

/**
 * 消息映射，键为 locale，值为消息对象
 */
export type Messages = Record<string, NestedMessages>;

/**
 * 消息描述符，用于格式化消息时的输入
 */
export interface MessageDescriptor {
  /**
   * 消息 ID（可以是点分隔的路径，如 'common.hello'）
   */
  id: string;

  /**
   * 消息的默认值（可选，当消息未找到时使用）
   */
  defaultMessage?: string;

  /**
   * 描述信息（用于开发者工具和文档生成）
   */
  description?: string;
}

/**
 * 格式化消息的选项
 */
export interface FormatMessageOptions {
  /**
   * 消息 ID 或描述符
   */
  id: string | MessageDescriptor;

  /**
   * 消息参数（用于 ICU 消息格式的变量插值）
   */
  values?: Record<string, any>;

  /**
   * 默认消息（当消息未找到时使用）
   */
  defaultMessage?: string;
}
