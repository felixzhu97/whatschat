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

# 生成测试覆盖率
pnpm test:coverage
```

### API 文档

开发环境下，启动服务器后访问 Swagger API 文档：

- **Swagger UI**: http://localhost:3001/api/docs

API 文档包含所有端点的详细说明、请求/响应示例和认证方式。

## 项目结构

本项目采用**整洁架构（Clean Architecture）**设计，代码结构如下：

```
src/
├── domain/          # 领域层（核心业务）
│   ├── entities/   # 领域实体
│   │   ├── user.entity.ts
│   │   ├── chat.entity.ts
│   │   ├── message.entity.ts
│   │   └── group.entity.ts
│   └── interfaces/ # 接口定义
│       ├── repositories/ # 仓库接口
│       └── services/     # 服务接口
├── application/    # 应用层（业务逻辑）
│   ├── services/   # 应用服务
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── messages.service.ts
│   │   ├── chats.service.ts
│   │   ├── groups.service.ts
│   │   ├── calls.service.ts
│   │   └── status.service.ts
│   └── dto/        # 数据传输对象
│       ├── auth.dto.ts
│       ├── user.dto.ts
│       └── message.dto.ts
├── infrastructure/ # 基础设施层（外部依赖）
│   ├── database/   # 数据库服务
│   │   ├── database.module.ts
│   │   ├── prisma.service.ts
│   │   └── redis.service.ts
│   ├── adapters/   # 适配器实现
│   │   └── repositories/
│   └── config/     # 配置服务
│       └── config.service.ts
├── presentation/   # 表现层（API 接口）
│   ├── auth/       # 认证模块
│   ├── users/      # 用户模块
│   ├── messages/   # 消息模块
│   ├── chats/      # 聊天模块
│   ├── groups/     # 群组模块
│   ├── calls/      # 通话模块
│   ├── status/     # 状态模块
│   ├── websocket/  # WebSocket 网关
│   ├── health/     # 健康检查
│   ├── filters/    # 异常过滤器
│   └── interceptors/ # 拦截器
├── shared/         # 共享工具
│   └── utils/      # 工具函数
│       ├── logger.ts
│       └── validation.ts
├── database/       # 数据库相关
│   ├── client.ts
│   └── seed.ts
├── app.module.ts  # 应用根模块
└── main.ts         # 应用入口
```

### 架构层次职责

- **领域层 (Domain)**: 定义核心业务实体和接口，不依赖任何外部框架
- **应用层 (Application)**: 实现业务逻辑，使用领域接口，包含应用服务和 DTO
- **基础设施层 (Infrastructure)**: 实现外部依赖（数据库、缓存、文件存储等）
- **表现层 (Presentation)**: 处理 HTTP 请求、WebSocket 连接、异常处理等

## 环境变量说明

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| **服务器配置** |
| NODE_ENV | 运行环境 | development | ✅ |
| PORT | 服务器端口 | 3001 | ✅ |
| HOST | 服务器主机 | localhost | ✅ |
| **数据库配置** |
| DATABASE_URL | PostgreSQL 连接字符串 | - | ✅ |
| **Redis配置** |
| REDIS_URL | Redis 连接字符串 | redis://localhost:6379 | ✅ |
| REDIS_PASSWORD | Redis 密码 | - | ❌ |
| **JWT配置** |
| JWT_SECRET | JWT 访问令牌密钥（至少32字符） | - | ✅ |
| JWT_EXPIRES_IN | JWT 访问令牌过期时间 | 7d | ❌ |
| JWT_REFRESH_SECRET | JWT 刷新令牌密钥（至少32字符） | - | ✅ |
| JWT_REFRESH_EXPIRES_IN | JWT 刷新令牌过期时间 | 30d | ❌ |
| **文件存储配置 (AWS S3)** |
| AWS_ACCESS_KEY_ID | AWS 访问密钥ID | - | ❌ |
| AWS_SECRET_ACCESS_KEY | AWS 密钥 | - | ❌ |
| AWS_REGION | AWS 区域 | us-east-1 | ❌ |
| AWS_S3_BUCKET | S3 存储桶名称 | - | ❌ |
| AWS_S3_ENDPOINT | S3 端点（用于兼容S3的服务） | - | ❌ |
| **邮件服务配置** |
| SMTP_HOST | SMTP 服务器地址 | smtp.gmail.com | ❌ |
| SMTP_PORT | SMTP 端口 | 587 | ❌ |
| SMTP_USER | SMTP 用户名 | - | ❌ |
| SMTP_PASS | SMTP 密码 | - | ❌ |
| SMTP_FROM | 发件人邮箱 | noreply@whatschat.com | ❌ |
| **搜索引擎配置 (Elasticsearch)** |
| ELASTICSEARCH_NODE | Elasticsearch 节点地址 | http://localhost:9200 | ❌ |
| ELASTICSEARCH_USERNAME | Elasticsearch 用户名 | - | ❌ |
| ELASTICSEARCH_PASSWORD | Elasticsearch 密码 | - | ❌ |
| **推送服务配置** |
| FCM_SERVER_KEY | Firebase Cloud Messaging 服务器密钥 | - | ❌ |
| APN_KEY_ID | Apple Push Notification 密钥ID | - | ❌ |
| APN_TEAM_ID | Apple Push Notification 团队ID | - | ❌ |
| APN_BUNDLE_ID | Apple 应用包ID | com.whatschat.app | ❌ |
| **WebRTC配置** |
| WEBRTC_STUN_SERVERS | STUN 服务器地址（逗号分隔） | stun:stun.l.google.com:19302 | ❌ |
| WEBRTC_TURN_SERVERS | TURN 服务器地址 | - | ❌ |
| WEBRTC_TURN_USERNAME | TURN 服务器用户名 | - | ❌ |
| WEBRTC_TURN_CREDENTIAL | TURN 服务器凭证 | - | ❌ |
| **日志配置** |
| LOG_LEVEL | 日志级别 | info | ❌ |
| LOG_FILE_PATH | 日志文件路径 | logs/app.log | ❌ |
| **安全配置** |
| CORS_ORIGIN | 允许的跨域源（逗号分隔） | http://localhost:3000 | ✅ |
| RATE_LIMIT_WINDOW_MS | 速率限制时间窗口（毫秒） | 900000 | ❌ |
| RATE_LIMIT_MAX_REQUESTS | 速率限制最大请求数 | 100 | ❌ |
| **监控配置** |
| SENTRY_DSN | Sentry 错误追踪 DSN | - | ❌ |
| PROMETHEUS_PORT | Prometheus 指标端口 | 9090 | ❌ |

完整的环境变量示例请参考 `env.example` 文件。

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

#### 使用 Docker Compose（推荐）

```bash
# 启动开发环境（包含 PostgreSQL 和 Redis）
./docker-start.sh dev

