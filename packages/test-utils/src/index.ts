/**
 * @whatschat/test-utils
 * 
 * 单元测试工具包
 * 提供通用的测试工具函数，支持 Vitest 和 Jest 两种测试框架
 * 
 * @example
 * ```typescript
 * import {
 *   userFactory,
 *   createMockFunction,
 *   waitFor,
 *   expectObjectToContain
 * } from '@whatschat/test-utils';
 * 
 * const user = userFactory({ name: 'Test User' });
 * const mockFn = createMockFunction<(id: string) => User>();
 * await waitFor(() => condition(), { timeout: 5000 });
 * ```
 */

// 导出 factories
export * from './factories';

// 导出 mocks
export * from './mocks';

// 导出 assertions
export * from './assertions';

// 导出 async 工具
export * from './async';

// 导出 react 工具（需要 @testing-library/react）
export * from './react';

// 导出类型
export * from './types';
