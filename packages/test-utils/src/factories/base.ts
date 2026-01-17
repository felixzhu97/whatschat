/**
 * 基础工厂工具
 * 提供通用的工厂函数创建器和批量生成工具
 */

/**
 * 工厂函数类型
 */
export type Factory<T> = (overrides?: Partial<T>) => T;

/**
 * 创建通用工厂函数
 * 
 * @param defaults 默认值生成器
 * @returns 工厂函数
 * 
 * @example
 * ```typescript
 * const userFactory = createFactory(() => ({
 *   id: generateId(),
 *   name: 'Test User',
 *   email: 'test@example.com'
 * }));
 * 
 * const user = userFactory();
 * const customUser = userFactory({ name: 'Custom Name' });
 * ```
 */
export function createFactory<T extends Record<string, any>>(
  defaults: () => T
): Factory<T> {
  return (overrides?: Partial<T>): T => {
    const defaultValues = defaults();
    return {
      ...defaultValues,
      ...overrides,
    } as T;
  };
}

/**
 * 批量生成数据
 * 
 * @param factory 工厂函数
 * @param count 生成数量
 * @returns 生成的数据数组
 * 
 * @example
 * ```typescript
 * const users = createMany(userFactory, 5);
 * ```
 */
export function createMany<T>(
  factory: Factory<T>,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) => factory());
}