# 启动生产环境
./docker-start.sh prod

# 停止服务
./docker-stop.sh

# 或者直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up -d   # 开发环境
docker-compose -f docker-compose.prod.yml up -d  # 生产环境
```

#### 单独构建镜像

```bash
# 构建镜像
docker build -t whatschat-server .

# 运行容器
docker run -p 3001:3001 --env-file .env whatschat-server
```

### 生产环境注意事项

1. **安全配置**
   - 使用强密钥替换 JWT_SECRET 和 JWT_REFRESH_SECRET（至少32字符）
   - 配置 HTTPS
   - 设置适当的 CORS 策略
   - 启用速率限制

2. **数据库**
   - 配置数据库连接池
   - 设置数据库备份策略
   - 使用只读副本进行查询（如需要）

3. **Redis**
   - 配置 Redis 持久化
   - 设置 Redis 密码
   - 配置 Redis 集群（高可用）

4. **日志和监控**
   - 配置日志轮转
   - 设置 Sentry 错误追踪
   - 配置 Prometheus 指标收集
   - 设置告警规则

5. **性能优化**
   - 启用压缩中间件
   - 配置 CDN（静态资源）
   - 使用负载均衡器
   - 配置缓存策略

6. **环境变量**
   - 使用环境变量管理工具（如 AWS Secrets Manager）
   - 不要在代码中硬编码敏感信息
   - 定期轮换密钥和凭证

更多部署信息请查看 [Docker 部署文档](./DOCKER.md)。