# WhatsChat 项目文档

本文件夹包含 WhatsChat 的完整技术文档，按 **产品**、**数据**、**研发** 分类。English: [en](../en/README.md).

## 📁 目录结构

```
docs/
├── README.md                 # 本索引（中/英）
├── c4-lib/                   # C4-PlantUML（en/rd/c4 引用）
│   └── C4-PlantUML/
├── zh/                       # 中文（本目录）
│   ├── README.md
│   ├── product/              # 产品：用户旅程、沃德利地图
│   │   ├── user-journey-map/
│   │   └── wardley-map/
│   ├── data/                 # 数据：数据流、复制
│   │   ├── data-flow.puml
│   │   └── data-replication.puml
│   └── rd/                   # 研发：API、分布式系统
│       ├── api/
│       └── distributed-systems/
└── en/
    ├── README.md
    ├── product/              # 产品（链至 zh/product）
    ├── data/                 # 数据：同上 + TOGAF 数据架构
    └── rd/                   # 研发：C4、TOGAF、API 等
        ├── c4/
        └── togaf/
```

## 📚 文档分类

### 产品 · Product

- [用户旅程与地图](product/README.md)（本目录索引）
- [沃德利地图](product/wardley-map/wardley-map.puml) — 价值链与演化
- [用户旅程地图](product/user-journey-map/user-journey-map.puml) — 注册到使用
- [用户画像](product/user-journey-map/user-persona-map.puml) · [用户故事地图](product/user-journey-map/user-story-map.puml)

### 数据 · Data

- [数据架构与数据流](data/README.md)（本目录索引）
- [数据流图](data/data-flow.puml) — 消息、认证、文件上传
- [数据复制](data/data-replication.puml) — PostgreSQL 主从
- [TOGAF 数据架构](../en/rd/togaf/data-architecture.puml)（en）

### 研发 · R&D

- [C4 模型](rd/c4/README.md) — 系统上下文、容器、组件（API：GraphQL、通知 MongoDB + WS、coverUrl；Web：探索 963px、通知/搜索抽屉；中文图见 [rd/c4](rd/c4/)）
  - [Level 1 系统上下文](rd/c4/system-context.puml) · [Level 2 容器](rd/c4/containers.puml)
  - [Level 3 API 服务组件](rd/c4/components-api-server.puml) · [Level 3 Web 组件](rd/c4/components-web-app.puml) · [Level 3 移动端组件](rd/c4/components-mobile-app.puml) · [Level 3 管理端组件](rd/c4/components-admin-app.puml)
- [TOGAF](rd/togaf/README.md) — 四大架构域：概览、业务、应用、数据、技术（中文图见本目录 [rd/togaf](rd/togaf/)）
- [API 文档](rd/api/README.md) · [Postman 集合](rd/api/whatschat-api.postman_collection.json)
- [分布式系统](rd/distributed-systems/README.md) — 架构、服务发现、事务、负载均衡、消息队列、时序

## 🔧 如何查看架构图

### 方法一：在线查看

