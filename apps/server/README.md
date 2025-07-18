# WhatsChat 服务器

WhatsChat 的后端服务器，提供用户认证、实时通信、消息处理等功能。

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### 安装依赖

```bash
pnpm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置：
```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis配置
REDIS_URL="redis://localhost:6379"

# JWT密钥（生产环境请使用强密钥）
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
```

### 数据库设置

1. 生成 Prisma 客户端：
```bash
pnpm db:generate
```

2. 运行数据库迁移：
```bash
pnpm migrate
```

3. 填充测试数据：
```bash
pnpm db:seed
```

### 启动服务器

开发模式：
```bash
pnpm dev
```

生产模式：
```bash
pnpm build
pnpm start
```

## API 文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+86 138 0000 0000"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### 刷新令牌
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

## 测试账户

数据库种子会创建以下测试账户：

- **管理员**: admin@whatschat.com / 123456
- **Alice**: alice@example.com / 123456
- **Bob**: bob@example.com / 123456
- **Charlie**: charlie@example.com / 123456

## 开发工具

### 数据库管理
```bash
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

# 运行测试
pnpm test

# 监听模式测试
pnpm test:watch
```

## 项目结构

```
src/
├── config/          # 配置文件
├── controllers/     # 控制器
├── database/        # 数据库相关
├── middleware/      # 中间件
├── routes/          # 路由定义
├── services/        # 业务服务
├── types/           # 类型定义
├── utils/           # 工具函数
└── index.ts         # 应用入口
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3001 |
| HOST | 服务器主机 | localhost |
| NODE_ENV | 运行环境 | development |
| DATABASE_URL | PostgreSQL 连接字符串 | - |
| REDIS_URL | Redis 连接字符串 | redis://localhost:6379 |
| JWT_SECRET | JWT 访问令牌密钥 | - |
| JWT_REFRESH_SECRET | JWT 刷新令牌密钥 | - |
| CORS_ORIGIN | 允许的跨域源 | http://localhost:3000 |

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 PostgreSQL 是否运行
   - 验证 DATABASE_URL 配置
   - 确保数据库已创建

2. **Redis 连接失败**
   - 检查 Redis 是否运行
   - 验证 REDIS_URL 配置

3. **端口被占用**
   - 修改 .env 文件中的 PORT 配置
   - 或者停止占用端口的进程

### 日志查看

日志文件位置：`logs/`
- `combined-YYYY-MM-DD.log` - 所有日志
- `error-YYYY-MM-DD.log` - 错误日志

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t whatschat-server .

# 运行容器
docker run -p 3001:3001 --env-file .env whatschat-server
```

### 生产环境注意事项

1. 使用强密钥替换 JWT_SECRET
2. 配置 HTTPS
3. 设置适当的 CORS 策略
4. 配置日志轮转
5. 设置监控和告警