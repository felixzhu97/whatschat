# WhatsChat Server

WhatsChat 的后端服务器，基于 NestJS 框架构建。

## 📚 文档

完整的服务器文档已移至项目文档中心：

👉 **[查看完整文档](../../docs/server/README.md)**

## 快速链接

- [快速开始](../../docs/server/README.md#快速开始)
- [API 文档](../../docs/server/README.md#api-文档)
- [Docker 部署](../../docs/server/DOCKER.md)
- [迁移说明](../../docs/server/MIGRATION.md)
- [测试指南](../../docs/server/testing.md)

## 快速启动

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp env.example .env

# 启动数据库服务（使用Docker）
./docker-start.sh dev

# 运行数据库迁移
pnpm migrate

# 启动开发服务器
pnpm dev
```

更多详细信息请查看 [完整文档](../../docs/server/README.md)。