1. 访问 [PlantUML 在线编辑器](https://www.plantuml.com/plantuml/uml/)
2. 将 `.puml` 文件内容复制到编辑器中
3. 点击 "Submit" 生成图片

### 方法二：使用 VS Code 插件

1. 安装 [PlantUML 插件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)
2. 在 VS Code 中打开 `.puml` 文件
3. 按 `Alt+D` 预览图片

### 方法三：本地安装 PlantUML

```bash
# 安装 Java (如果未安装)
brew install java

# 安装 PlantUML
brew install plantuml

# 生成 PNG 图片
plantuml docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml

# 生成 SVG 图片
plantuml -tsvg docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml
```

## 📊 架构图详细说明

### 1. 系统上下文图 (System Context)

**目标受众：** 所有项目相关人员  
**抽象级别：** 最高层次

展示 WhatsChat 系统与外部实体的交互关系：

- **用户角色**：普通用户、联系人、系统管理员
- **外部系统**：WebRTC服务、云存储、推送通知、CDN、邮件服务、数据分析、监控报警
- **系统边界**：明确定义系统职责范围
- **交互协议**：HTTPS、WebSocket、WebRTC、FCM/APNs等

### 2. 容器图 (Container Diagram)

**目标受众：** 架构师、技术负责人  
**抽象级别：** 系统内部容器

展示系统内部的主要容器和技术栈：

- **前端容器**：Next.js Web应用、Flutter移动应用
- **后端容器**：Node.js API服务、WebSocket服务
- **数据存储**：PostgreSQL主数据库、Redis缓存、本地文件存储、Elasticsearch搜索
- **基础设施**：API网关、负载均衡器
- **外部服务集成**：推送服务、邮件服务、监控服务

### 3. Web应用组件图 (Component Diagram)

**目标受众：** 前端开发者  
**抽象级别：** Web应用内部组件

展示 Web 应用的详细组件结构：

- **页面层**：登录、注册、主页面
- **组件层**：聊天界面、侧边栏、通话界面、消息组件
- **Hook层**：认证、聊天、通话、语音录制、搜索、对话框、导航等状态管理
- **服务层**：WebSocket、WebRTC、存储、搜索、触觉反馈
- **状态管理**：Redux Toolkit + React Redux（消息、联系人、通话、设置）
- **工具层**：消息处理工具、模拟数据管理

### 4. 移动应用组件图 (Mobile Component Diagram)

**目标受众：** 移动端开发者  
**抽象级别：** Flutter应用内部组件

展示 Flutter 移动应用的组件结构：

- **屏幕层**：主屏幕、聊天列表、聊天详情、通话记录等
- **组件层**：消息气泡、聊天输入框、语音播放器、通话界面
- **服务层**：WebSocket、WebRTC、存储、音频、文件、通知服务
- **数据模型**：用户、聊天、消息、通话、状态模型
- **状态管理**：Provider状态管理

### 5. 代码结构图 (Code Diagram)

**目标受众：** 开发者  
**抽象级别：** 具体代码文件

展示核心模块的具体代码结构：

- **Web应用代码结构**：
  - 页面层 (app/): Next.js页面和布局
  - 组件层 (components/): React组件（已重构优化）
  - Hooks层 (hooks/): 自定义Hook（useMessages、useSearch、useDialogs、useNavigation）
  - 状态管理 (state/): Redux Toolkit切片（calls、contacts、messages 等）
  - 工具库 (lib/): 核心服务和工具函数（message-utils）
  - 类型定义 (types/): TypeScript类型
  - 数据层 (data/): 模拟数据集中管理

- **移动应用代码结构**：
  - 屏幕层 (screens/): Flutter屏幕Widget
  - 组件层 (widgets/): 可复用Widget
  - 模型层 (models/): Dart数据模型
  - 服务层 (services/): Dart服务实现
  - 主题层 (themes/): Flutter主题定义

### 6. 系统架构概览 (Architecture Overview)

**目标受众：** 架构师、技术管理者  
**抽象级别：** 整体技术架构

展示完整的技术栈和分层架构：

- **用户界面层**：Web前端技术栈、移动前端技术栈
- **通信协议层**：WebSocket、WebRTC、HTTP/HTTPS、SSE
- **业务逻辑层**：前端业务逻辑、后端业务逻辑
- **数据访问层**：前端数据层、后端数据层
- **基础设施层**：存储服务、运行时环境、部署环境
- **外部服务层**：第三方服务集成
- **开发工具链**：构建工具、代码质量、测试框架

### 7. 部署架构图 (Deployment Diagram)

**目标受众：** 运维工程师、DevOps  
**抽象级别：** 生产环境部署

展示生产环境的部署结构：

- **用户接入层**：多设备支持、跨平台兼容
- **内容分发层**：CDN全球加速、静态资源缓存
- **接入层**：负载均衡、SSL终端、API网关
- **应用服务层**：Kubernetes集群、容器化部署、自动扩缩容
- **数据持久层**：主从架构、定期备份
- **文件存储层**：对象存储、异地容灾
- **监控运维层**：实时监控、告警通知
- **外部服务层**：第三方集成、功能扩展
- **开发运维层**：持续集成、自动化部署

### 8. 沃德利地图 (Wardley Map)

**目标受众：** 架构师、技术管理者、产品经理  
**抽象级别：** 战略规划视角

展示系统组件在价值链和演化轴上的战略位置：

- **价值链 (Y轴)**：从用户需求到基础设施的垂直分层
  - 用户需求层：即时通讯、音视频通话、文件共享
  - 用户界面层：Web应用、移动应用
  - 业务能力层：消息处理、用户认证、通话管理、文件管理、搜索服务
  - 数据层：用户数据、消息数据、文件数据、索引数据
  - 基础设施层：数据库、缓存、存储、网络、计算资源

- **演化阶段 (X轴)**：从创新到商品的水平演进
  - **Genesis (创新)**：WebRTC音视频、实时推送、消息搜索 - 高度定制化，差异化竞争优势
  - **Custom-built (定制)**：消息处理逻辑、用户认证系统、文件管理 - 内部构建，特定业务需求
  - **Product (产品)**：Next.js、Flutter、NestJS、Prisma、Socket.io - 标准化产品，可配置
  - **Commodity (商品)**：PostgreSQL、Redis、本地存储、CDN、HTTP/HTTPS、Docker - 通用服务，按需使用

**使用场景：**

- 技术选型决策：识别哪些组件应该自建，哪些应该使用现成产品
- 架构演进规划：理解组件从创新到商品的演进路径
- 成本优化分析：识别可以商品化的组件以降低成本
- 竞争优势识别：明确哪些是差异化能力，哪些是通用能力

## 🎯 使用场景

### 开发人员

- **新人入职**：快速了解系统整体架构和技术栈
- **功能开发**：明确模块职责和依赖关系
- **问题排查**：理解数据流和调用链路
- **代码重构**：识别耦合点和改进方向

### 架构师

- **架构设计**：系统设计决策的可视化记录
- **技术选型**：评估技术方案的合理性
- **架构演进**：规划系统升级和扩展路径
- **架构评审**：技术方案的评估和讨论

### 项目管理

- **项目规划**：理解系统复杂度和开发工作量
- **团队协作**：明确不同角色的职责边界
- **进度跟踪**：基于架构模块划分开发任务
- **风险评估**：识别技术风险和依赖关系

### 产品经理

- **需求分析**：理解功能实现的技术约束
- **方案评估**：评估新功能对系统架构的影响
- **沟通协调**：与技术团队的有效沟通工具

## 📈 架构演进历史

### v1.0 - 基础架构

- 单体Web应用
- 简单的消息传递
- 基本的用户认证

### v2.0 - 微服务化

- 服务拆分和容器化
- 引入Redis缓存
- 添加文件存储服务

### v3.0 - 移动端支持

- Flutter移动应用
- 推送通知集成
- 音视频通话功能

### v4.0 - 企业级改造

- Kubernetes部署
- 微服务架构
- 完整的监控体系
- CI/CD自动化

### v4.1 - 代码重构优化 (2025年10月)

- **Web应用组件重构**：将 764 行的单体组件拆分为多个自定义 Hooks
- **模块化设计**：创建了 `useMessages`、`useSearch`、`useDialogs`、`useNavigation` 等专用 Hooks
- **代码质量提升**：零 Linting 错误，完善的 TypeScript 类型定义
- **可维护性增强**：关注点分离，单一职责原则
- **性能优化**：使用 useCallback 避免不必要的重新渲染
- **可复用性**：自定义 Hooks 可在其他组件中复用

#### 重构详情

**新增文件结构：**

```text
apps/web/
├── hooks/
│   ├── use-messages.ts      # 消息管理逻辑
│   ├── use-search.ts        # 搜索功能逻辑
│   ├── use-dialogs.ts       # 对话框状态管理
│   └── use-navigation.ts    # 页面导航逻辑
├── data/
│   └── mock-data.ts         # 模拟数据集中管理
└── lib/
    └── message-utils.ts     # 消息处理工具函数
```

**重构成果：**

- 主组件代码行数从 764 行减少到约 400 行
- 创建了 4 个自定义 Hooks 和 2 个工具文件
- 提高了代码的可测试性和可维护性
- 为未来的功能扩展奠定了良好的架构基础

### v4.2 - NestJS 整洁架构迁移

- **后端框架升级**：从 Express 迁移到 NestJS 10
- **架构重构**：采用整洁架构（Clean Architecture）设计
- **类型安全**：完善的 TypeScript 类型定义
- **API 文档**：集成 Swagger/OpenAPI 文档
- **测试覆盖**：使用 Vitest 进行单元测试和集成测试

### v4.3 - 领域抽象与共享包 (当前)

- **共享领域包**：新增 `packages/domain`（@whatschat/domain），统一 User、Message、Chat、Contact、Group、Call 等类型定义
- **三端统一**：Server、Web、Mobile 均使用 @whatschat/domain 的类型；各应用可扩展或实现接口
- **共享包结构**：`packages/domain`（领域类型）
- **类型检查**：根目录 `pnpm tsc` / `pnpm check-types` 对所有 workspace 执行 TypeScript 检查

### v5.0 - 未来规划

- 服务网格架构
- 人工智能集成
- 多云部署策略
- 边缘计算支持

## 📝 文档维护

### 更新原则

1. **架构变更时必须更新**：任何影响系统架构的修改都需要更新对应的图表
2. **技术栈变更时必须更新**：升级或替换技术组件时需要更新相关说明
3. **定期Review**：每个版本发布前Review架构图的准确性

### 更新流程

1. 修改对应的 `.puml` 文件
2. 重新生成图片并验证
3. 更新相关文档说明
4. 提交代码审查
5. 通知相关团队成员

### 质量标准

- **一致性**：所有图表使用统一的命名和风格
- **准确性**：图表内容与实际代码保持一致
- **完整性**：覆盖系统的主要组件和交互
- **可读性**：图表清晰易懂，适合目标受众

## 🔗 相关链接

- [C4 模型官方文档](https://c4model.com/)
- [PlantUML 官方网站](https://plantuml.com/)
- [PlantUML C4 语法](https://github.com/plantuml-stdlib/C4-PlantUML)
- [架构图最佳实践](https://c4model.com/review/)
- [系统架构设计原则](https://docs.microsoft.com/en-us/azure/architecture/guide/)

## 🔗 快速导航

### 新手指南

- [`project-records/glossary/glossary.md`](./project-records/glossary/glossary.md) - 了解项目术语
- [`requirements/functional/requirements.md`](./requirements/functional/requirements.md) - 了解项目需求
- [`architecture/decisions/adr.md`](./architecture/decisions/adr.md) - 了解技术选型

### 开发指南

- [`development/guides/development-guide.md`](./development/guides/development-guide.md) - 开发环境设置和代码规范
- [`development/api/api-documentation.md`](./development/api/api-documentation.md) - 详细的API接口说明
- [`development/testing/testing-guide.md`](./development/testing/testing-guide.md) - 单元测试、集成测试、E2E测试
- [`development/contributing/contributing-guide.md`](./development/contributing/contributing-guide.md) - 代码贡献流程和规范

### 服务器文档

- [`server/README.md`](./server/README.md) - 服务器快速开始和API文档
- [`server/DOCKER.md`](./server/DOCKER.md) - Docker部署指南
- [`server/MIGRATION.md`](./server/MIGRATION.md) - Express到NestJS迁移说明
- [`server/testing.md`](./server/testing.md) - 服务器测试指南

#### 代码重构最佳实践

**自定义 Hooks 设计原则：**

- **单一职责**：每个 Hook 专注于一个特定的功能领域
- **可复用性**：Hook 可以在多个组件中复用
- **类型安全**：完善的 TypeScript 类型定义
- **性能优化**：合理使用 useCallback 和 useMemo

**组件重构模式：**

- **状态分离**：将相关状态分组到不同的 Hooks 中
- **逻辑提取**：将复杂逻辑提取到工具函数中
- **数据集中**：模拟数据集中管理，便于测试和维护
- **关注点分离**：UI 渲染与业务逻辑分离

**重构示例：**

```typescript
// 重构前：单体组件，所有逻辑混在一起
export function WhatsAppMain() {
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // ... 大量状态和逻辑
}

// 重构后：使用自定义 Hooks，职责清晰
export function WhatsAppMain() {
  const { messageText, handleMessageChange } = useMessages();
  const { searchQuery, handleSearchChange } = useSearch();
  // ... 清晰的职责分工
}
```

### 架构设计

- [`architecture/architecture-overview.puml`](./architecture/architecture-overview.puml) - 整体技术架构
- [沃德利地图](./product/wardley-map/wardley-map.puml) - 战略规划视角
- [`architecture/database/database-design.md`](./architecture/database/database-design.md) - 数据库设计和ER图
- [`architecture/c4-deployment.puml`](./architecture/c4-deployment.puml) - 生产环境部署
- [`architecture/sequence-diagrams/README.md`](./architecture/sequence-diagrams/README.md) - 业务流程时序图

### 运维部署

- [`operations/deployment/deployment-guide.md`](./operations/deployment/deployment-guide.md) - Docker和Kubernetes部署
- [`operations/security/security-guide.md`](./operations/security/security-guide.md) - 安全最佳实践和防护措施
- [`operations/troubleshooting/troubleshooting-guide.md`](./operations/troubleshooting/troubleshooting-guide.md) - 常见问题解决方案

### 项目记录

- [`project-records/changelog/CHANGELOG.md`](./project-records/changelog/CHANGELOG.md) - 版本更新记录

## 🚀 快速开始

### 查看架构图

1. 克隆项目代码
2. 安装PlantUML插件
3. 打开对应的`.puml`文件
4. 预览生成的架构图

### 修改架构图

1. 编辑`.puml`文件
2. 实时预览修改效果
3. 生成最终的图片文件
4. 提交代码变更

### 生成文档

```bash
# 生成所有架构图
plantuml docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml

# 生成特定架构图
plantuml docs/en/rd/c4/system-context.puml

# 生成SVG格式
plantuml -tsvg docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml
```

## 📞 联系方式

如有架构图相关问题，请联系：

- **邮箱**：z1434866867@gmail.com
- **项目Issues**：[GitHub Issues](https://github.com/your-username/whatschat/issues)
- **技术讨论**：加入项目讨论群组

## 📄 许可证

本架构文档采用 [MIT License](../../LICENSE) 开源许可证。

---

## 文档更新记录

本文档随项目架构演进持续更新，最后更新时间：2026年2月（共享领域包 @whatschat/domain 版本）

### 主要更新内容

- ✅ 更新技术栈信息（NestJS 10）
- ✅ 添加整洁架构说明
- ✅ 添加共享领域包与 monorepo 包结构（@whatschat/domain）
- ✅ 更新项目结构描述
- ✅ 更新环境变量配置说明
- ✅ 更新 API 文档链接（Swagger）
- ✅ 更新部署说明（Docker Compose）
