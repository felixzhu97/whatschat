/**
 * Mock 函数工具
 * 自动检测测试框架（Vitest 或 Jest）并提供统一的接口
 */

/**
 * 检测当前使用的测试框架
 */
function getMockFramework(): 'vitest' | 'jest' | null {
  // 尝试多种方式检测 Vitest
  const vi =
    typeof globalThis !== 'undefined' && (globalThis as any).vi
      ? (globalThis as any).vi
      : typeof global !== 'undefined' && (global as any).vi
      ? (global as any).vi
      : typeof window !== 'undefined' && (window as any).vi
      ? (window as any).vi
      : null;

  // 尝试多种方式检测 Jest
  const jest =
    typeof globalThis !== 'undefined' && (globalThis as any).jest
      ? (globalThis as any).jest
      : typeof global !== 'undefined' && (global as any).jest
      ? (global as any).jest
      : typeof window !== 'undefined' && (window as any).jest
      ? (window as any).jest
      : null;

  if (vi && typeof vi.fn === 'function') {
    return 'vitest';
  }
  if (jest && typeof jest.fn === 'function') {
    return 'jest';
  }
  return null;
}

/**
 * 获取框架的 mock 函数创建器
 */
function getMockFn() {
  const framework = getMockFramework();
  
  // 获取 vi 或 jest 对象
  const getVi = () => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).vi) {
      return (globalThis as any).vi;
    }
    if (typeof global !== 'undefined' && (global as any).vi) {
      return (global as any).vi;
    }
    if (typeof window !== 'undefined' && (window as any).vi) {
      return (window as any).vi;
    }
    return null;
  };

  const getJest = () => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).jest) {
      return (globalThis as any).jest;
    }
    if (typeof global !== 'undefined' && (global as any).jest) {
      return (global as any).jest;
    }
    if (typeof window !== 'undefined' && (window as any).jest) {
      return (window as any).jest;
    }
    return null;
  };

  if (framework === 'vitest') {
    const viInstance = getVi();
    if (viInstance && typeof viInstance.fn === 'function') {
      return viInstance.fn.bind(viInstance);
    }
  }
  if (framework === 'jest') {
    const jestInstance = getJest();
    if (jestInstance && typeof jestInstance.fn === 'function') {
      return jestInstance.fn.bind(jestInstance);
    }
  }
  
  throw new Error(
    'No test framework detected. Please ensure vitest or jest is installed and available.'
  );
}

/**
 * Mock 函数类型（兼容 Vitest 和 Jest）
 */
export type MockFunction<T extends (...args: any[]) => any> = T & {
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockResolvedValue: (
    value: Awaited<ReturnType<T>>
  ) => MockFunction<T>;
  mockRejectedValue: (error: any) => MockFunction<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
  // Vitest/Jest 调用信息
  mock?: {
    calls: Parameters<T>[];
    results: Array<{ type: 'return' | 'throw'; value: any }>;
  };
  // Jest 兼容性
  mockReturnValueOnce?: (value: ReturnType<T>) => MockFunction<T>;
  mockResolvedValueOnce?: (
    value: Awaited<ReturnType<T>>
  ) => MockFunction<T>;
};

/**
 * 创建 Mock 函数
 * 自动适配 Vitest 或 Jest 框架
 * 
 * @param implementation 可选的实现函数
 * @returns Mock 函数
 * 
 * @example
 * ```typescript
 * const mockFn = createMockFunction<(id: string) => User>();
 * mockFn.mockReturnValue(userFactory());
 * 
 * const result = mockFn('user-1');
 * ```
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): MockFunction<T> {
  const mockFn = getMockFn();
  const fn = implementation ? mockFn(implementation) : mockFn();
  return fn as MockFunction<T>;
}

/**
 * 创建异步 Mock 函数
 * 
 * @param implementation 可选的异步实现函数
 * @returns 异步 Mock 函数
 * 
 * @example
 * ```typescript
 * const mockAsyncFn = createAsyncMockFunction<(id: string) => Promise<User>>();
 * mockAsyncFn.mockResolvedValue(userFactory());
 * 
 * const result = await mockAsyncFn('user-1');
 * ```
 */
export function createAsyncMockFunction<
  T extends (...args: any[]) => Promise<any>
>(implementation?: T): MockFunction<T> {
  const mockFn = getMockFn();
  const fn = implementation ? mockFn(implementation) : mockFn();
  return fn as MockFunction<T>;
}
