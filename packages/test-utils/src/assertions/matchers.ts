/**
 * 自定义断言工具
 * 提供增强的断言函数，简化常见断言场景
 */

/**
 * 断言数组包含指定的元素（使用深度相等比较）
 * 
 * @param array 要检查的数组
 * @param expectedItem 期望包含的元素
 * @param message 可选的错误消息
 * 
 * @example
 * ```typescript
 * expectArrayToContainEqual([{ id: 1, name: 'test' }], { id: 1, name: 'test' });
 * ```
 */
export function expectArrayToContainEqual<T>(
  array: T[],
  expectedItem: T,
  message?: string
): void {
  const found = array.some((item) => deepEqual(item, expectedItem));
  if (!found) {
    throw new Error(
      message ||
        `Expected array to contain ${JSON.stringify(expectedItem)}, but it didn't`
    );
  }
}

/**
 * 断言对象包含指定的属性（部分匹配）
 * 
 * @param actual 实际对象
 * @param expected 期望包含的属性
 * @param message 可选的错误消息
 * 
 * @example
 * ```typescript
 * expectObjectToContain(
 *   { id: 1, name: 'test', age: 20 },
 *   { id: 1, name: 'test' }
 * );
 * ```
 */
export function expectObjectToContain<T extends Record<string, any>>(
  actual: T,
  expected: Partial<T>,
  message?: string
): void {
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = (actual as any)[key];
    if (!deepEqual(actualValue, expectedValue)) {
      throw new Error(
        message ||
          `Expected object to contain ${key}: ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`
      );
    }
  }
}

/**
 * 断言值在指定范围内（包含边界）
 * 
 * @param value 要检查的值
 * @param min 最小值
 * @param max 最大值
 * @param message 可选的错误消息
 * 
 * @example
 * ```typescript
 * expectToBeInRange(50, 0, 100);
 * ```
 */
export function expectToBeInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): void {
  if (value < min || value > max) {
    throw new Error(
      message ||
        `Expected value ${value} to be in range [${min}, ${max}], but it wasn't`
    );
  }
}

/**
 * 深度相等比较（简单实现）
 * 用于对象和数组的深度比较
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}
