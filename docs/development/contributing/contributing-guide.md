# WhatsChat 贡献指南

## 📋 概述

欢迎为 WhatsChat 项目做出贡献！本指南将帮助您了解如何参与项目开发、提交代码和参与社区讨论。

---

## 🤝 如何贡献

### 贡献方式

- **代码贡献**: 修复bug、添加新功能、优化性能
- **文档贡献**: 完善文档、翻译、示例代码
- **测试贡献**: 编写测试用例、提高测试覆盖率
- **设计贡献**: UI/UX设计、图标、界面优化
- **社区贡献**: 回答问题、分享经验、推广项目

### 贡献流程

1. **Fork项目** - 在GitHub上fork项目到您的账户
2. **创建分支** - 为您的贡献创建功能分支
3. **开发功能** - 编写代码、测试、文档
4. **提交PR** - 创建Pull Request
5. **代码审查** - 参与代码审查和讨论
6. **合并代码** - 维护者合并您的贡献

---

## 🛠️ 开发环境设置

### 1. 克隆项目

```bash
# Fork项目后克隆您的fork
git clone https://github.com/your-username/whatschat.git
cd whatschat

# 添加上游仓库
git remote add upstream https://github.com/whatschat/whatschat.git
```

### 2. 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装所有子项目依赖
pnpm install --recursive
```

### 3. 环境配置

```bash
# 复制环境变量文件
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env.local

# 编辑环境变量
# 配置数据库、Redis等连接信息
```

### 4. 数据库设置

```bash
cd apps/server

# 生成Prisma客户端
pnpm db:generate

# 运行数据库迁移
pnpm migrate

# 填充测试数据
pnpm db:seed
```

### 5. 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 或分别启动
cd apps/server && pnpm dev
cd apps/web && pnpm dev
```

---

## 📝 代码规范

### Git提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

```bash
# 功能提交
git commit -m "feat: add user profile editing functionality"

# 修复提交
git commit -m "fix: resolve WebSocket connection timeout issue"

# 文档提交
git commit -m "docs: update API documentation for auth endpoints"

# 样式提交
git commit -m "style: format code with prettier"

# 重构提交
git commit -m "refactor: extract message validation logic"

# 测试提交
git commit -m "test: add unit tests for user service"

# 构建提交
git commit -m "build: update dependencies to latest versions"
```

### 提交类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `build`: 构建系统
- `ci`: CI配置
- `chore`: 其他杂务

### 分支命名规范

```bash
# 功能分支
feature/user-profile-editing
feature/voice-message-support

# 修复分支
fix/websocket-timeout
fix/memory-leak-in-chat

# 文档分支
docs/api-documentation-update
docs/deployment-guide

# 重构分支
refactor/message-service
refactor/auth-middleware
```

---

## 🧪 测试要求

### 测试覆盖率

- **单元测试**: 覆盖率 >= 80%
- **集成测试**: 覆盖率 >= 70%
- **端到端测试**: 关键用户流程100%覆盖

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定项目测试
cd apps/server && pnpm test
cd apps/web && pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行端到端测试
pnpm test:e2e
```

### 测试示例

```typescript
// 单元测试示例
describe("UserService", () => {
  it("should create user successfully", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "Test123456",
    };

    const user = await userService.createUser(userData);

    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});

