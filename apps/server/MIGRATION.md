# Express到NestJS迁移说明

## 迁移完成

项目已从Express框架完全迁移到NestJS框架。

## 主要变更

### 新的文件结构

```
src/
├── main.ts                          # NestJS应用入口
├── app.module.ts                    # 根模块
├── infrastructure/                  # 基础设施层
│   ├── config/                     # 配置模块
│   └── database/                   # 数据库模块
├── application/                     # 应用层
│   ├── dto/                        # 数据传输对象
│   └── services/                   # 应用服务
├── domain/                          # 领域层（保持不变）
└── presentation/                    # 表现层
    ├── controllers/                # NestJS控制器
    ├── guards/                     # 认证守卫
    ├── interceptors/               # 拦截器
    ├── filters/                     # 异常过滤器
    └── websocket/                  # WebSocket网关
```

### 已废弃的文件

以下Express相关文件已不再使用，但保留作为参考：

- `src/index.ts` - 旧的Express入口文件
- `src/app.ts` - 旧的Express应用配置
- `src/routes/` - 旧的Express路由
- `src/controllers/` - 旧的Express控制器
- `src/middleware/` - 旧的Express中间件
- `src/services/socket-manager.ts` - 旧的Socket管理器
- `src/services/socket.ts` - 旧的Socket处理

### 启动方式

现在使用NestJS CLI启动：

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start:prod
```

### API端点

所有API端点保持不变，仍然使用 `/api/v1` 前缀。

### 环境变量

环境变量配置保持不变，但现在通过 `@nestjs/config` 管理。

## 下一步

1. 可以安全删除旧的Express相关文件
2. 更新测试代码以使用NestJS测试框架
3. 完善业务模块的实现（目前部分模块为占位符）
