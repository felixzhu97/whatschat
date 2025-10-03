# WhatsChat 文档分类说明

本文档说明了 WhatsChat 项目的文档分类体系和组织结构。

## 📁 目录结构

```
docs/
├── architecture/                    # 架构设计文档
│   ├── c4-diagrams/               # C4架构图
│   │   ├── 01-system-context.puml
│   │   ├── 02-container-diagram.puml
│   │   ├── 03-component-diagram.puml
│   │   ├── 03-mobile-component-diagram.puml
│   │   ├── 04-code-diagram.puml
│   │   ├── 05-architecture-overview.puml
│   │   └── 06-deployment-diagram.puml
│   ├── database/                  # 数据库设计
│   │   └── database-design.md
│   └── decisions/                 # 技术决策
│       └── adr.md
├── requirements/                  # 需求文档
│   ├── functional/               # 功能需求
│   │   └── requirements.md
│   ├── non-functional/           # 非功能需求 (预留)
│   └── technical/                # 技术需求 (预留)
├── development/                   # 开发文档
│   ├── api/                      # API文档
│   │   └── api-documentation.md
│   ├── guides/                   # 开发指南
│   │   └── development-guide.md
│   ├── testing/                  # 测试指南
│   │   └── testing-guide.md
│   └── contributing/             # 贡献指南
│       └── contributing-guide.md
├── operations/                    # 运维文档
│   ├── deployment/               # 部署指南
│   │   └── deployment-guide.md
│   ├── security/                 # 安全指南
│   │   └── security-guide.md
│   └── troubleshooting/          # 故障排除
│       └── troubleshooting-guide.md
├── project-records/              # 项目记录
│   ├── changelog/                # 变更日志
│   │   └── CHANGELOG.md
│   └── glossary/                 # 术语表
│       └── glossary.md
└── README.md                     # 文档导航
```

## 🎯 分类原则

### 按功能分类
- **架构设计**: 系统架构、数据库设计、技术决策
- **需求规范**: 功能需求、非功能需求、技术需求
- **开发文档**: API文档、开发指南、测试指南、贡献指南
- **运维部署**: 部署指南、安全指南、故障排除
- **项目记录**: 变更日志、术语表

### 按受众分类
- **架构师**: architecture/ 目录下的所有文档
- **产品经理**: requirements/ 目录下的文档
- **开发者**: development/ 目录下的所有文档
- **运维工程师**: operations/ 目录下的所有文档
- **项目管理者**: project-records/ 目录下的文档

### 按生命周期分类
- **设计阶段**: architecture/, requirements/
- **开发阶段**: development/
- **部署阶段**: operations/deployment/
- **运维阶段**: operations/security/, operations/troubleshooting/
- **维护阶段**: project-records/

## 📋 文档命名规范

### 文件命名
- 使用小写字母和连字符
- 描述性命名，避免缩写
- 保持一致性

### 目录命名
- 使用小写字母和连字符
- 简洁明了，易于理解
- 避免过深的嵌套

### 示例
```
✅ 正确
- api-documentation.md
- development-guide.md
- security-guide.md

❌ 错误
- API_Documentation.md
- dev-guide.md
- security.md
```

## 🔄 文档维护

### 更新原则
1. **及时性**: 代码变更时同步更新文档
2. **准确性**: 确保文档内容与实际代码一致
3. **完整性**: 新功能必须有对应文档
4. **可读性**: 保持文档清晰易懂

### 更新流程
1. **识别变更**: 代码变更触发文档更新需求
2. **评估影响**: 确定需要更新的文档范围
3. **更新文档**: 修改相关文档内容
4. **评审验证**: 团队评审文档更新
5. **发布通知**: 通知相关人员文档变更

### 版本控制
- 所有文档纳入Git版本控制
- 使用有意义的提交信息
- 定期备份重要文档

## 📊 文档统计

### 按类型统计
- **架构设计**: 9个文档 (7个PlantUML + 2个Markdown)
- **需求规范**: 1个文档
- **开发文档**: 4个文档
- **运维文档**: 3个文档
- **项目记录**: 2个文档

### 按格式统计
- **Markdown文档**: 12个
- **PlantUML图表**: 7个
- **总计**: 19个文档文件

### 按内容统计
- **总字数**: 约50,000字
- **代码示例**: 200+ 个
- **技术决策**: 10个ADR
- **API接口**: 50+ 个
- **术语定义**: 200+ 个

## 🚀 使用指南

### 新用户
1. 从 [`project-records/glossary/glossary.md`](./project-records/glossary/glossary.md) 开始了解术语
2. 阅读 [`requirements/functional/requirements.md`](./requirements/functional/requirements.md) 了解项目需求
3. 查看 [`architecture/decisions/adr.md`](./architecture/decisions/adr.md) 了解技术选型

### 开发者
1. 阅读 [`development/guides/development-guide.md`](./development/guides/development-guide.md) 设置开发环境
2. 查看 [`development/api/api-documentation.md`](./development/api/api-documentation.md) 了解API接口
3. 参考 [`development/testing/testing-guide.md`](./development/testing/testing-guide.md) 编写测试

### 运维工程师
1. 阅读 [`operations/deployment/deployment-guide.md`](./operations/deployment/deployment-guide.md) 了解部署流程
2. 查看 [`operations/security/security-guide.md`](./operations/security/security-guide.md) 了解安全策略
3. 参考 [`operations/troubleshooting/troubleshooting-guide.md`](./operations/troubleshooting/troubleshooting-guide.md) 解决故障

### 架构师
1. 查看 [`architecture/c4-diagrams/`](./architecture/c4-diagrams/) 了解系统架构
2. 阅读 [`architecture/database/database-design.md`](./architecture/database/database-design.md) 了解数据库设计
3. 参考 [`architecture/decisions/adr.md`](./architecture/decisions/adr.md) 了解技术决策

## 🔗 相关资源

- [文档导航](./README.md) - 主要文档入口
- [术语表](./project-records/glossary/glossary.md) - 项目术语定义
- [需求清单](./requirements/functional/requirements.md) - 项目需求说明
- [技术决策](./architecture/decisions/adr.md) - 技术选型记录

## 📞 联系方式

如有文档相关问题，请联系：

- **邮箱**: z1434866867@gmail.com
- **项目Issues**: [GitHub Issues](https://github.com/your-username/whatschat/issues)
- **技术讨论**: 加入项目讨论群组

## 📄 许可证

本文档采用 [MIT License](../LICENSE) 开源许可证。

---

_本文档随项目发展持续更新，最后更新时间：2024年1月_
