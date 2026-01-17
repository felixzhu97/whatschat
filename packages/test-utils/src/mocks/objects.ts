/**
 * Mock 对象工具
 * 用于创建 Mock 对象和部分 Mock
 */

import { createMockFunction, MockFunction } from './functions';

/**
 * 创建 Mock 对象
 * 
 * @param props 对象属性定义，值可以是 Mock 函数或其他值
 * @returns Mock 对象
 * 
 * @example
 * ```typescript
 * const mockApi = createMockObject<ApiClient>({
 *   get: createMockFunction(),
 *   post: createAsyncMockFunction(),
 *   baseUrl: 'https://api.example.com'
 * });
 * 
 * mockApi.get.mockReturnValue({ data: 'test' });
 * ```
 */
export function createMockObject<T extends Record<string, any>>(
  props: {
    [K in keyof T]?: T[K] | MockFunction<any> | (() => T[K]);
  }
): T {
  const mockObj = {} as T;

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'function') {
      // 如果是函数，检查是否是 Mock 函数
      const mockFn = createMockFunction(value as any);
      (mockObj as any)[key] = mockFn;
    } else {
      (mockObj as any)[key] = value;
    }
  }

  return mockObj;
}

/**
 * 部分 Mock 对象
 * 只 Mock 指定的属性，其他属性保持原样（或使用默认值）
 * 
 * @param base 基础对象
 * @param overrides 要 Mock 的属性
 * @returns 部分 Mock 的对象
 * 
 * @example
 * ```typescript
 * const original = { a: 1, b: 2, c: 3 };
 * const mock = createPartialMock(original, {
 *   b: createMockFunction().mockReturnValue(999)
 * });
 * // mock = { a: 1, b: <MockFn>, c: 3 }
 * ```
 */
export function createPartialMock<
  T extends Record<string, any>,
  K extends keyof T
>(
  base: T,
  overrides: Partial<{ [P in K]: T[P] | MockFunction<any> }>
): T {
  return {
    ...base,
    ...overrides,
  } as T;
}
