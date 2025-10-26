# WhatsChat 术语表

本文档定义了 WhatsChat 项目中使用的专业术语和概念，帮助团队成员和用户更好地理解系统。

## 📚 术语分类

### 🏗️ 架构相关

| 术语    | 英文         | 定义                                                                 | 相关文档                                    |
| ------- | ------------ | -------------------------------------------------------------------- | ------------------------------------------- |
| C4模型  | C4 Model     | 一种用于描述软件架构的模型，包含系统上下文、容器、组件和代码四个层次 | [架构图](./README.md)                       |
| 容器    | Container    | 系统中可独立部署的组件，如Web应用、API服务、数据库等                 | [容器图](./02-container-diagram.puml)       |
| 组件    | Component    | 容器内部的逻辑单元，如控制器、服务、数据访问层等                     | [组件图](./03-component-diagram.puml)       |
| 微服务  | Microservice | 将应用程序构建为小型、独立、可独立部署的服务集合                     | [架构概览](./05-architecture-overview.puml) |
| API网关 | API Gateway  | 作为客户端和后端服务之间的单一入口点                                 | [部署图](./06-deployment-diagram.puml)      |

### 🔐 认证与安全

| 术语     | 英文             | 定义                                           | 相关文档                          |
| -------- | ---------------- | ---------------------------------------------- | --------------------------------- |
| JWT      | JSON Web Token   | 一种用于安全传输信息的开放标准                 | [API文档](./api-documentation.md) |
| OAuth    | OAuth            | 开放授权标准，允许用户授权第三方应用访问其资源 | [安全指南](./security-guide.md)   |
| 访问令牌 | Access Token     | 用于访问受保护资源的短期令牌                   | [API文档](./api-documentation.md) |
| 刷新令牌 | Refresh Token    | 用于获取新访问令牌的长期令牌                   | [API文档](./api-documentation.md) |
| 密码哈希 | Password Hashing | 使用单向函数将密码转换为固定长度的字符串       | [安全指南](./security-guide.md)   |
| 盐值     | Salt             | 添加到密码哈希中的随机数据，增加安全性         | [安全指南](./security-guide.md)   |

### 💬 消息与通信

| 术语      | 英文                                | 定义                               | 相关文档                                    |
| --------- | ----------------------------------- | ---------------------------------- | ------------------------------------------- |
| WebSocket | WebSocket                           | 提供全双工通信的计算机通信协议     | [API文档](./api-documentation.md)           |
| WebRTC    | Web Real-Time Communication         | 支持浏览器间实时通信的开放标准     | [API文档](./api-documentation.md)           |
| STUN      | Session Traversal Utilities for NAT | 用于NAT穿透的协议                  | [系统上下文](./01-system-context.puml)      |
| TURN      | Traversal Using Relays around NAT   | 用于NAT穿透的中继协议              | [系统上下文](./01-system-context.puml)      |
| 消息队列  | Message Queue                       | 用于在应用程序之间传递消息的中间件 | [架构概览](./05-architecture-overview.puml) |
| 事件驱动  | Event-Driven                        | 基于事件和事件处理的编程范式       | [开发指南](./development-guide.md)          |

### 🗄️ 数据存储

| 术语     | 英文                      | 定义                                   | 相关文档                           |
| -------- | ------------------------- | -------------------------------------- | ---------------------------------- |
| ORM      | Object-Relational Mapping | 对象关系映射，将数据库表映射为对象     | [开发指南](./development-guide.md) |
| Prisma   | Prisma                    | 现代数据库ORM和查询构建器              | [开发指南](./development-guide.md) |
| 连接池   | Connection Pool           | 数据库连接的缓存池，提高性能           | [部署指南](./deployment-guide.md)  |
| 读写分离 | Read-Write Splitting      | 将读操作和写操作分配到不同的数据库实例 | [部署指南](./deployment-guide.md)  |
| 数据迁移 | Data Migration            | 数据库结构或数据的变更过程             | [开发指南](./development-guide.md) |
| 缓存     | Cache                     | 临时存储数据以提高访问速度的机制       | [部署指南](./deployment-guide.md)  |

### 🧪 测试相关

| 术语       | 英文                    | 定义                             | 相关文档                       |
| ---------- | ----------------------- | -------------------------------- | ------------------------------ |
| 单元测试   | Unit Test               | 测试单个函数或方法的测试         | [测试指南](./testing-guide.md) |
| 集成测试   | Integration Test        | 测试多个组件协同工作的测试       | [测试指南](./testing-guide.md) |
| E2E测试    | End-to-End Test         | 测试完整用户流程的测试           | [测试指南](./testing-guide.md) |
| Mock       | Mock                    | 模拟对象，用于测试中替代真实依赖 | [测试指南](./testing-guide.md) |
| 测试覆盖率 | Test Coverage           | 代码被测试覆盖的百分比           | [测试指南](./testing-guide.md) |
| TDD        | Test-Driven Development | 测试驱动开发，先写测试再写代码   | [测试指南](./testing-guide.md) |

