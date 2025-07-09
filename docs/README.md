# WhatsChat 架构文档

本文件夹包含了 WhatsChat 项目的 C4 架构图，使用 PlantUML 格式定义，全面展示了系统的架构设计和技术实现。

## 📋 文件说明

### C4 架构图层次

- `01-system-context.puml` - 系统上下文图 (Level 1)
- `02-container-diagram.puml` - 容器图 (Level 2)
- `03-component-diagram.puml` - Web应用组件图 (Level 3)
- `03-mobile-component-diagram.puml` - 移动应用组件图 (Level 3)
- `04-code-diagram.puml` - 代码结构图 (Level 4)
- `05-architecture-overview.puml` - 系统架构概览
- `06-deployment-diagram.puml` - 部署架构图

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
plantuml docs/*.puml

# 生成 SVG 图片
plantuml -tsvg docs/*.puml
```

## 📊 架构图详细说明

### 1. 系统上下文图 (System Context)

**目标受众：** 所有项目相关人员  
**抽象级别：** 最高层次

展示 WhatsChat 系统与外部实体的交互关系：

- **用户角色**：普通用户、联系人、系统管理员
- **外部系统**：WebRTC服务、云存储、推送通知、CDN、邮件服务、数据分析、监控报警
- **系统边界**：明确定义系统职责范围
- **交互协议**：HTTPS、WebSocket、WebRTC、S3 API、FCM/APNs等

### 2. 容器图 (Container Diagram)

**目标受众：** 架构师、技术负责人  
**抽象级别：** 系统内部容器

展示系统内部的主要容器和技术栈：

- **前端容器**：Next.js Web应用、Flutter移动应用
- **后端容器**：Node.js API服务、WebSocket服务
- **数据存储**：PostgreSQL主数据库、Redis缓存、MinIO/S3文件存储、Elasticsearch搜索
- **基础设施**：API网关、负载均衡器
- **外部服务集成**：推送服务、邮件服务、监控服务

### 3. Web应用组件图 (Component Diagram)

**目标受众：** 前端开发者  
**抽象级别：** Web应用内部组件

展示 Web 应用的详细组件结构：

- **页面层**：登录、注册、主页面
- **组件层**：聊天界面、侧边栏、通话界面、消息组件
- **Hook层**：认证、聊天、通话、语音录制等状态管理
- **服务层**：WebSocket、WebRTC、存储、搜索、触觉反馈
- **状态管理**：Zustand状态存储（消息、联系人、通话、设置）

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
  - 组件层 (components/): React组件
  - Hooks层 (hooks/): 自定义Hook
  - 状态管理 (stores/): Zustand状态存储
  - 工具库 (lib/): 核心服务和工具函数
  - 类型定义 (types/): TypeScript类型
  - 数据层 (data/): 模拟数据

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

### v4.0 - 企业级改造 (当前)

- Kubernetes部署
- 微服务架构
- 完整的监控体系
- CI/CD自动化

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
plantuml docs/*.puml

# 生成特定架构图
plantuml docs/01-system-context.puml

# 生成SVG格式
plantuml -tsvg docs/*.puml
```

## 📞 联系方式

如有架构图相关问题，请联系：

- **邮箱**：z1434866867@gmail.com
- **项目Issues**：[GitHub Issues](https://github.com/your-username/whatschat/issues)
- **技术讨论**：加入项目讨论群组

## 📄 许可证

本架构文档采用 [MIT License](../LICENSE) 开源许可证。

---

_本文档随项目架构演进持续更新，最后更新时间：2024年1月_
