# Web端整洁架构迁移说明

## 已完成的工作

### 1. 目录结构

已创建完整的整洁架构目录结构：

- `src/domain/` - 领域层（实体和接口）
- `src/application/` - 应用层（服务）
- `src/infrastructure/` - 基础设施层（适配器）
- `src/presentation/` - 展示层（组件和hooks）

### 2. 领域层（Domain）

- ✅ 创建了实体类：User, Message, Contact, Call, Group
- ✅ 定义了接口：API客户端、存储、WebSocket、WebRTC、服务接口

### 3. 基础设施层（Infrastructure）

- ✅ API适配器：ApiClientAdapter, AuthApiAdapter, UserApiAdapter, ChatApiAdapter, FileApiAdapter
- ✅ 存储适配器：StorageAdapter
- ✅ WebSocket适配器：WebSocketAdapter, WebRTCAdapter
- ✅ 状态管理适配器：MessagesStateAdapter, ContactsStateAdapter（基于Zustand）

### 4. 应用层（Application）

- ✅ 认证服务：AuthService
- ✅ 消息服务：MessagesService
- ✅ 聊天服务：ChatsService
- ✅ 通话服务：CallsService
- ✅ 用户服务：UsersService

### 5. 展示层（Presentation）

- ✅ 创建了展示层hooks：use-auth, use-messages

## 需要手动完成的工作

### 1. 更新组件导入路径

需要将组件中的导入路径从旧路径更新为新路径：

**旧路径 → 新路径：**

- `@/types` → `@/src/domain/entities`
- `@/lib/api` → `@/src/infrastructure/adapters/api`
- `@/lib/storage` → `@/src/infrastructure/adapters/storage`
- `@/lib/websocket` → `@/src/infrastructure/adapters/websocket`
- `@/hooks/use-auth` → `@/src/presentation/hooks/use-auth`
- `@/stores/*` → `@/src/infrastructure/adapters/state/*`

### 2. 重构组件

组件需要移除业务逻辑，只保留UI渲染。组件应该：

- 通过presentation层的hooks访问服务
- 不直接调用API或操作状态
- 只负责UI渲染和用户交互

### 3. 更新页面

`app/`目录下的页面需要：

- 使用新的presentation层hooks
- 移除直接的状态管理调用
- 通过服务层访问业务逻辑

### 4. 更新测试

测试文件需要：

- 更新导入路径
- 适配新的架构
- 为application层服务添加单元测试

### 5. 清理旧代码

迁移完成后，可以删除：

- `lib/api.ts`（已迁移到infrastructure/adapters/api）
- `lib/storage.ts`（已迁移到infrastructure/adapters/storage）
- `lib/websocket.ts`（已迁移到infrastructure/adapters/websocket）
- `lib/webrtc.ts`（已迁移到infrastructure/adapters/websocket）
- `stores/*.ts`（已迁移到infrastructure/adapters/state）
- `hooks/use-auth.ts`（已迁移到presentation/hooks，但需要保留作为过渡）

## 使用示例

### 在组件中使用认证服务

```typescript
import { useAuth } from "@/src/presentation/hooks/use-auth";

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // 使用服务...
}
```

### 在组件中使用消息服务

```typescript
import { useMessages } from "@/src/presentation/hooks/use-messages";

export function ChatComponent({ contactId }: { contactId: string }) {
  const { messages, handleSendMessage } = useMessages(contactId);

  // 使用服务...
}
```

## 架构说明

### 依赖方向

```
presentation → application → domain ← infrastructure
```

- **presentation层**：只依赖application层
- **application层**：只依赖domain层
- **infrastructure层**：实现domain层定义的接口
- **domain层**：不依赖任何其他层

### 服务访问

所有服务都通过单例模式提供：

- `getAuthService()` - 认证服务
- `getMessagesService()` - 消息服务
- `getChatsService()` - 聊天服务
- `getCallsService()` - 通话服务
- `getUsersService()` - 用户服务

### 适配器访问

所有适配器都通过单例模式提供：

- `getApiClient()` - API客户端
- `getStorageAdapter()` - 存储适配器
- `getWebSocketAdapter()` - WebSocket适配器
- `getWebRTCAdapter()` - WebRTC适配器

## 注意事项

1. **保持向后兼容**：迁移过程中确保应用功能不受影响
2. **逐步迁移**：可以逐个模块迁移，不需要一次性完成
3. **测试覆盖**：每个迁移的模块都应该有相应的测试
4. **文档更新**：更新相关文档以反映新的架构
