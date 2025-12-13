# WhatsChat 用户地图文档

本文件夹包含 WhatsChat 即时通讯平台的三种用户地图文档，帮助理解用户需求、使用流程和功能规划。

## 📊 用户地图简介

### 1. 用户旅程地图 (User Journey Map)

用户旅程地图展示用户从首次接触到日常使用的完整旅程，包括：

- **发现阶段**：了解产品、访问网站
- **注册阶段**：注册账号、验证邮箱、完善资料
- **首次使用**：登录、查看界面、添加联系人
- **日常使用**：发送消息、接收消息、查看状态
- **高级功能**：音视频通话、群组聊天、文件共享
- **维护管理**：设置、隐私控制、数据管理

每个阶段包含用户行为、情感曲线、痛点和改进机会。

**文件**: [`user-journey-map.puml`](./user-journey-map.puml)

### 2. 用户角色地图 (User Persona Map)

用户角色地图定义不同类型的用户角色及其特征：

- **普通用户（Regular User）**：日常聊天用户，注重简单易用
- **活跃用户（Active User）**：频繁使用多种功能，需要高效管理
- **群组管理员（Group Admin）**：管理群组，需要权限控制工具
- **企业用户（Enterprise User）**：团队协作场景，关注安全和合规

每个角色包含基本信息、使用场景、核心需求、痛点和功能偏好。

**文件**: [`user-persona-map.puml`](./user-persona-map.puml)

### 3. 用户故事地图 (User Story Map)

用户故事地图按用户活动组织功能，展示功能与用户故事的关系：

- **认证与账号管理**：注册、登录、资料管理
- **联系人管理**：添加、搜索、分组
- **消息通信**：发送、接收、搜索、管理
- **音视频通话**：发起、接听、管理
- **群组功能**：创建、管理、参与
- **状态功能**：发布、查看、管理
- **设置与隐私**：个人设置、隐私控制

每个活动包含史诗（Epic）、用户故事（User Story）和验收标准（Acceptance Criteria）。

**文件**: [`user-story-map.puml`](./user-story-map.puml)

## 🎯 使用场景

### 产品设计

- **用户旅程地图**：识别用户体验的关键触点和改进机会
- **用户角色地图**：理解不同用户群体的需求和偏好
- **用户故事地图**：规划功能优先级和开发计划

### 开发规划

- **用户故事地图**：指导功能开发和验收标准制定
- **用户角色地图**：确保功能满足不同用户群体的需求
- **用户旅程地图**：优化关键流程和用户体验

### 产品优化

- **用户旅程地图**：发现用户痛点和改进机会
- **用户角色地图**：针对不同用户群体优化功能
- **用户故事地图**：评估功能完成度和质量

## 🔧 如何查看地图

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
plantuml docs/user-journey-map/*.puml

# 生成 SVG 图片
plantuml -tsvg docs/user-journey-map/*.puml
```

## 📝 地图更新指南

### 何时更新

1. **新增功能时**：更新用户故事地图，添加新的用户故事
2. **用户反馈时**：更新用户旅程地图，记录痛点和改进机会
3. **用户调研后**：更新用户角色地图，调整角色特征和需求
4. **产品迭代时**：同步更新所有相关地图

### 更新流程

1. 修改对应的 `.puml` 文件
2. 重新生成图片并验证
3. 更新相关文档说明
4. 提交代码审查
5. 通知相关团队成员

### 质量标准

- **准确性**：地图内容与实际产品功能保持一致
- **完整性**：覆盖主要用户旅程和功能
- **可读性**：图表清晰易懂，适合不同受众
- **时效性**：及时反映产品最新状态

## 🔗 相关文档

- [架构设计文档](../architecture/) - 查看系统架构图
- [沃德利地图](../wardley-map/) - 查看战略规划地图
- [API 文档](../api/) - 查看 API 相关文档
- [项目文档首页](../README.md) - 返回文档首页

## 📚 参考资源

- [User Journey Mapping Guide](https://www.nngroup.com/articles/journey-mapping-101/)
- [User Persona Best Practices](https://www.nngroup.com/articles/persona/)
- [User Story Mapping](https://www.jpattonassociates.com/user-story-mapping/)
- [PlantUML 官方网站](https://plantuml.com/)

## 📋 地图内容概览

### 用户旅程地图

- 6 个主要阶段
- 关键触点识别
- 情感曲线分析
- 痛点与机会点

### 用户角色地图

- 4 种用户角色
- 需求优先级矩阵
- 使用场景映射
- 功能偏好分析

### 用户故事地图

- 7 个用户活动
- 多个史诗和用户故事
- 验收标准定义
- 优先级划分

---

最后更新时间：2025年12月