### 🚀 部署与运维

| 术语       | 英文                                         | 定义                               | 相关文档                          |
| ---------- | -------------------------------------------- | ---------------------------------- | --------------------------------- |
| Docker     | Docker                                       | 容器化平台，用于打包和部署应用     | [部署指南](./deployment-guide.md) |
| Kubernetes | Kubernetes                                   | 容器编排平台，用于自动化部署和管理 | [部署指南](./deployment-guide.md) |
| CI/CD      | Continuous Integration/Continuous Deployment | 持续集成/持续部署                  | [部署指南](./deployment-guide.md) |
| 负载均衡   | Load Balancing                               | 将请求分发到多个服务器以平衡负载   | [部署指南](./deployment-guide.md) |
| 水平扩展   | Horizontal Scaling                           | 通过增加服务器数量来扩展系统       | [部署指南](./deployment-guide.md) |
| 垂直扩展   | Vertical Scaling                             | 通过增加服务器资源来扩展系统       | [部署指南](./deployment-guide.md) |
| 蓝绿部署   | Blue-Green Deployment                        | 维护两个相同生产环境进行部署的策略 | [部署指南](./deployment-guide.md) |
| 滚动部署   | Rolling Deployment                           | 逐步替换实例的部署策略             | [部署指南](./deployment-guide.md) |

### 📱 前端技术

| 术语         | 英文                  | 定义                             | 相关文档                           |
| ------------ | --------------------- | -------------------------------- | ---------------------------------- |
| React        | React                 | 用于构建用户界面的JavaScript库   | [开发指南](./development-guide.md) |
| Next.js      | Next.js               | React生产级框架                  | [开发指南](./development-guide.md) |
| TypeScript   | TypeScript            | JavaScript的超集，添加了类型系统 | [开发指南](./development-guide.md) |
| Zustand      | Zustand               | 轻量级状态管理库                 | [开发指南](./development-guide.md) |
| Tailwind CSS | Tailwind CSS          | 实用优先的CSS框架                | [开发指南](./development-guide.md) |
| SSR          | Server-Side Rendering | 服务端渲染                       | [开发指南](./development-guide.md) |
| CSR          | Client-Side Rendering | 客户端渲染                       | [开发指南](./development-guide.md) |
| PWA          | Progressive Web App   | 渐进式Web应用                    | [开发指南](./development-guide.md) |

### 📱 移动端技术

| 术语     | 英文                  | 定义                           | 相关文档                           |
| -------- | --------------------- | ------------------------------ | ---------------------------------- |
| Flutter  | Flutter               | Google开发的跨平台移动应用框架 | [开发指南](./development-guide.md) |
| Dart     | Dart                  | Flutter使用的编程语言          | [开发指南](./development-guide.md) |
| Widget   | Widget                | Flutter中的UI组件              | [开发指南](./development-guide.md) |
| Provider | Provider              | Flutter状态管理解决方案        | [开发指南](./development-guide.md) |
| APK      | Android Package       | Android应用包格式              | [部署指南](./deployment-guide.md)  |
| IPA      | iOS App Store Package | iOS应用包格式                  | [部署指南](./deployment-guide.md)  |

### 🔧 后端技术

| 术语      | 英文       | 定义                       | 相关文档                           |
| --------- | ---------- | -------------------------- | ---------------------------------- |
| Node.js   | Node.js    | JavaScript运行时环境       | [开发指南](./development-guide.md) |
| Express   | Express    | Node.js Web应用框架        | [开发指南](./development-guide.md) |
| Socket.io | Socket.io  | 实时通信库                 | [API文档](./api-documentation.md)  |
| 中间件    | Middleware | 在请求和响应之间执行的函数 | [开发指南](./development-guide.md) |
| REST API  | REST API   | 符合REST架构风格的API      | [API文档](./api-documentation.md)  |
| GraphQL   | GraphQL    | 数据查询和操作语言         | [API文档](./api-documentation.md)  |

### 🛡️ 安全术语

| 术语     | 英文                          | 定义                | 相关文档                        |
| -------- | ----------------------------- | ------------------- | ------------------------------- |
| XSS      | Cross-Site Scripting          | 跨站脚本攻击        | [安全指南](./security-guide.md) |
| CSRF     | Cross-Site Request Forgery    | 跨站请求伪造        | [安全指南](./security-guide.md) |
| SQL注入  | SQL Injection                 | 通过SQL语句进行攻击 | [安全指南](./security-guide.md) |
| HTTPS    | HTTPS                         | 安全的HTTP协议      | [安全指南](./security-guide.md) |
| SSL/TLS  | SSL/TLS                       | 安全传输层协议      | [安全指南](./security-guide.md) |
| CORS     | Cross-Origin Resource Sharing | 跨域资源共享        | [安全指南](./security-guide.md) |
| CSP      | Content Security Policy       | 内容安全策略        | [安全指南](./security-guide.md) |
| 速率限制 | Rate Limiting                 | 限制请求频率的机制  | [安全指南](./security-guide.md) |

