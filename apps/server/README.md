# WhatsChat Server

WhatsChat 的后端服务器，基于 **NestJS 10** 框架构建，采用**整洁架构（Clean Architecture）**设计。

## 📚 文档

完整的服务器文档已移至项目文档中心：

👉 **[查看完整文档](../../docs/server/README.md)**

## 快速链接

- [快速开始](../../docs/server/README.md#快速开始)
- [API 文档](../../docs/server/README.md#api-文档)
- [Docker 部署](../../docs/server/DOCKER.md)
- [迁移说明](../../docs/server/MIGRATION.md)
- [测试指南](../../docs/server/testing.md)

## 🏗️ 架构设计

本项目采用**整洁架构（Clean Architecture）**，将代码分为以下层次：

```
src/
├── domain/          # 领域层
│   ├── entities/   # 领域实体
│   └── interfaces/ # 接口定义（仓库、服务）
├── application/     # 应用层
│   ├── services/   # 应用服务（业务逻辑）
│   └── dto/        # 数据传输对象
├── infrastructure/ # 基础设施层
│   ├── database/   # 数据库服务（Prisma、Redis）
│   ├── adapters/   # 适配器实现
│   └── config/     # 配置服务
├── presentation/   # 表现层
│   ├── auth/       # 认证模块
│   ├── users/      # 用户模块
│   ├── messages/   # 消息模块
│   ├── chats/      # 聊天模块
│   ├── groups/     # 群组模块
│   ├── calls/      # 通话模块
│   ├── status/     # 状态模块
│   ├── websocket/  # WebSocket 网关
│   ├── filters/    # 异常过滤器
│   └── interceptors/ # 拦截器
└── shared/         # 共享工具
    └── utils/      # 工具函数
```

### 架构层次说明

- **领域层 (Domain)**: 核心业务实体和接口，不依赖任何外部框架
- **应用层 (Application)**: 业务逻辑实现，使用领域接口
- **基础设施层 (Infrastructure)**: 外部依赖实现（数据库、缓存、外部服务）
- **表现层 (Presentation)**: API 接口、WebSocket 网关、中间件

## 快速启动

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp env.example .env

# 启动数据库服务（使用Docker）
./docker-start.sh dev

# 生成 Prisma 客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 填充测试数据（可选）
pnpm db:seed

# 启动开发服务器
pnpm dev
```

启动后访问：
- **API**: http://localhost:3001/api/v1
- **API 文档 (Swagger)**: http://localhost:3001/api/docs
- **健康检查**: http://localhost:3001/api/v1/health

## 🛠️ 开发命令

```bash
# 开发模式（热重载）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 运行测试
pnpm test

# 监听模式测试
pnpm test:watch

# 生成测试覆盖率
pnpm test:coverage

# 数据库相关
pnpm db:generate    # 生成 Prisma 客户端
pnpm migrate         # 运行数据库迁移
pnpm db:studio       # 打开 Prisma Studio
pnpm db:seed         # 填充测试数据
pnpm db:reset        # 重置数据库
pnpm db:push         # 推送 schema 变更
```

## 📦 技术栈

- **框架**: NestJS 10
- **语言**: TypeScript
- **数据库**: PostgreSQL (Prisma ORM)
- **缓存**: Redis
- **认证**: JWT, Passport
- **WebSocket**: Socket.IO
- **API 文档**: Swagger/OpenAPI
- **测试**: Vitest, Supertest
- **日志**: Winston

更多详细信息请查看 [完整文档](../../docs/server/README.md)。

