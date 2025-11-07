# 整洁架构重构建议

本文档基于 Robert C. Martin 的整洁架构（Clean Architecture）原则，为 WhatsChat 项目提供目录结构优化建议。

## 📋 目录

1. [整洁架构概述](#整洁架构概述)
2. [当前结构分析](#当前结构分析)
3. [优化建议](#优化建议)
4. [迁移计划](#迁移计划)

---

## 整洁架构概述

整洁架构将系统分为四个同心圆层，依赖关系从外向内：

```
┌─────────────────────────────────────┐
│  框架和驱动层 (Frameworks & Drivers) │
│  - UI, Web框架, 数据库, 外部服务      │
└──────────────┬──────────────────────┘
               │ 依赖方向
┌──────────────▼──────────────────────┐
│  接口适配器层 (Interface Adapters)  │
│  - 控制器, 网关, 展示器, 状态管理     │
└──────────────┬──────────────────────┘
               │ 依赖方向
┌──────────────▼──────────────────────┐
│  用例层 (Use Cases / Application)    │
│  - 业务逻辑, 用例实现                 │
└──────────────┬──────────────────────┘
               │ 依赖方向
┌──────────────▼──────────────────────┐
│  实体层 (Entities)                   │
│  - 核心业务对象, 业务规则             │
└─────────────────────────────────────┘
```

### 核心原则

1. **依赖规则**：内层不依赖外层，依赖方向只能指向内层
2. **独立性**：业务逻辑独立于框架、UI、数据库
3. **可测试性**：业务逻辑可以独立测试，无需依赖外部框架
4. **可维护性**：框架和技术细节变化不影响业务逻辑

---

## 当前结构分析

### Web 应用 (`apps/web/`)

**当前结构：**

```
apps/web/
├── app/                    # Next.js 页面路由
├── components/             # UI 组件（混合了业务逻辑）
├── hooks/                  # React Hooks（包含业务逻辑）
├── lib/                    # 工具库（API、WebSocket、WebRTC）
├── stores/                 # 状态管理（Zustand）
├── types/                  # TypeScript 类型定义
└── data/                   # 模拟数据
```

**问题：**

1. ❌ 业务逻辑分散在 `hooks/`、`stores/`、`components/` 中
2. ❌ 没有明确的用例层（Use Cases）
3. ❌ 实体（Entities）和接口适配器混在一起
4. ❌ API 调用直接耦合在组件中
5. ❌ 状态管理包含业务逻辑

### Server 应用 (`apps/server/src/`)

**当前结构：**

```
apps/server/src/
├── controllers/            # 控制器
├── routes/                 # 路由
├── services/               # 业务逻辑（部分）
├── middleware/             # 中间件
├── database/                # 数据库相关
├── utils/                   # 工具函数
├── types/                   # 类型定义
└── validators/              # 数据验证
```

**问题：**

1. ❌ 业务逻辑在 `services/` 和 `controllers/` 中混合
2. ❌ 没有明确的用例层
3. ❌ 数据库模型（Prisma）直接暴露给业务层
4. ❌ 实体定义不清晰

---

## 优化建议

### Web 应用重构方案

#### 推荐目录结构

```
apps/web/
├── app/                          # Next.js 框架层
│   ├── (auth)/                   # 认证路由组
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── domain/                   # 实体层 (Entities)
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── message.entity.ts
│   │   │   ├── contact.entity.ts
│   │   │   ├── call.entity.ts
│   │   │   └── group.entity.ts
│   │   ├── value-objects/        # 值对象
│   │   │   ├── message-status.vo.ts
│   │   │   ├── call-status.vo.ts
│   │   │   └── user-status.vo.ts
│   │   └── interfaces/           # 实体接口
│   │       ├── repository.interface.ts
│   │       └── service.interface.ts
│   │
│   ├── application/              # 用例层 (Use Cases)
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── login.use-case.ts
│   │   │   │   ├── register.use-case.ts
│   │   │   │   └── logout.use-case.ts
│   │   │   ├── messages/
│   │   │   │   ├── send-message.use-case.ts
│   │   │   │   ├── get-messages.use-case.ts
│   │   │   │   └── delete-message.use-case.ts
│   │   │   ├── contacts/
│   │   │   │   ├── add-contact.use-case.ts
│   │   │   │   └── search-contacts.use-case.ts
│   │   │   ├── calls/
│   │   │   │   ├── start-call.use-case.ts
│   │   │   │   └── end-call.use-case.ts
│   │   │   └── groups/
│   │   │       ├── create-group.use-case.ts
│   │   │       └── add-member.use-case.ts
│   │   ├── dto/                  # 数据传输对象
│   │   │   ├── auth.dto.ts
│   │   │   ├── message.dto.ts
│   │   │   └── contact.dto.ts
│   │   └── ports/                # 端口（接口）
│   │       ├── repositories/
│   │       │   ├── user.repository.port.ts
│   │       │   ├── message.repository.port.ts
│   │       │   └── contact.repository.port.ts
│   │       └── services/
│   │           ├── auth.service.port.ts
│   │           ├── websocket.service.port.ts
│   │           └── webrtc.service.port.ts
│   │
│   ├── infrastructure/           # 接口适配器层 + 框架层
│   │   ├── adapters/            # 接口适配器
│   │   │   ├── repositories/    # 仓储实现
│   │   │   │   ├── api-user.repository.ts
│   │   │   │   ├── api-message.repository.ts
│   │   │   │   └── local-storage.repository.ts
│   │   │   ├── services/        # 服务实现
│   │   │   │   ├── http-auth.service.ts
│   │   │   │   ├── websocket-client.service.ts
│   │   │   │   └── webrtc-client.service.ts
│   │   │   └── mappers/         # 数据映射器
│   │   │       ├── user.mapper.ts
│   │   │       └── message.mapper.ts
│   │   │
│   │   ├── framework/           # 框架层
│   │   │   ├── api/             # API 客户端
│   │   │   │   └── api-client.ts
│   │   │   ├── websocket/       # WebSocket 客户端
│   │   │   │   └── websocket-client.ts
│   │   │   ├── webrtc/          # WebRTC 客户端
│   │   │   │   └── webrtc-client.ts
│   │   │   └── storage/         # 存储实现
│   │   │       ├── localStorage.adapter.ts
│   │   │       └── sessionStorage.adapter.ts
│   │   │
│   │   └── presentation/        # 展示层
│   │       ├── stores/          # 状态管理（Zustand）
│   │       │   ├── auth.store.ts
│   │       │   ├── messages.store.ts
│   │       │   └── contacts.store.ts
│   │       ├── hooks/           # React Hooks（仅用于状态绑定）
│   │       │   ├── use-auth.hook.ts
│   │       │   ├── use-messages.hook.ts
│   │       │   └── use-contacts.hook.ts
│   │       └── providers/       # Context Providers
│   │           ├── auth.provider.tsx
│   │           └── websocket.provider.tsx
│   │
│   └── ui/                      # UI 组件层（框架层）
│       ├── components/          # 业务组件
│       │   ├── chat/
│       │   │   ├── chat-area.tsx
│       │   │   ├── message-bubble.tsx
│       │   │   └── message-input.tsx
│       │   ├── contacts/
│       │   │   └── contact-list-item.tsx
│       │   ├── calls/
│       │   │   └── call-interface.tsx
│       │   └── auth/
│       │       ├── login-form.tsx
│       │       └── register-form.tsx
│       ├── components/ui/      # 基础 UI 组件（shadcn/ui）
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   └── ...
│       └── layouts/             # 布局组件
│           ├── main-layout.tsx
│           └── auth-layout.tsx
│
├── public/                      # 静态资源
└── types/                       # 全局类型（向后兼容，逐步迁移）
```

#### 关键改进点

1. **实体层 (`domain/entities/`)**
   - 纯业务对象，不依赖任何框架
   - 包含业务规则和验证逻辑
   - 示例：`User`、`Message`、`Contact`

2. **用例层 (`application/use-cases/`)**
   - 实现具体的业务用例
   - 协调实体和仓储
   - 不依赖 UI 或框架细节

3. **接口适配器层 (`infrastructure/adapters/`)**
   - 实现用例层定义的端口（接口）
   - 处理数据转换和映射
   - 连接用例层和框架层

4. **框架层 (`infrastructure/framework/` + `ui/`)**
   - Next.js、React、WebSocket、WebRTC
   - 状态管理（Zustand）
   - UI 组件

---

### Server 应用重构方案

#### 推荐目录结构

```
apps/server/src/
├── domain/                      # 实体层
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── message.entity.ts
│   │   ├── contact.entity.ts
│   │   ├── call.entity.ts
│   │   └── group.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   ├── password.vo.ts
│   │   └── message-content.vo.ts
│   └── interfaces/              # 领域接口
│       ├── repository.interface.ts
│       └── service.interface.ts
│
├── application/                 # 用例层
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── login.use-case.ts
│   │   │   ├── register.use-case.ts
│   │   │   └── refresh-token.use-case.ts
│   │   ├── messages/
│   │   │   ├── send-message.use-case.ts
│   │   │   ├── get-messages.use-case.ts
│   │   │   └── delete-message.use-case.ts
│   │   ├── contacts/
│   │   │   ├── add-contact.use-case.ts
│   │   │   └── search-contacts.use-case.ts
│   │   └── calls/
│   │       ├── start-call.use-case.ts
│   │       └── end-call.use-case.ts
│   ├── dto/                     # 数据传输对象
│   │   ├── auth.dto.ts
│   │   ├── message.dto.ts
│   │   └── contact.dto.ts
│   └── ports/                   # 端口（接口）
│       ├── repositories/
│       │   ├── user.repository.port.ts
│       │   ├── message.repository.port.ts
│       │   └── contact.repository.port.ts
│       └── services/
│           ├── jwt.service.port.ts
│           ├── encryption.service.port.ts
│           └── websocket.service.port.ts
│
├── infrastructure/              # 接口适配器层 + 框架层
│   ├── adapters/               # 接口适配器
│   │   ├── repositories/       # 仓储实现
│   │   │   ├── prisma-user.repository.ts
│   │   │   ├── prisma-message.repository.ts
│   │   │   └── redis-cache.repository.ts
│   │   ├── services/           # 服务实现
│   │   │   ├── jwt.service.ts
│   │   │   ├── bcrypt.service.ts
│   │   │   └── websocket-server.service.ts
│   │   └── mappers/            # 数据映射器
│   │       ├── user.mapper.ts
│   │       └── message.mapper.ts
│   │
│   ├── framework/              # 框架层
│   │   ├── express/            # Express 配置
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── database/           # 数据库
│   │   │   ├── prisma/
│   │   │   │   └── client.ts
│   │   │   └── redis/
│   │   │       └── client.ts
│   │   └── websocket/          # WebSocket 服务器
│   │       └── socket.io.server.ts
│   │
│   └── presentation/           # 展示层
│       ├── controllers/        # 控制器
│       │   ├── auth.controller.ts
│       │   ├── message.controller.ts
│       │   └── contact.controller.ts
│       ├── routes/             # 路由
│       │   ├── auth.routes.ts
│       │   ├── message.routes.ts
│       │   └── contact.routes.ts
│       ├── middleware/         # 中间件
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── validation.middleware.ts
│       └── validators/         # 验证器
│           ├── auth.validator.ts
│           └── message.validator.ts
│
├── config/                      # 配置文件
└── types/                       # 全局类型（向后兼容）
```

#### 关键改进点

1. **实体层 (`domain/entities/`)**
   - 纯业务对象，不依赖 Prisma 或数据库
   - 包含业务规则和验证

2. **用例层 (`application/use-cases/`)**
   - 实现业务用例
   - 协调实体和仓储
   - 不依赖 Express 或数据库

3. **接口适配器层 (`infrastructure/adapters/`)**
   - Prisma 仓储实现
   - Redis 缓存实现
   - 服务实现（JWT、加密等）

4. **框架层 (`infrastructure/framework/`)**
   - Express、Prisma、Redis、Socket.IO

5. **展示层 (`infrastructure/presentation/`)**
   - 控制器、路由、中间件

---

## 迁移计划

### 阶段 1：准备阶段（1-2 周）

1. **创建新目录结构**
   - 在 `apps/web/src/` 和 `apps/server/src/` 下创建新结构
   - 保持旧结构不变，确保向后兼容

2. **定义实体接口**
   - 创建 `domain/entities/` 和 `domain/interfaces/`
   - 定义核心实体和接口

3. **定义端口（Ports）**
   - 在 `application/ports/` 中定义仓储和服务接口

### 阶段 2：实体层迁移（2-3 周）

1. **迁移实体**
   - 从 `types/index.ts` 提取实体到 `domain/entities/`
   - 添加业务规则和验证逻辑

2. **创建值对象**
   - 提取值对象（Email、Password 等）

### 阶段 3：用例层实现（3-4 周）

1. **实现用例**
   - 从 `hooks/`、`stores/`、`services/` 提取业务逻辑
   - 创建用例类

2. **创建 DTO**
   - 定义数据传输对象

### 阶段 4：接口适配器实现（2-3 周）

1. **实现仓储**
   - 实现 API 仓储（Web）
   - 实现 Prisma 仓储（Server）

2. **实现服务**
   - 实现 WebSocket、WebRTC 等服务

3. **创建映射器**
   - 实现实体和 DTO 之间的映射

### 阶段 5：展示层重构（2-3 周）

1. **重构 Hooks**
   - 将 Hooks 改为仅用于状态绑定
   - 在 Hooks 中调用用例

2. **重构 Stores**
   - Stores 仅管理状态，不包含业务逻辑

3. **重构组件**
   - 组件仅负责 UI 展示
   - 通过 Hooks 调用用例

### 阶段 6：清理和测试（1-2 周）

1. **删除旧代码**
   - 移除已迁移的旧代码
   - 更新导入路径

2. **编写测试**
   - 为用例层编写单元测试
   - 为实体层编写测试

3. **文档更新**
   - 更新开发文档
   - 更新架构文档

---

## 示例代码

### 实体示例 (`domain/entities/user.entity.ts`)

```typescript
// apps/web/src/domain/entities/user.entity.ts

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly name?: string,
    public readonly avatar?: string,
    public readonly isOnline: boolean = false,
    public readonly lastSeen: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) {
      throw new Error("User ID is required");
    }
    if (!this.username || this.username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error("Invalid email address");
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  public updateLastSeen(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.name,
      this.avatar,
      this.isOnline,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  public setOnlineStatus(isOnline: boolean): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.name,
      this.avatar,
      isOnline,
      this.lastSeen,
      this.createdAt,
      this.updatedAt
    );
  }
}
```

### 用例示例 (`application/use-cases/auth/login.use-case.ts`)

```typescript
// apps/web/src/application/use-cases/auth/login.use-case.ts

import { User } from "@/domain/entities/user.entity";
import { AuthRepositoryPort } from "@/application/ports/repositories/auth.repository.port";
import { AuthServicePort } from "@/application/ports/services/auth.service.port";
import { LoginDto } from "@/application/dto/auth.dto";

export class LoginUseCase {
  constructor(
    private authRepository: AuthRepositoryPort,
    private authService: AuthServicePort
  ) {}

  async execute(dto: LoginDto): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    // 验证输入
    if (!dto.email || !dto.password) {
      throw new Error("Email and password are required");
    }

    // 调用仓储获取用户
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // 验证密码（通过服务）
    const isValid = await this.authService.verifyPassword(
      dto.password,
      user.passwordHash
    );
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // 生成令牌
    const tokens = await this.authService.generateTokens(user);

    // 返回用户和令牌
    return {
      user: User.fromDomain(user),
      tokens,
    };
  }
}
```

### 仓储实现示例 (`infrastructure/adapters/repositories/api-user.repository.ts`)

```typescript
// apps/web/src/infrastructure/adapters/repositories/api-user.repository.ts

import { UserRepositoryPort } from "@/application/ports/repositories/user.repository.port";
import { User } from "@/domain/entities/user.entity";
import { ApiClient } from "@/infrastructure/framework/api/api-client";
import { UserMapper } from "@/infrastructure/adapters/mappers/user.mapper";

export class ApiUserRepository implements UserRepositoryPort {
  constructor(private apiClient: ApiClient) {}

  async findById(id: string): Promise<User | null> {
    const response = await this.apiClient.get(`/users/${id}`);
    if (!response.data) {
      return null;
    }
    return UserMapper.toDomain(response.data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.apiClient.get(`/users?email=${email}`);
    if (!response.data) {
      return null;
    }
    return UserMapper.toDomain(response.data);
  }

  async update(user: User): Promise<User> {
    const dto = UserMapper.toDto(user);
    const response = await this.apiClient.put(`/users/${user.id}`, dto);
    return UserMapper.toDomain(response.data);
  }
}
```

### Hook 示例 (`infrastructure/presentation/hooks/use-auth.hook.ts`)

```typescript
// apps/web/src/infrastructure/presentation/hooks/use-auth.hook.ts

import { useCallback } from "react";
import { useAuthStore } from "@/infrastructure/presentation/stores/auth.store";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { useDependencies } from "@/infrastructure/presentation/providers/dependencies.provider";

export function useAuth() {
  const { loginUseCase, registerUseCase, logoutUseCase } = useDependencies();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await loginUseCase.execute({ email, password });
        setUser(result.user);
        // 存储令牌
        localStorage.setItem("access_token", result.tokens.accessToken);
        localStorage.setItem("refresh_token", result.tokens.refreshToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginUseCase, setUser, setLoading, setError]
  );

  const logout = useCallback(async () => {
    await logoutUseCase.execute();
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, [logoutUseCase, setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
```

---

## 依赖注入

为了解耦依赖，建议使用依赖注入容器：

```typescript
// apps/web/src/infrastructure/presentation/providers/dependencies.provider.tsx

import { createContext, useContext, ReactNode } from "react";
import { LoginUseCase } from "@/application/use-cases/auth/login.use-case";
import { ApiUserRepository } from "@/infrastructure/adapters/repositories/api-user.repository";
import { HttpAuthService } from "@/infrastructure/adapters/services/http-auth.service";
import { ApiClient } from "@/infrastructure/framework/api/api-client";

// 创建依赖容器
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
const userRepository = new ApiUserRepository(apiClient);
const authService = new HttpAuthService(apiClient);
const loginUseCase = new LoginUseCase(userRepository, authService);

const DependenciesContext = createContext({
  loginUseCase,
  // ... 其他用例
});

export function DependenciesProvider({ children }: { children: ReactNode }) {
  return (
    <DependenciesContext.Provider value={{ loginUseCase }}>
      {children}
    </DependenciesContext.Provider>
  );
}

export function useDependencies() {
  return useContext(DependenciesContext);
}
```

---

## 优势总结

### 1. **可测试性**

- 业务逻辑可以独立测试，无需依赖框架
- 可以轻松模拟仓储和服务

### 2. **可维护性**

- 业务逻辑集中，易于理解和修改
- 框架变化不影响业务逻辑

### 3. **可扩展性**

- 易于添加新功能
- 易于替换实现（如从 API 切换到本地存储）

### 4. **团队协作**

- 清晰的职责划分
- 减少代码冲突

### 5. **技术独立性**

- 业务逻辑不依赖特定框架
- 易于迁移到其他技术栈

---

## 注意事项

1. **不要过度设计**
   - 对于简单功能，可以适当简化
   - 保持实用性和可维护性的平衡

2. **渐进式迁移**
   - 不需要一次性重构所有代码
   - 可以按模块逐步迁移

3. **保持向后兼容**
   - 在迁移期间保持旧代码可用
   - 逐步更新导入路径

4. **文档和测试**
   - 及时更新文档
   - 编写充分的测试

---

## 参考资源

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture (Ports and Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://domainlanguage.com/ddd/)

---

**最后更新**: 2025-01-25
**作者**: AI Assistant
**状态**: 建议文档
