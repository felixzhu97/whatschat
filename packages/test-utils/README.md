# @whatschat/test-utils

单元测试工具包 - 提供通用的测试工具函数，支持 Vitest 和 Jest 两种测试框架。

## 安装

此包已包含在 monorepo 中，可直接使用：

```typescript
import { userFactory, createMockFunction, waitFor } from '@whatschat/test-utils';
```

## 特性

- 🎯 **框架无关**：自动检测并适配 Vitest 和 Jest
- 🏭 **数据工厂**：快速生成测试数据
- 🎭 **Mock 工具**：简化 Mock 函数和对象的创建
- ✅ **自定义断言**：增强的断言工具
- ⏱️ **异步工具**：等待、重试、超时等工具
- ⚛️ **React 支持**：React 组件测试工具（可选）

## 核心模块

### 数据工厂 (Factories)

```typescript
import { userFactory, messageFactory, createMany } from '@whatschat/test-utils';

// 创建单个用户
const user = userFactory();

// 使用覆盖值
const customUser = userFactory({ name: 'Custom Name', email: 'custom@example.com' });

// 批量生成
const users = createMany(userFactory, 5);
```

### Mock 工具 (Mocks)

```typescript
import { createMockFunction, createAsyncMockFunction, createMockObject } from '@whatschat/test-utils';

// 创建 Mock 函数
const mockFn = createMockFunction<(id: string) => User>();
mockFn.mockReturnValue(userFactory());

// 创建异步 Mock 函数
const mockAsyncFn = createAsyncMockFunction<(id: string) => Promise<User>>();
mockAsyncFn.mockResolvedValue(userFactory());

// 创建 Mock 对象
const mockApi = createMockObject<ApiClient>({
  get: createMockFunction(),
  post: createAsyncMockFunction(),
});
```

### 自定义断言 (Assertions)

```typescript
import { expectArrayToContainEqual, expectObjectToContain, expectToBeInRange } from '@whatschat/test-utils';

// 数组包含断言
expectArrayToContainEqual([{ id: 1, name: 'test' }], { id: 1, name: 'test' });

// 对象包含断言
expectObjectToContain(
  { id: 1, name: 'test', age: 20 },
  { id: 1, name: 'test' }
);

// 数值范围断言
expectToBeInRange(50, 0, 100);
```

### 异步工具 (Async)

```typescript
import { waitFor, delay, timeout, retry } from '@whatschat/test-utils';

// 等待条件满足
await waitFor(() => condition(), { timeout: 5000, interval: 100 });

// 延迟
await delay(1000);

// 带超时的 Promise
const result = await timeout(fetchData(), 5000, 'Request timeout');

// 重试
const result = await retry(() => fetchData(), {
  maxAttempts: 3,
  delay: 1000,
});
```

### React 工具 (React)

需要安装 `@testing-library/react`：

```typescript
import { renderWithProviders } from '@whatschat/test-utils';

const { container } = renderWithProviders(<MyComponent />, {
  providers: [
    { provider: ThemeProvider },
    { provider: StoreProvider, props: { store: mockStore } }
  ]
});
```

## 类型支持

所有工具函数都提供完整的 TypeScript 类型定义，确保类型安全。

## 框架支持

此包自动检测当前使用的测试框架（Vitest 或 Jest），无需额外配置。

## 许可证

MIT
