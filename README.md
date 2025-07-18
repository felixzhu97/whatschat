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

**前端**: Next.js 15, TypeScript, Tailwind CSS, Radix UI  
**后端**: Node.js, Express, Prisma, PostgreSQL, Redis  
**认证**: JWT, bcrypt  
**通信**: WebSocket, WebRTC  
**工具**: Turborepo, PNPM, ESLint, Prettier

## 📁 项目结构

```
whatschat/
├── apps/
│   ├── web/              # Next.js Web 应用
│   ├── mobile/           # Flutter 移动应用
│   └── server/           # Node.js 服务器应用
├── docs/                 # 文档和架构图
├── .kiro/               # Kiro AI 助手配置
└── turbo.json           # Turborepo 配置
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

编辑 `apps/server/.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis配置
REDIS_URL="redis://localhost:6379"

# JWT密钥（生产环境请使用强密钥）
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# 服务器配置
PORT=3001
HOST=localhost
NODE_ENV=development

# CORS配置
CORS_ORIGIN="http://localhost:3000"
```

#### 前端配置

```bash
cd apps/web
```

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. 数据库设置

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
- **后端API**: http://localhost:3001
- **API健康检查**: http://localhost:3001/health

## 🧪 测试认证系统

运行自动化测试脚本：

```bash
node test-auth.js
```

该脚本会测试：
- 服务器连接
- 用户注册
- 用户登录
- 获取用户信息
- 令牌刷新
- 用户登出
- 前端页面访问

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

```
POST /api/auth/register      # 用户注册
POST /api/auth/login         # 用户登录
POST /api/auth/logout        # 用户登出
GET  /api/auth/me           # 获取当前用户
PUT  /api/auth/profile      # 更新用户资料
PUT  /api/auth/change-password  # 修改密码
POST /api/auth/refresh-token    # 刷新令牌
POST /api/auth/forgot-password  # 忘记密码
POST /api/auth/reset-password   # 重置密码
```

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

- [系统上下文图](docs/01-system-context.puml)
- [容器图](docs/02-container-diagram.puml)
- [组件图](docs/03-component-diagram.puml)
- [代码图](docs/04-code-diagram.puml)
- [架构概览图](docs/05-architecture-overview.puml)

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t whatschat-server ./apps/server
docker build -t whatschat-web ./apps/web

# 运行容器
docker-compose up -d
```

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

### 添加新的 API 端点

1. 在 `apps/server/src/routes/` 中定义路由
2. 在 `apps/server/src/controllers/` 中实现控制器
3. 在 `apps/server/src/middleware/` 中添加中间件（如需要）
4. 更新 `apps/web/lib/api.ts` 中的 API 客户端

### 添加新的前端页面

1. 在 `apps/web/app/` 中创建页面
2. 在 `apps/web/components/` 中创建组件
3. 在 `apps/web/hooks/` 中添加自定义 hooks（如需要）
4. 更新路由和导航

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