// 集成测试示例
describe("Auth API", () => {
  it("should register new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Test123456",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

---

## 📋 Pull Request 规范

### PR标题格式

```
[类型] 简短描述

例如:
[feat] Add voice message recording functionality
[fix] Resolve WebSocket connection timeout issue
[docs] Update API documentation for message endpoints
```

### PR描述模板

```markdown
## 变更描述

简要描述此PR的变更内容

## 变更类型

- [ ] Bug修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 测试

- [ ] 单元测试已通过
- [ ] 集成测试已通过
- [ ] 端到端测试已通过
- [ ] 手动测试已完成

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 已添加必要的测试
- [ ] 已更新相关文档
- [ ] 已更新CHANGELOG
- [ ] 无破坏性变更

## 相关Issue

Closes #123
```

### PR审查要点

1. **代码质量**
   - 代码风格一致
   - 命名规范
   - 注释完整
   - 无重复代码

2. **功能完整性**
   - 功能实现完整
   - 边界情况处理
   - 错误处理完善

3. **测试覆盖**
   - 测试用例充分
   - 测试通过
   - 覆盖率达标

4. **文档更新**
   - API文档更新
   - 用户文档更新
   - 代码注释完善

---

## 🔍 代码审查

### 审查流程

1. **自动检查** - CI/CD流水线自动运行测试和代码检查
2. **同行审查** - 至少一位维护者审查代码
3. **讨论修改** - 根据反馈进行修改
4. **最终审查** - 维护者最终确认
5. **合并代码** - 合并到主分支

### 审查标准

#### 代码质量

- 代码可读性和可维护性
- 性能影响评估
- 安全性考虑
- 错误处理完整性

#### 架构设计

- 符合项目架构
- 模块化设计
- 接口设计合理
- 扩展性考虑

#### 测试质量

- 测试用例充分
- 测试覆盖率高
- 测试可维护性
- 性能测试（如适用）

### 审查反馈

```markdown
## 审查意见

### 优点

- 代码结构清晰
- 测试覆盖充分
- 文档更新及时

### 需要改进

- 建议优化算法复杂度
- 需要添加错误处理
- 建议增加单元测试

### 具体建议

1. 在`UserService.createUser`方法中添加输入验证
2. 考虑使用缓存优化数据库查询
3. 建议添加集成测试用例
```

---

## 🐛 Bug报告

### 报告模板

```markdown
## Bug描述

简要描述bug的现象

## 重现步骤

1. 进入某个页面
2. 执行某个操作
3. 观察结果

## 预期行为

描述期望的正确行为

## 实际行为

描述实际发生的错误行为

## 环境信息

- 操作系统: macOS 12.0
- 浏览器: Chrome 96.0
- Node.js版本: 18.0.0
- 项目版本: v1.2.0

## 截图/日志

如果有相关截图或错误日志，请提供

## 额外信息

任何其他相关信息
```

### 严重程度分类

- **Critical**: 系统崩溃、数据丢失
- **High**: 主要功能不可用
- **Medium**: 功能异常但可绕过
- **Low**: 界面问题、性能问题

---

## 💡 功能请求

### 请求模板

```markdown
## 功能描述

详细描述希望添加的功能

## 使用场景

描述此功能的使用场景和价值

## 实现建议

如果有实现想法，请提供

## 替代方案

是否有其他解决方案

## 额外信息

任何其他相关信息
```

### 功能优先级

- **P0**: 核心功能、安全相关
- **P1**: 重要功能、用户体验
- **P2**: 增强功能、性能优化
- **P3**: 锦上添花、未来考虑

---

## 🏷️ 版本发布

### 版本号规范

使用[语义化版本](https://semver.org/)：

- **主版本号**: 不兼容的API修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 发布流程

1. **功能开发** - 在feature分支开发
2. **测试验证** - 充分测试
3. **代码审查** - PR审查通过
4. **合并主分支** - 合并到main分支
5. **版本标记** - 创建git tag
6. **发布说明** - 更新CHANGELOG
7. **部署发布** - 部署到生产环境

### CHANGELOG格式

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added

- 新增语音消息录制功能
- 支持群组消息撤回
- 添加消息搜索功能

### Changed

- 优化消息加载性能
- 改进用户界面设计

### Fixed

- 修复WebSocket连接超时问题
- 解决文件上传失败问题

### Security

- 修复XSS漏洞
- 加强密码验证
```

---

## 🌍 国际化

### 多语言支持

项目支持多语言，欢迎贡献翻译：

```typescript
// 语言文件结构
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── chat.json
├── zh-CN/
│   ├── common.json
│   ├── auth.json
│   └── chat.json
└── ja/
    ├── common.json
    ├── auth.json
    └── chat.json
```

### 翻译贡献

1. 选择要翻译的语言
2. 翻译对应的JSON文件
3. 确保翻译准确自然
4. 提交PR进行审查

---

## 📚 学习资源

### 技术栈学习

- **Next.js**: [官方文档](https://nextjs.org/docs)
- **React**: [官方文档](https://react.dev/)
- **TypeScript**: [官方文档](https://www.typescriptlang.org/docs/)
- **Prisma**: [官方文档](https://www.prisma.io/docs)
- **Flutter**: [官方文档](https://docs.flutter.dev/)

### 开发工具

- **VS Code**: 推荐编辑器
- **Git**: 版本控制
- **Docker**: 容器化
- **Postman**: API测试
- **Chrome DevTools**: 调试工具

---

## 🤔 常见问题

### Q: 如何开始贡献？

A: 建议从简单的bug修复或文档改进开始，熟悉项目结构和开发流程。

### Q: 如何选择要处理的问题？

A: 查看GitHub Issues，选择标记为"good first issue"或"help wanted"的问题。

### Q: 代码审查需要多长时间？

A: 通常在1-3个工作日内完成，复杂的功能可能需要更长时间。

### Q: 如何获得帮助？

A: 可以通过GitHub Issues、Discord或邮件联系维护者。

---

## 📞 联系方式

- **GitHub**: https://github.com/whatschat/whatschat
- **Discord**: https://discord.gg/whatschat
- **邮箱**: contributors@whatschat.com
- **官网**: https://whatschat.com

---

## 🙏 致谢

感谢所有为WhatsChat项目做出贡献的开发者！您的贡献让项目变得更好。

### 贡献者列表

- [@felix-zhu](https://github.com/felix-zhu) - 项目维护者
- [@contributor1](https://github.com/contributor1) - 核心贡献者
- [@contributor2](https://github.com/contributor2) - 文档贡献者

---

## 📄 许可证

本项目采用MIT许可证。详见[LICENSE](../LICENSE)文件。

---
