# CI/CD 工作流文档

## PR Checks 工作流 (.github/workflows/pr-checks.yml)

### 概述

在每次 Pull Request 时自动运行的检查流程，包括：

- 代码规范检查
- 单元测试
- 类型检查
- 构建验证

### 触发条件

- 任何分支的 Pull Request 事件

### 执行流程

1. Lint 检查

   - 使用 Node.js 18 环境
   - 缓存 node_modules 加速安装
   - 执行`npm run lint`

2. 单元测试 (依赖 Lint 通过)

   - 使用 Node.js 18 环境
   - 执行`npm test`

3. 类型检查 (依赖 Lint 通过)

   - 执行`npx tsc --noEmit`

4. 构建验证 (依赖以上所有步骤通过)
   - 执行`npm run build`

### 缓存策略

- 基于 package-lock.json 哈希值缓存 node_modules
- 跨工作流复用缓存

## 其他工作流

(预留位置，未来可添加部署等工作流说明)
