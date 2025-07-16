# WhatsChat 服务器

WhatsChat的Node.js后端服务器，提供完整的即时通讯功能。

## 🚀 功能特性

- **用户认证**: JWT认证、密码加密、刷新令牌
- **实时通信**: WebSocket支持、Socket.IO集成
- **消息系统**: 文本、图片、视频、音频、文件消息
- **群组聊天**: 群组创建、管理、权限控制
- **音视频通话**: WebRTC集成、STUN/TURN服务器支持
- **状态分享**: 24小时状态、图片/视频状态
- **文件上传**: 支持多种文件类型、图片压缩
- **搜索功能**: 全文搜索、消息搜索
- **推送通知**: FCM/APNs集成
- **数据持久化**: PostgreSQL数据库、Redis缓存

## 🛠 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **实时通信**: Socket.IO
- **认证**: JWT + bcrypt
- **文件存储**: AWS S3/MinIO
- **搜索**: Elasticsearch
- **日志**: Winston
- **语言**: TypeScript

## 📋 系统要求

- Node.js 18.0.0 或更高版本
- PostgreSQL 12 或更高版本
- Redis 6 或更高版本
- pnpm 包管理器

## 🚀 快速开始

### 1. 安装依赖

```bash
cd apps/server
pnpm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# 服务器配置
NODE_ENV=development
PORT=3001
HOST=localhost

# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis配置
REDIS_URL=redis://localhost:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

### 3. 数据库设置

```bash
# 生成Prisma客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 可选：填充测试数据
pnpm db:seed
```

### 4. 启动服务器

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

服务器将在 `http://localhost:3001` 启动。

## 📁 项目结构

```
src/
├── config/           # 配置文件
├── controllers/      # 控制器
├── database/         # 数据库连接
├── middleware/       # 中间件
├── routes/           # 路由定义
├── services/         # 业务服务
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
└── index.ts         # 应用入口
```

## 🔌 API 端点

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh-token` - 刷新令牌
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/change-password` - 修改密码
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 用户相关

- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/:id/block` - 阻止用户
- `DELETE /api/users/:id/block` - 取消阻止用户

### 聊天相关

- `GET /api/chats` - 获取聊天列表
- `POST /api/chats` - 创建聊天
- `GET /api/chats/:id` - 获取聊天详情
- `PUT /api/chats/:id` - 更新聊天信息
- `DELETE /api/chats/:id` - 删除聊天
- `POST /api/chats/:id/archive` - 归档聊天
- `POST /api/chats/:id/mute` - 静音聊天

### 消息相关

- `GET /api/messages` - 获取消息列表
- `POST /api/messages` - 发送消息
- `GET /api/messages/:id` - 获取消息详情
- `PUT /api/messages/:id` - 编辑消息
- `DELETE /api/messages/:id` - 删除消息
- `POST /api/messages/:id/reactions` - 添加反应
- `DELETE /api/messages/:id/reactions` - 删除反应

### 群组相关

- `GET /api/groups` - 获取群组列表
- `POST /api/groups` - 创建群组
- `GET /api/groups/:id` - 获取群组详情
- `PUT /api/groups/:id` - 更新群组信息
- `DELETE /api/groups/:id` - 删除群组
- `POST /api/groups/:id/participants` - 添加群组成员
- `DELETE /api/groups/:id/participants/:userId` - 移除群组成员
- `PUT /api/groups/:id/participants/:userId/role` - 更改成员角色

### 通话相关

- `GET /api/calls` - 获取通话记录
- `POST /api/calls` - 发起通话
- `GET /api/calls/:id` - 获取通话详情
- `PUT /api/calls/:id/answer` - 接听通话
- `PUT /api/calls/:id/reject` - 拒绝通话
- `PUT /api/calls/:id/end` - 结束通话

### 状态相关

- `GET /api/status` - 获取状态列表
- `POST /api/status` - 发布状态
- `GET /api/status/:id` - 获取状态详情
- `DELETE /api/status/:id` - 删除状态
- `POST /api/status/:id/view` - 标记状态为已查看

### 文件相关

- `POST /api/files/upload` - 上传文件
- `GET /api/files/:id` - 获取文件信息
- `DELETE /api/files/:id` - 删除文件

### 搜索相关

- `GET /api/search` - 搜索消息、用户、文件

### 通知相关

- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/:id/read` - 标记通知为已读
- `DELETE /api/notifications/:id` - 删除通知

## 🔧 开发命令

```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 代码格式化
pnpm lint:fix

# 运行测试
pnpm test

# 数据库相关
pnpm migrate          # 运行迁移
pnpm migrate:deploy   # 部署迁移
pnpm db:generate      # 生成Prisma客户端
pnpm db:studio        # 打开Prisma Studio
pnpm db:seed          # 填充测试数据
```

## 🔐 安全特性

- JWT认证和授权
- 密码加密存储
- 请求速率限制
- CORS配置
- 输入验证和清理
- SQL注入防护
- XSS防护
- CSRF防护

## 📊 监控和日志

- Winston日志系统
- 请求日志记录
- 错误日志记录
- 性能监控
- 健康检查端点

## 🚀 部署

### Docker部署

```bash
# 构建镜像
docker build -t whatschat-server .

# 运行容器
docker run -p 3001:3001 whatschat-server
```

### 环境变量

生产环境需要配置以下环境变量：

- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL连接字符串
- `REDIS_URL` - Redis连接字符串
- `JWT_SECRET` - JWT密钥
- `JWT_REFRESH_SECRET` - JWT刷新密钥
- `AWS_ACCESS_KEY_ID` - AWS访问密钥
- `AWS_SECRET_ACCESS_KEY` - AWS秘密密钥
- `AWS_S3_BUCKET` - S3存储桶名称

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到问题或有疑问，请：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系开发团队

## 🔗 相关链接

- [前端应用](../web/README.md)
- [移动应用](../mobile/README.md)
- [项目文档](../../docs/README.md)
