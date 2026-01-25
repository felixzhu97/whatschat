# TOGAF 企业架构 - WhatsChat

本目录包含 WhatsChat 即时通讯系统的 TOGAF（The Open Group Architecture Framework）四大架构域图表，用于描述业务、应用、数据与技术架构。

## 架构概览

- [overview.puml](./overview.puml) - **TOGAF 架构概览**：四域关系与依赖（业务 → 应用 → 数据 → 技术），便于新人从单一图进入。

## 四大架构域

| 图表 | 说明 |
| --- | --- |
| [business-architecture.puml](./business-architecture.puml) | **业务架构**：业务角色、能力（用户管理、即时通讯、语音视频通话、文件共享、群组、联系人、通知）、业务流程与业务价值 |
| [application-architecture.puml](./application-architecture.puml) | **应用架构**：Web/Mobile 客户端、API 网关（REST、WebSocket、WebRTC）、NestJS 应用服务、数据访问与基础设施 |
| [data-architecture.puml](./data-architecture.puml) | **数据架构**：核心实体（User、Chat、Message、Group、Call、Status、Contact、Notification、FileUpload）、关联实体、PostgreSQL/Redis/S3 存储与数据流 |
| [technology-architecture.puml](./technology-architecture.puml) | **技术架构**：前后端技术栈（Next.js、React Native、NestJS、Prisma、JWT、Socket.IO、WebRTC）、数据持久化、部署（Docker 等） |

## 与 WhatsChat 的对应关系

- **业务**：即时通讯、音视频通话、文件共享、群组、联系人、通知等核心能力
- **应用**：`apps/web`、`apps/mobile`、`apps/server` 及 NestJS 模块（Auth、Users、Messages、Chats、Calls、Groups、Status、WebSocket）
- **数据**：Prisma Schema（`apps/server/prisma/`）与 PostgreSQL/Redis/S3
- **技术**：Monorepo（Turborepo、pnpm）、各 app 的 `package.json`、`tsconfig.json`

## 规范与检查清单

TOGAF 规范、ADM 流程、架构原则、治理规则及检查清单见：

- [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

## 查看方式

1. **PlantUML 在线**：复制 `.puml` 内容到 [PlantUML 在线编辑器](https://www.plantuml.com/plantuml/uml/)
2. **VS Code**：安装 [PlantUML 插件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)，打开文件后 `Alt+D` 预览
3. **本地**：`plantuml docs/architecture/togaf/*.puml` 生成 PNG/SVG
