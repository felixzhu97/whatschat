# WhatsChat

一个现代化的即时通讯应用，基于 React 和 TypeScript 构建，支持实时聊天、语音视频通话、文件共享等功能。

## ✨ 功能特性

- 🔥 **实时聊天** - 支持文本、表情、语音消息
- 📞 **语音视频通话** - 基于 WebRTC 的高质量通话
- 📎 **文件共享** - 支持图片、文档等文件类型
- 👥 **联系人管理** - 添加、删除、搜索联系人
- 🔍 **消息搜索** - 全文搜索聊天记录
- 📱 **响应式设计** - 支持桌面和移动设备
- 🔐 **完整认证系统** - 注册、登录、JWT令牌管理

## 🛠️ 技术栈

**前端**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Zustand  
**后端**: NestJS 10, TypeScript, Prisma, PostgreSQL, Redis  
**认证**: JWT, Passport, bcrypt  
**通信**: WebSocket (Socket.IO), WebRTC  
**测试**: Vitest, React Testing Library  
**工具**: Turborepo, PNPM, ESLint, Prettier

## 📁 项目结构

```
whatschat/
├── apps/
│   ├── web/              # Next.js Web 应用
│   │   ├── app/          # Next.js App Router 页面
│   │   ├── components/   # React 组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── lib/          # 工具函数和 API 客户端
│   │   └── stores/       # Zustand 状态管理
│   ├── mobile/           # Flutter 移动应用
│   │   ├── lib/
│   │   │   ├── screens/  # 页面组件
│   │   │   ├── widgets/  # UI 组件
│   │   │   ├── models/  # 数据模型
│   │   │   └── services/# 服务层
│   └── server/           # NestJS 服务器应用（整洁架构）
│       └── src/
│           ├── domain/      # 领域层（实体、接口）
│           ├── application/ # 应用层（服务、DTO）
│           ├── infrastructure/ # 基础设施层（数据库、外部服务）
│           ├── presentation/ # 表现层（控制器、网关）
│           └── shared/     # 共享工具
├── docs/                 # 文档和架构图
├── turbo.json           # Turborepo 配置
└── package.json         # 工作区配置
```

## 🔧 快速开始

### 环境要求

- Node.js >= 18.0.0
- PNPM >= 9.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### 1. 克隆项目

```bash
git clone https://github.com/your-username/whatschat.git
cd whatschat
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

#### 后端配置

```bash
cd apps/server
cp .env.example .env
```

编辑 `apps/server/.env` 文件（参考 `env.example`）：

```env
# 服务器配置
NODE_ENV=development
PORT=3001
HOST=localhost

# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis配置
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT配置（至少32个字符，生产环境请使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# 安全配置
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件存储配置 (AWS S3) - 可选
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=whatschat-files

# 邮件服务配置 - 可选
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@whatschat.com

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

更多配置项请参考 `apps/server/env.example` 文件。

#### 前端配置

```bash
cd apps/web
```

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### 4. 数据库设置

#### 使用 Docker（推荐）

```bash
cd apps/server

# 启动数据库服务（PostgreSQL + Redis）
./docker-start.sh dev

# 生成 Prisma 客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 填充测试数据
pnpm db:seed
```

#### 手动设置

如果已有 PostgreSQL 和 Redis 服务：

```bash
cd apps/server

# 生成 Prisma 客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 填充测试数据
pnpm db:seed
```

### 5. 启动应用

#### 方式一：分别启动（推荐用于开发）

```bash
# 启动后端服务器（终端1）
cd apps/server
pnpm dev

# 启动前端应用（终端2）
cd apps/web
pnpm dev
```

#### 方式二：同时启动所有服务

```bash
# 在项目根目录
pnpm dev
```

### 6. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001/api/v1
- **API文档 (Swagger)**: http://localhost:3001/api/docs（开发环境）
- **健康检查**: http://localhost:3001/api/v1/health

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
cd apps/server && pnpm test:coverage
cd apps/web && pnpm test:coverage
```

### 测试框架

- **后端**: Vitest + Supertest
- **前端**: Vitest + React Testing Library

## 👤 测试账户

数据库种子会创建以下测试账户：

- **管理员**: admin@whatschat.com / 123456
- **Alice**: alice@example.com / 123456
- **Bob**: bob@example.com / 123456
- **Charlie**: charlie@example.com / 123456

## 🔐 认证功能

### 已实现功能

- ✅ 用户注册（用户名、邮箱、手机号、密码）
- ✅ 用户登录（邮箱/密码）
- ✅ JWT 访问令牌和刷新令牌
- ✅ 自动令牌刷新
- ✅ 用户登出
- ✅ 获取当前用户信息
- ✅ 更新用户资料
- ✅ 修改密码
- ✅ 忘记密码（基础实现）
- ✅ 密码重置（基础实现）
- ✅ 前端认证状态管理
- ✅ 路由保护
- ✅ 表单验证

### API 端点

所有 API 端点前缀为 `/api/v1`：

```
POST /api/v1/auth/register      # 用户注册
POST /api/v1/auth/login         # 用户登录
POST /api/v1/auth/logout        # 用户登出
GET  /api/v1/auth/me           # 获取当前用户
PUT  /api/v1/auth/profile      # 更新用户资料
PUT  /api/v1/auth/change-password  # 修改密码
POST /api/v1/auth/refresh-token    # 刷新令牌
POST /api/v1/auth/forgot-password  # 忘记密码
POST /api/v1/auth/reset-password   # 重置密码
```

**API 文档**: 开发环境下访问 http://localhost:3001/api/docs 查看完整的 Swagger API 文档。

## 🛠️ 开发工具

### 数据库管理

```bash
cd apps/server

