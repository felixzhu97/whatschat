# @whatschat/performance-utils

性能优化工具包 - 提供常用的性能优化工具函数，支持内存优化、渲染优化、网络优化、打包优化、性能监控和资源优化。

## 安装

此包已包含在 monorepo 中，可直接使用：

```typescript
import { debounce, throttle } from '@whatschat/performance-utils';
```

## 特性

- 🧠 **内存优化**：内存泄漏检测、垃圾回收监控、内存使用分析
- 🎨 **渲染优化**：防抖、节流、虚拟滚动、React.memo 辅助工具
- 🌐 **网络优化**：请求去重、缓存策略、重试机制、请求合并
- 📦 **打包优化**：懒加载辅助、代码分割辅助、打包分析工具
- 📊 **性能监控**：指标收集、性能报告、性能预算检查
- 🖼️ **资源优化**：图片懒加载、资源预加载、缓存管理

## 核心模块

### 内存优化 (memory)

```typescript
import { leakDetector, gcMonitor, memoryAnalyzer } from '@whatschat/performance-utils/memory';

// 内存泄漏检测
const detector = leakDetector();
detector.track(componentRef);
detector.check(); // 检测潜在泄漏

// 垃圾回收监控（Node.js）
const monitor = gcMonitor();
monitor.on('gc', (stats) => {
  console.log('GC event:', stats);
});

// 内存使用分析
const analyzer = memoryAnalyzer();
const snapshot = analyzer.takeSnapshot();
analyzer.analyze(snapshot);
```

### 渲染优化 (render)

```typescript
import { debounce, throttle, useVirtualScroll, createMemoComparator } from '@whatschat/performance-utils/render';

// 防抖
const debouncedSearch = debounce((query: string) => {
  search(query);
}, 300);

// 节流
const throttledScroll = throttle(() => {
  handleScroll();
}, 100);

// 虚拟滚动计算
const { startIndex, endIndex, totalHeight } = useVirtualScroll({
  itemHeight: 50,
  containerHeight: 400,
  totalItems: 1000,
  scrollTop: 0
});

// React.memo 比较函数
const areEqual = createMemoComparator(['id', 'name']);
const MemoizedComponent = React.memo(MyComponent, areEqual);
```

### 网络优化 (network)

```typescript
import { requestDedupe, createCacheStrategy, retryWithBackoff, requestMerge } from '@whatschat/performance-utils/network';

// 请求去重
const dedupe = requestDedupe();
const fetchUser = (id: string) => dedupe(`user-${id}`, () => api.getUser(id));

// 缓存策略
const cache = createCacheStrategy({ ttl: 60000 }); // 1分钟过期
const cachedFetch = (url: string) => cache.getOrSet(url, () => fetch(url));

// 重试机制
const retryFetch = retryWithBackoff(() => fetch(url), {
  maxRetries: 3,
  initialDelay: 1000
});

// 请求合并
const merge = requestMerge();
const getUsers = (ids: string[]) => merge(ids, (mergedIds) => api.getUsers(mergedIds));
```

### 打包优化 (bundle)

```typescript
import { lazyLoad, codeSplit, analyzeBundle } from '@whatschat/performance-utils/bundle';

// 懒加载
const LazyComponent = lazyLoad(() => import('./HeavyComponent'));

// 代码分割辅助
const routeLoader = codeSplit((route) => import(`./routes/${route}`));

// 打包分析（构建时）
analyzeBundle('./dist').then(report => {
  console.log('Bundle size:', report.totalSize);
  console.log('Largest chunks:', report.largestChunks);
});
```

### 性能监控 (monitoring)

```typescript
import { metricsCollector, performanceReporter, budgetChecker } from '@whatschat/performance-utils/monitoring';

// 指标收集
const collector = metricsCollector();
collector.collectWebVitals((metrics) => {
  console.log('Web Vitals:', metrics);
});

// 性能报告
const reporter = performanceReporter();
reporter.generateReport().then(report => {
  console.log('Performance Report:', report);
});

// 性能预算检查
const checker = budgetChecker({
  bundleSize: 200 * 1024, // 200KB
  loadTime: 3000, // 3秒
});
checker.check(bundleSize, loadTime).then(result => {
  if (!result.passed) {
    console.warn('Performance budget exceeded:', result.violations);
  }
});
```

### 资源优化 (resource)

```typescript
import { imageLazyLoad, preloadManager, cacheManager } from '@whatschat/performance-utils/resource';

// 图片懒加载
imageLazyLoad(document.querySelectorAll('img[data-src]'));

// 资源预加载
const preloader = preloadManager();
preloader.preload('/api/data', { priority: 'high' });
preloader.preload('/images/banner.jpg', { priority: 'low' });

// 缓存管理
const cache = cacheManager();
cache.set('user-data', userData, { ttl: 3600000 }); // 1小时
const userData = cache.get('user-data');
```

## 使用方式

### 按需导入（推荐）

```typescript
// 仅导入需要的工具，支持 Tree-shaking
import { debounce } from '@whatschat/performance-utils/render';
import { requestDedupe } from '@whatschat/performance-utils/network';
```

### 统一导入

```typescript
import { debounce, throttle, leakDetector } from '@whatschat/performance-utils';
```

## 类型支持

所有工具函数都提供完整的 TypeScript 类型定义，确保类型安全。

## 环境支持

- **Web**: 使用浏览器 API（IntersectionObserver, PerformanceObserver 等）
- **React Native**: 提供兼容实现或使用平台特定 API
- **Node.js**: 使用 Node.js 特定 API（performance, v8 模块等）

## 性能考虑

- **零运行时依赖**：尽量使用原生 API，避免引入外部依赖
- **Tree-shaking 支持**：使用命名导出，支持按需导入
- **高性能**：工具本身经过优化，不影响应用性能

## 许可证

MIT