### 📊 监控与日志

| 术语     | 英文                               | 定义                         | 相关文档                               |
| -------- | ---------------------------------- | ---------------------------- | -------------------------------------- |
| 监控     | Monitoring                         | 实时观察系统状态和性能       | [部署指南](./deployment-guide.md)      |
| 告警     | Alerting                           | 当系统异常时发送通知         | [部署指南](./deployment-guide.md)      |
| 日志     | Logging                            | 记录系统运行信息             | [故障排除](./troubleshooting-guide.md) |
| 指标     | Metrics                            | 系统性能的量化数据           | [部署指南](./deployment-guide.md)      |
| 链路追踪 | Distributed Tracing                | 跟踪请求在分布式系统中的路径 | [故障排除](./troubleshooting-guide.md) |
| APM      | Application Performance Monitoring | 应用性能监控                 | [部署指南](./deployment-guide.md)      |

### 🔄 开发流程

| 术语         | 英文         | 定义                  | 相关文档                            |
| ------------ | ------------ | --------------------- | ----------------------------------- |
| Git          | Git          | 分布式版本控制系统    | [贡献指南](./contributing-guide.md) |
| GitHub       | GitHub       | 基于Git的代码托管平台 | [贡献指南](./contributing-guide.md) |
| Pull Request | Pull Request | 代码合并请求          | [贡献指南](./contributing-guide.md) |
| Code Review  | Code Review  | 代码审查              | [贡献指南](./contributing-guide.md) |
| Issue        | Issue        | 问题跟踪              | [贡献指南](./contributing-guide.md) |
| Milestone    | Milestone    | 项目里程碑            | [贡献指南](./contributing-guide.md) |
| Branch       | Branch       | Git分支               | [贡献指南](./contributing-guide.md) |
| Merge        | Merge        | 合并代码              | [贡献指南](./contributing-guide.md) |

## 🔍 术语查找

### 按首字母查找

- **A**: API网关, APM, APK, APNs
- **B**: 蓝绿部署, Branch
- **C**: C4模型, CI/CD, CSR, CSP, CORS, CSRF
- **D**: Docker, Dart, 数据迁移, 读写分离
- **E**: Express, E2E测试, 事件驱动
- **F**: Flutter
- **G**: Git, GitHub, GraphQL
- **H**: HTTPS, 水平扩展
- **I**: IPA, Issue, 集成测试, 中间件
- **J**: JWT, JavaScript
- **K**: Kubernetes
- **L**: 负载均衡, 链路追踪, 日志
- **M**: Mock, 微服务, 消息队列, 监控, 指标, Merge, Milestone
- **N**: Node.js, Next.js
- **O**: OAuth, ORM
- **P**: Prisma, Provider, PWA, 密码哈希, 滚动部署
- **Q**:
- **R**: React, REST API, 刷新令牌, 速率限制
- **S**: Socket.io, SSR, SSL/TLS, STUN, SQL注入, 盐值
- **T**: TypeScript, TDD, TURN, 测试覆盖率
- **U**: 单元测试
- **V**: 垂直扩展
- **W**: WebSocket, WebRTC, Widget
- **X**: XSS
- **Y**:
- **Z**: Zustand

### 按技术栈查找

#### 前端技术栈

- React, Next.js, TypeScript, Zustand, Tailwind CSS, SSR, CSR, PWA

#### 移动端技术栈

- Flutter, Dart, Widget, Provider, APK, IPA

#### 后端技术栈

- Node.js, Express, Socket.io, Prisma, REST API, GraphQL

#### 数据库技术

- PostgreSQL, Redis, ORM, 连接池, 读写分离, 数据迁移

#### 部署技术

- Docker, Kubernetes, CI/CD, 负载均衡, 蓝绿部署, 滚动部署

#### 安全技术

- JWT, OAuth, HTTPS, SSL/TLS, XSS, CSRF, SQL注入, CORS, CSP

## 📝 术语更新

### 更新原则

1. **准确性**：术语定义必须准确反映其实际含义
2. **一致性**：在整个项目中使用统一的术语
3. **完整性**：覆盖项目中使用的所有重要术语
4. **时效性**：及时更新新增或变更的术语

### 更新流程

1. 识别需要添加或更新的术语
2. 查阅相关技术文档确认定义
3. 更新术语表
4. 通知团队成员
5. 更新相关文档中的术语引用

### 贡献指南

如果您发现术语表中的错误或需要添加新术语，请：

1. 创建Issue描述问题
2. 提交Pull Request进行修改
3. 在相关文档中更新术语引用

## 🔗 相关资源

- [技术文档](./README.md) - 项目技术文档
- [开发指南](./development-guide.md) - 开发相关术语
- [API文档](./api-documentation.md) - API相关术语
- [安全指南](./security-guide.md) - 安全相关术语
- [部署指南](./deployment-guide.md) - 部署相关术语

---
