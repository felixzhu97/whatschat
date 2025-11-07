# 整洁架构快速参考指南

## 📐 目录结构对比

### Web 应用 (`apps/web/`)

#### ❌ 当前结构（问题）

```
apps/web/
├── components/          # UI + 业务逻辑混合
├── hooks/              # 业务逻辑分散
├── stores/             # 状态 + 业务逻辑
├── lib/                # API、WebSocket 直接调用
└── types/              # 类型定义
```

#### ✅ 推荐结构（整洁架构）

```
apps/web/src/
├── domain/             # 实体层（最内层）
│   ├── entities/       # 业务对象
│   └── interfaces/     # 领域接口
│
├── application/        # 用例层
│   ├── use-cases/     # 业务用例
│   ├── dto/           # 数据传输对象
│   └── ports/         # 端口（接口定义）
│
├── infrastructure/     # 接口适配器 + 框架层
│   ├── adapters/      # 适配器实现
│   ├── framework/     # 框架（API、WebSocket）
│   └── presentation/  # 展示层（Hooks、Stores）
│
└── ui/                # UI 组件层
    └── components/    # 纯 UI 组件
```

---

### Server 应用 (`apps/server/src/`)

#### ❌ 当前结构（问题）

```
apps/server/src/
├── controllers/       # 控制器 + 业务逻辑
├── services/          # 部分业务逻辑
├── routes/            # 路由
└── database/          # 数据库直接暴露
```

#### ✅ 推荐结构（整洁架构）

```
apps/server/src/
├── domain/            # 实体层（最内层）
│   ├── entities/      # 业务对象
│   └── interfaces/    # 领域接口
│
├── application/       # 用例层
│   ├── use-cases/    # 业务用例
│   ├── dto/          # 数据传输对象
│   └── ports/        # 端口（接口定义）
│
└── infrastructure/    # 接口适配器 + 框架层
    ├── adapters/     # 适配器实现（Prisma、Redis）
    ├── framework/    # 框架（Express、数据库）
    └── presentation/ # 展示层（Controllers、Routes）
```

---

## 🔄 依赖方向规则

```
┌─────────────────────────────────────┐
│   UI / Framework                    │  ← 最外层
│   (React, Next.js, Express)         │
└──────────────┬──────────────────────┘
               │ 依赖 ↓
┌──────────────▼──────────────────────┐
│   Presentation / Adapters            │
│   (Hooks, Stores, Controllers)       │
└──────────────┬──────────────────────┘
               │ 依赖 ↓
┌──────────────▼──────────────────────┐
│   Use Cases                          │
│   (业务逻辑)                          │
└──────────────┬──────────────────────┘
               │ 依赖 ↓
┌──────────────▼──────────────────────┐
│   Entities                          │  ← 最内层
│   (业务对象)                         │
└─────────────────────────────────────┘
```

**规则**: 内层不依赖外层，依赖只能指向内层。

---

## 📝 代码示例对比

### ❌ 当前方式（业务逻辑在 Hook 中）

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState(null);

  const login = async (email: string, password: string) => {
    // 业务逻辑直接在这里
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setUser(data.user);
    localStorage.setItem("token", data.token);
  };

  return { user, login };
}
```

### ✅ 整洁架构方式

```typescript
// 1. 实体层
// domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}
}

// 2. 用例层
// application/use-cases/auth/login.use-case.ts
export class LoginUseCase {
  constructor(private authRepository: AuthRepositoryPort) {}

  async execute(dto: LoginDto): Promise<User> {
    // 业务逻辑在这里
    const user = await this.authRepository.findByEmail(dto.email);
    // ... 验证、处理
    return user;
  }
}

// 3. 适配器层
// infrastructure/adapters/repositories/api-auth.repository.ts
export class ApiAuthRepository implements AuthRepositoryPort {
  async findByEmail(email: string): Promise<User> {
    const response = await fetch(`/api/auth/login`);
    return UserMapper.toDomain(response.data);
  }
}