# 打开 Prisma Studio
pnpm db:studio

# 重置数据库
pnpm db:reset

# 推送 schema 变更
pnpm db:push
```

### 代码质量

```bash
# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format

# 类型检查
pnpm check-types
```

## 🏗️ 架构设计

查看 `docs/` 文件夹中的 C4 架构图：

- [系统上下文图](docs/architecture/c4-system-context.puml)
- [容器图](docs/architecture/c4-container.puml)
- [组件图](docs/architecture/c4-web-components.puml)
- [代码图](docs/architecture/c4-code.puml)
- [架构概览图](docs/architecture/architecture-overview.puml)

## 🚀 部署

### Docker 部署

```bash
cd apps/server

# 使用 docker-compose 启动所有服务（开发环境）
./docker-start.sh dev

# 使用 docker-compose 启动所有服务（生产环境）
./docker-start.sh prod

# 停止服务
./docker-stop.sh

# 或者直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d  # 开发环境
docker-compose -f docker-compose.prod.yml up -d # 生产环境
```

更多 Docker 部署信息请查看 [服务器 Docker 文档](docs/server/DOCKER.md)。

### 生产环境注意事项

1. 使用强密钥替换 JWT_SECRET
2. 配置 HTTPS
3. 设置适当的 CORS 策略
4. 配置数据库连接池
5. 设置 Redis 持久化
6. 配置日志轮转
7. 设置监控和告警

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行
   - 验证 DATABASE_URL 配置
   - 确保数据库已创建

2. **Redis 连接失败**
   - 检查 Redis 是否运行
   - 验证 REDIS_URL 配置

3. **前端无法连接后端**
   - 检查后端服务器是否运行在 3001 端口
   - 验证 NEXT_PUBLIC_API_URL 配置
   - 检查 CORS 配置

4. **认证失败**
   - 检查 JWT_SECRET 配置
   - 验证令牌是否过期
   - 检查用户是否存在

## 📚 开发指南

### 后端开发（NestJS 整洁架构）

项目采用整洁架构（Clean Architecture）设计，分为以下层次：

1. **领域层 (domain/)**: 实体和接口定义
   - `entities/`: 领域实体
   - `interfaces/`: 仓库和服务接口

2. **应用层 (application/)**: 业务逻辑
   - `services/`: 应用服务
   - `dto/`: 数据传输对象

3. **基础设施层 (infrastructure/)**: 外部依赖实现
   - `database/`: 数据库服务（Prisma、Redis）
   - `adapters/`: 适配器实现

4. **表现层 (presentation/)**: API 接口
   - `controllers/`: REST API 控制器
   - `websocket/`: WebSocket 网关
   - `filters/`: 异常过滤器
   - `interceptors/`: 拦截器

#### 添加新的 API 端点

1. 在 `domain/entities/` 中定义实体（如需要）
2. 在 `application/services/` 中实现业务逻辑
3. 在 `application/dto/` 中定义 DTO
4. 在 `presentation/` 中创建控制器和模块
5. 在 `infrastructure/adapters/` 中实现仓库适配器（如需要）
6. 更新 `apps/web/lib/api.ts` 中的 API 客户端

### 前端开发

1. 在 `apps/web/app/` 中创建页面（Next.js App Router）
2. 在 `apps/web/components/` 中创建组件
3. 在 `apps/web/hooks/` 中添加自定义 hooks
4. 在 `apps/web/stores/` 中添加状态管理（Zustand）
5. 更新路由和导航

## 👥 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目使用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👥 作者

- **Felix Zhu** - _初始开发_ - [felix zhu](mailto:z1434866867@gmail.com)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者。

---

<p align="center">
  <strong>WhatsChat - 连接世界，沟通无界</strong>
</p>
