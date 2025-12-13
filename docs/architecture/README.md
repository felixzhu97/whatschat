# 架构设计文档

本文件夹包含 WhatsChat 项目的所有架构设计文档和图表，采用 C4 模型进行系统架构建模。

## 📁 目录结构

```
architecture/
├── README.md                    # 本文件
├── lib/                         # C4 PlantUML 库文件
│   ├── C4.puml                 # C4 模型核心库
│   ├── C4_Context.puml         # 上下文图库
│   ├── C4_Container.puml       # 容器图库
│   ├── C4_Component.puml      # 组件图库
│   └── C4_Deployment.puml      # 部署图库
├── c4-system-context.puml      # 系统上下文图 (Level 1)
├── c4-container.puml           # 容器图 (Level 2)
├── c4-web-components.puml      # Web应用组件图 (Level 3)
├── c4-mobile-components.puml   # 移动应用组件图 (Level 3)
├── c4-code.puml                # 代码结构图 (Level 4)
├── c4-deployment.puml          # 部署架构图
├── c4-dynamic.puml             # 动态图
└── architecture-overview.puml   # 系统架构概览
```

## 📊 C4 架构图

### Level 1: 系统上下文图

- **文件**: [`c4-system-context.puml`](./c4-system-context.puml)
- **目标受众**: 所有项目相关人员
- **抽象级别**: 最高层次
- **内容**: 展示 WhatsChat 系统与外部实体的交互关系
  - 用户角色：普通用户、联系人、系统管理员
  - 外部系统：WebRTC服务、云存储、推送通知、CDN、邮件服务等
  - 系统边界和交互协议

### Level 2: 容器图

- **文件**: [`c4-container.puml`](./c4-container.puml)
- **目标受众**: 架构师、技术负责人
- **抽象级别**: 系统内部容器
- **内容**: 展示系统内部的主要容器和技术栈
  - 前端容器：Next.js Web应用、Flutter移动应用
  - 后端容器：Node.js API服务、WebSocket服务
  - 数据存储：PostgreSQL、Redis、MinIO/S3、Elasticsearch
  - 基础设施和外部服务集成

### Level 3: 组件图

#### Web 应用组件图

- **文件**: [`c4-web-components.puml`](./c4-web-components.puml)
- **目标受众**: 前端开发者
- **抽象级别**: Web应用内部组件
- **内容**: 展示 Web 应用的详细组件结构
  - 页面层、组件层、Hook层、服务层、状态管理、工具层

#### 移动应用组件图

- **文件**: [`c4-mobile-components.puml`](./c4-mobile-components.puml)
- **目标受众**: 移动端开发者
- **抽象级别**: Flutter应用内部组件
- **内容**: 展示 Flutter 移动应用的组件结构
  - 屏幕层、组件层、服务层、数据模型、状态管理

### Level 4: 代码结构图

- **文件**: [`c4-code.puml`](./c4-code.puml)
- **目标受众**: 开发者
- **抽象级别**: 具体代码文件
- **内容**: 展示核心模块的具体代码结构
  - Web应用代码结构（页面、组件、Hooks、状态管理、工具库等）
  - 移动应用代码结构（屏幕、组件、模型、服务、主题等）

## 🏗️ 其他架构图

### 系统架构概览

- **文件**: [`architecture-overview.puml`](./architecture-overview.puml)
- **目标受众**: 架构师、技术管理者
- **内容**: 展示完整的技术栈和分层架构
  - 用户界面层、通信协议层、业务逻辑层
  - 数据访问层、基础设施层、外部服务层、开发工具链

### 部署架构图

- **文件**: [`c4-deployment.puml`](./c4-deployment.puml)
- **目标受众**: 运维工程师、DevOps
- **内容**: 展示生产环境的部署结构
  - 用户接入层、内容分发层、接入层
  - 应用服务层、数据持久层、文件存储层
  - 监控运维层、外部服务层、开发运维层