// 4. 展示层
// infrastructure/presentation/hooks/use-auth.hook.ts
export function useAuth() {
  const { loginUseCase } = useDependencies();
  const { user, setUser } = useAuthStore();

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute({ email, password });
    setUser(user);
  };

  return { user, login };
}
```

---

## 🎯 关键原则

### 1. 实体层（Domain）

- ✅ 纯业务对象，无框架依赖
- ✅ 包含业务规则和验证
- ❌ 不依赖数据库、API、UI

### 2. 用例层（Application）

- ✅ 实现业务用例
- ✅ 协调实体和仓储
- ❌ 不依赖框架细节

### 3. 适配器层（Infrastructure）

- ✅ 实现用例层定义的接口
- ✅ 处理数据转换
- ✅ 连接用例和框架

### 4. 框架层（Framework）

- ✅ UI 框架（React、Next.js）
- ✅ HTTP 客户端、WebSocket
- ✅ 数据库（Prisma、Redis）

---

## 🚀 迁移步骤

1. **创建新目录结构** → 保持旧代码可用
2. **迁移实体** → 从 `types/` 提取到 `domain/entities/`
3. **创建用例** → 从 `hooks/`、`stores/` 提取业务逻辑
4. **实现适配器** → 实现仓储和服务接口
5. **重构 Hooks** → 仅用于状态绑定，调用用例
6. **清理旧代码** → 删除已迁移的代码

---

## 📚 文件映射指南

### Web 应用

| 当前位置            | 目标位置                                                             | 说明                   |
| ------------------- | -------------------------------------------------------------------- | ---------------------- |
| `types/index.ts`    | `domain/entities/*.entity.ts`                                        | 实体定义               |
| `hooks/use-auth.ts` | `application/use-cases/auth/` + `infrastructure/presentation/hooks/` | 分离业务逻辑和状态绑定 |
| `stores/*.store.ts` | `infrastructure/presentation/stores/`                                | 仅保留状态管理         |
| `lib/api.ts`        | `infrastructure/framework/api/`                                      | API 客户端             |
| `lib/websocket.ts`  | `infrastructure/framework/websocket/`                                | WebSocket 客户端       |
| `components/*.tsx`  | `ui/components/`                                                     | 纯 UI 组件             |

### Server 应用

| 当前位置             | 目标位置                                   | 说明                 |
| -------------------- | ------------------------------------------ | -------------------- |
| `types/index.ts`     | `domain/entities/*.entity.ts`              | 实体定义             |
| `services/*.ts`      | `application/use-cases/*/`                 | 业务用例             |
| `controllers/*.ts`   | `infrastructure/presentation/controllers/` | 控制器（仅路由处理） |
| `database/client.ts` | `infrastructure/framework/database/`       | 数据库客户端         |
| `routes/*.ts`        | `infrastructure/presentation/routes/`      | 路由定义             |

---

## ⚠️ 常见错误

### ❌ 错误 1: 实体依赖框架

```typescript
// 错误
import { Prisma } from "@prisma/client";
export class User {
  constructor(public prismaData: Prisma.User) {}
}
```

### ✅ 正确: 实体独立

```typescript
// 正确
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}
}
```

### ❌ 错误 2: 用例直接调用 API

```typescript
// 错误
export class LoginUseCase {
  async execute(dto: LoginDto) {
    const response = await fetch("/api/auth/login");
    // ...
  }
}
```

### ✅ 正确: 用例使用接口

```typescript
// 正确
export class LoginUseCase {
  constructor(private authRepository: AuthRepositoryPort) {}

  async execute(dto: LoginDto) {
    return await this.authRepository.findByEmail(dto.email);
  }
}
```

### ❌ 错误 3: Hook 包含业务逻辑

```typescript
// 错误
export function useAuth() {
  const login = async (email: string, password: string) => {
    // 业务逻辑在这里
    if (!email || !password) throw new Error("...");
    const user = await validateUser(email, password);
    // ...
  };
}
```

### ✅ 正确: Hook 仅调用用例

```typescript
// 正确
export function useAuth() {
  const { loginUseCase } = useDependencies();

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute({ email, password });
    setUser(user);
  };
}
```

---

## 📖 更多信息

详细文档请参考：[clean-architecture-refactoring.md](./clean-architecture-refactoring.md)

---

**快速参考版本**: 1.0  
**最后更新**: 2025-01-25
