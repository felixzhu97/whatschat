# 迭代开发工作流

## 分支策略

- `main`: 生产环境代码
- `develop`: 集成测试分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

## 开发流程

1. 从 develop 分支创建 feature 分支
2. 本地开发并提交小颗粒度 commit
3. 推送 feature 分支并创建 PR
4. PR 通过 CI 检查后合并到 develop 分支
5. 定期从 develop 分支创建 release 分支进行测试
6. 测试通过后合并到 main 分支并打 tag

## 代码审查

- 每个 PR 需要至少 1 个 reviewer 批准
- 代码变更需关联 issue 或需求编号
- 保持 PR 小而专注(建议 300 行以内)

## 自动化工具

- Husky: 提交前自动运行 lint
- Commitizen: 规范化 commit message
- Changesets: 版本管理和变更日志

## Git 操作示例

```bash
# 创建新功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 提交变更
git add .
git commit -m "feat: 添加新功能"

# 推送并创建PR
git push origin feature/new-feature
```

## 版本发布流程

1. 从 develop 创建 release 分支
2. 更新 CHANGELOG.md 和版本号
3. 合并到 main 分支并打 tag
4. 将 tag 推送到远程仓库触发部署
