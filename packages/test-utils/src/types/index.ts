/**
 * 类型定义
 * 导出所有公共类型
 */

// 从 factories 导出类型
export type {
  Factory,
  User,
  Message,
  Chat,
  Contact,
} from '../factories';

// 从 mocks 导出类型
export type {
  MockFunction,
} from '../mocks';

// 从 async 导出类型
export type {
  WaitOptions,
  RetryOptions,
} from '../async';

// 从 react 导出类型
export type {
  ProviderConfig,
  RenderWithProvidersOptions,
} from '../react';
