# 多阶段构建 Dockerfile
# 阶段1: 依赖安装和构建
FROM node:18-alpine AS builder

# 安装 OpenSSL 和其他必要的依赖（Prisma 需要）
RUN apk add --no-cache openssl openssl-dev libc6-compat

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 复制根目录的包管理文件（monorepo 需要）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 server 的 package.json
COPY apps/server/package.json ./apps/server/

# 安装依赖（在根目录执行，支持 monorepo）
RUN pnpm install --frozen-lockfile

# 复制 server 源代码
COPY apps/server ./apps/server

# 切换到 server 目录
WORKDIR /app/apps/server

# 生成 Prisma 客户端
RUN pnpm db:generate

# 构建应用
RUN pnpm build

# 阶段2: 生产运行时镜像
FROM node:18-alpine AS production

# 安装 OpenSSL 运行时库（Prisma 需要）
RUN apk add --no-cache openssl libc6-compat

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 复制根目录的包管理文件（monorepo 需要）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 server 的 package.json
COPY apps/server/package.json ./apps/server/

# 只安装生产依赖（在根目录执行，支持 monorepo）
RUN pnpm install --prod --frozen-lockfile

# 切换到 server 目录
WORKDIR /app/apps/server

# 从构建阶段复制构建产物
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/node_modules/.prisma ./node_modules/.prisma

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 更改文件所有权
RUN chown -R nestjs:nodejs /app

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main.js"]

# 阶段3: 开发环境镜像
FROM node:18-alpine AS development

# 安装 OpenSSL 和其他必要的依赖（Prisma 需要）
RUN apk add --no-cache openssl openssl-dev libc6-compat

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@9.0.0 nodemon

# 复制根目录的包管理文件（monorepo 需要）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 复制 server 的 package.json
COPY apps/server/package.json ./apps/server/

# 安装所有依赖（包括开发依赖，在根目录执行，支持 monorepo）
RUN pnpm install --frozen-lockfile

# 复制 server 源代码
COPY apps/server ./apps/server

# 切换到 server 目录
WORKDIR /app/apps/server

# 生成 Prisma 客户端
RUN pnpm db:generate

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 更改文件所有权
RUN chown -R nestjs:nodejs /app

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 开发模式启动（使用 nodemon 监听文件变化）
CMD ["pnpm", "dev"]

