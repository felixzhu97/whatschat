/**
 * 等待工具
 * 提供延迟和条件等待功能
 */

/**
 * 等待选项
 */
export interface WaitOptions {
  /**
   * 超时时间（毫秒）
   * @default 5000
   */
  timeout?: number;
  /**
   * 检查间隔（毫秒）
   * @default 100
   */
  interval?: number;
}

/**
 * 延迟指定时间
 * 
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 * 
 * @example
 * ```typescript
 * await delay(1000); // 等待 1 秒
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 等待条件满足
 * 
 * @param condition 条件函数，返回 true 表示条件满足
 * @param options 等待选项
 * @returns Promise，条件满足时 resolve
 * @throws 超时时抛出错误
 * 
 * @example
 * ```typescript
 * await waitFor(() => element.isVisible(), { timeout: 5000 });
 * ```
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    await delay(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * 等待条件满足（带返回值）
 * 
 * @param condition 条件函数，返回非 null/undefined 值时表示条件满足
 * @param options 等待选项
 * @returns Promise，返回条件函数的结果
 * @throws 超时时抛出错误
 * 
 * @example
 * ```typescript
 * const result = await waitForValue(() => getElement() || null);
 * ```
 */
export async function waitForValue<T>(
  condition: () => T | null | undefined | Promise<T | null | undefined>,
  options: WaitOptions = {}
): Promise<T> {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result !== null && result !== undefined) {
      return result;
    }
    await delay(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}
