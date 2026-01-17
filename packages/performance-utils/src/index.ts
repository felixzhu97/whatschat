/**
 * @whatschat/performance-utils
 * 
 * 性能优化工具包
 * 提供常用的性能优化工具函数，支持内存优化、渲染优化、网络优化等
 * 
 * @example
 * ```typescript
 * import { debounce, throttle, leakDetector } from '@whatschat/performance-utils';
 * 
 * const debouncedSearch = debounce((query: string) => {
 *   search(query);
 * }, 300);
 * 
 * const detector = leakDetector();
 * detector.track(object);
 * ```
 */

// 导出内存优化工具
export * from './memory';

// 导出渲染优化工具
export * from './render';

// 导出网络优化工具
export * from './network';

// 导出打包优化工具
export * from './bundle';

// 导出性能监控工具
export * from './monitoring';

// 导出资源优化工具
export * from './resource';

// 导出类型定义
export * from './types';
