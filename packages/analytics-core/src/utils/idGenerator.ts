/**
 * ID 生成器工具
 */

/**
 * 生成唯一 ID（基于时间戳和随机数）
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * 生成会话 ID
 */
export function generateSessionId(): string {
  return `sess_${generateId()}`;
}

/**
 * 生成用户 ID（如果未提供）
 */
export function generateUserId(): string {
  return `user_${generateId()}`;
}

/**
 * 生成事件 ID
 */
export function generateEventId(): string {
  return `evt_${generateId()}`;
}