### 动态图

- **文件**: [`c4-dynamic.puml`](./c4-dynamic.puml)
- **内容**: 展示系统组件之间的动态交互流程

## 📚 子目录说明

### lib/ - C4 PlantUML 库

包含 C4 模型的 PlantUML 库文件，所有架构图都依赖这些库文件：

- `C4.puml` - C4 模型核心库
- `C4_Context.puml` - 上下文图库
- `C4_Container.puml` - 容器图库
- `C4_Component.puml` - 组件图库
- `C4_Deployment.puml` - 部署图库

**注意**: 这些库文件由 C4-PlantUML 项目提供，用于支持 C4 模型的 PlantUML 语法。

### sequence-diagrams/ - 时序图（如果存在）

包含系统关键流程的时序图：
- 用户认证流程
- 消息通信流程
- 音视频通话流程
- 群组管理流程
- 文件管理流程
- 系统部署流程

### database/ - 数据库设计（如果存在）

包含数据库设计文档：
- 数据库设计文档（ER图、数据模型）

### decisions/ - 技术决策（如果存在）

包含架构决策记录（ADR）：
- 技术决策记录文档

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

# 生成所有架构图的 PNG 图片
plantuml docs/architecture/*.puml

# 生成 SVG 图片
plantuml -tsvg docs/architecture/*.puml

# 生成特定架构图
plantuml docs/architecture/c4-system-context.puml
```

## 📖 C4 模型简介

C4 模型是一种用于软件架构可视化的分层方法，包含四个层次：

1. **Context (上下文)**: 系统与外部实体的关系
2. **Container (容器)**: 系统内部的主要技术容器
3. **Component (组件)**: 容器内部的组件结构
4. **Code (代码)**: 组件的代码结构

每个层次都针对不同的受众，从非技术人员到开发人员。

## 🎯 使用场景

### 开发人员
- **新人入职**: 快速了解系统整体架构
- **功能开发**: 明确模块职责和依赖关系
- **问题排查**: 理解数据流和调用链路
- **代码重构**: 识别耦合点和改进方向

### 架构师
- **架构设计**: 系统设计决策的可视化记录
- **技术选型**: 评估技术方案的合理性
- **架构演进**: 规划系统升级和扩展路径
- **架构评审**: 技术方案的评估和讨论

### 项目管理
- **项目规划**: 理解系统复杂度和开发工作量
- **团队协作**: 明确不同角色的职责边界
- **进度跟踪**: 基于架构模块划分开发任务
- **风险评估**: 识别技术风险和依赖关系

## 📝 文档维护

### 更新原则

1. **架构变更时必须更新**: 任何影响系统架构的修改都需要更新对应的图表
2. **技术栈变更时必须更新**: 升级或替换技术组件时需要更新相关说明
3. **定期Review**: 每个版本发布前Review架构图的准确性

### 更新流程

1. 修改对应的 `.puml` 文件
2. 重新生成图片并验证
3. 更新相关文档说明
4. 提交代码审查
5. 通知相关团队成员

### 质量标准

- **一致性**: 所有图表使用统一的命名和风格
- **准确性**: 图表内容与实际代码保持一致
- **完整性**: 覆盖系统的主要组件和交互
- **可读性**: 图表清晰易懂，适合目标受众

## 🔗 相关文档

- [沃德利地图](../wardley-map/README.md) - 战略规划视角的架构图
- [项目文档首页](../README.md) - 返回文档首页
- [API 文档](../api/README.md) - API 相关文档

## 🔗 参考资源

- [C4 模型官方文档](https://c4model.com/)
- [PlantUML 官方网站](https://plantuml.com/)
- [PlantUML C4 语法](https://github.com/plantuml-stdlib/C4-PlantUML)
- [架构图最佳实践](https://c4model.com/review/)
- [系统架构设计原则](https://docs.microsoft.com/en-us/azure/architecture/guide/)

---

最后更新时间：2025年12月
