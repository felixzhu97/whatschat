# Docker 环境服务部署指南

本文档说明如何使用 Docker 启动 WhatsChat 环境服务（PostgreSQL 和 Redis）。

**注意**: 此配置只启动环境服务，不包含应用服务。应用需要在本地运行并连接到这些环境服务。

## 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0（或 docker-compose >= 1.29）

## 快速开始

### 1. 准备环境变量（可选）

环境变量文件是可选的，如果不创建 `.env` 文件，将使用默认配置：

```bash
# 从模板创建（可选）
cp env.docker.example .env

# 编辑 .env 文件，根据实际情况修改数据库和 Redis 配置
```

### 2. 启动服务

#### 开发环境

```bash
./docker-start.sh dev
```

#### 生产环境

```bash
./docker-start.sh prod
```

### 3. 停止服务

```bash
# 停止服务（保留数据）
./docker-stop.sh dev
# 或
./docker-stop.sh prod

# 停止服务并删除数据卷（会删除数据库数据）
./docker-stop.sh dev --remove-volumes
# 或
./docker-stop.sh prod --remove-volumes
```

## 手动使用 Docker Compose

### 开发环境

```bash
# 启动环境服务
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 查看日志
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# 停止
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### 生产环境

```bash
# 启动环境服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看日志
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# 停止
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 服务说明

### 包含的服务

1. **postgres** - PostgreSQL 数据库
   - 端口: 5432（开发环境暴露，生产环境仅内部访问）
   - 默认数据库: whatschat
   - 默认用户: whatschat
   - 默认密码: whatschat123
   - 数据持久化: Docker volume `postgres_data`
   - 连接字符串: `postgresql://whatschat:whatschat123@localhost:5432/whatschat`

2. **redis** - Redis 缓存
   - 端口: 6379（开发环境暴露，生产环境仅内部访问）
   - 数据持久化: Docker volume `redis_data`
   - 连接字符串: `redis://localhost:6379`

## 数据库迁移

数据库迁移需要在本地运行，连接到 Docker 中的数据库：

```bash
# 确保环境服务已启动
./docker-start.sh dev

# 在本地运行迁移
cd apps/server
pnpm migrate

# 或使用 migrate:deploy（生产环境）
pnpm migrate:deploy
```

## 查看日志

```bash
# 查看所有服务日志
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# 查看特定服务日志
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f redis
```

## 进入容器

```bash
# 进入 postgres 容器
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U whatschat -d whatschat

# 进入 redis 容器
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli
```

## 开发环境特性

- **端口暴露**: 数据库和 Redis 端口暴露到主机，方便本地工具连接
- **默认配置**: 使用简化的默认配置，便于快速启动

## 生产环境特性

- **资源限制**: CPU 和内存限制配置
- **安全配置**: 数据库和 Redis 端口不暴露到主机（仅内部网络访问）
- **数据持久化**: 使用 Docker volumes 持久化数据

## 数据持久化

数据存储在 Docker volumes 中：

- `postgres_data`: PostgreSQL 数据
- `redis_data`: Redis 数据

即使删除容器，数据也会保留。要删除数据，使用 `--remove-volumes` 参数。

## 故障排除

### 端口冲突

如果端口已被占用，修改 `.env` 文件中的端口配置：

```env
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### 数据库连接失败

1. 检查 postgres 容器是否正常运行：

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml ps postgres
   ```

2. 检查数据库健康状态：
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres pg_isready -U whatschat
   ```

### Redis 连接失败

1. 检查 redis 容器是否正常运行：

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml ps redis
   ```

2. 测试 Redis 连接：
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli ping
   ```

## 环境变量说明

主要环境变量（完整列表见 `env.docker.example`）：

- `POSTGRES_USER`: PostgreSQL 用户名（默认 whatschat）
- `POSTGRES_PASSWORD`: PostgreSQL 密码（默认 whatschat123）
- `POSTGRES_DB`: PostgreSQL 数据库名（默认 whatschat）
- `POSTGRES_PORT`: PostgreSQL 端口（默认 5432）
- `REDIS_PASSWORD`: Redis 密码（可选，默认无密码）
- `REDIS_PORT`: Redis 端口（默认 6379）

## 本地应用连接

启动环境服务后，在本地运行应用并连接到这些服务：

```bash
# 1. 启动环境服务
./docker-start.sh dev

# 2. 在本地运行应用
cd apps/server
pnpm dev

# 应用会自动连接到：
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

确保本地 `.env` 文件中的连接字符串指向 Docker 服务：

```env
DATABASE_URL=postgresql://whatschat:whatschat123@localhost:5432/whatschat?schema=public
REDIS_URL=redis://localhost:6379
```

## 安全建议

1. **生产环境必须修改**：
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`

2. **使用强密码**：密码长度至少 16 个字符，包含大小写字母、数字和特殊字符

3. **限制网络访问**：生产环境不要暴露数据库和 Redis 端口到主机

4. **定期更新镜像**：定期更新基础镜像以获取安全补丁

5. **使用 secrets**：生产环境考虑使用 Docker secrets 或外部密钥管理服务
