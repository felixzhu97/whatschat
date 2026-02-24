# TOGAF 企业架构 – WhatsChat

本目录包含 WhatsChat 实时通讯系统的 TOGAF（The Open Group Architecture Framework）视图，图表文件位于 [en/rd/togaf](../../../../en/rd/togaf/)。  
描述 **四大架构域**：业务、应用、数据、技术。

## 架构概览

- [overview.puml](../../../../en/rd/togaf/overview.puml) – **TOGAF 架构概览**：四域（业务 → 应用 → 数据 → 技术）关系与依赖的入口图。

## 四大架构域

| 图表 | 说明 |
|------|------|
| [business-architecture.puml](../../../en/rd/togaf/business-architecture.puml) | **业务架构** – 业务参与者、能力（用户管理、即时消息、音视频通话、文件共享、群组、联系人、通知）、流程与价值 |
| [application-architecture.puml](../../../en/rd/togaf/application-architecture.puml) | **应用架构** – Web/移动客户端、API 网关（REST、WebSocket、WebRTC）、NestJS 应用服务、数据访问与基础设施服务 |
| [data-architecture.puml](../../../en/rd/togaf/data-architecture.puml) | **数据架构** – 核心实体（User、Chat、Message、Group、Call、Status、Contact、Notification、FileUpload）、关联实体、PostgreSQL/Redis/S3 存储与数据流 |
| [technology-architecture.puml](../../../en/rd/togaf/technology-architecture.puml) | **技术架构** – 前后端技术栈（Next.js、React Native、NestJS、Prisma、JWT、Socket.IO、WebRTC）、数据持久化与部署（Docker 等） |

## 与 WhatsChat 的对应

- **业务** – 即时消息、音视频通话、文件共享、群组、联系人、通知及核心能力
- **应用** – `apps/web`、`apps/mobile`、`apps/server` 及 NestJS 模块（Auth、Users、Messages、Chats、Calls、Groups、Status、WebSocket）
- **数据** – `apps/server/prisma/` 中的 Prisma 模型及 PostgreSQL/Redis/S3
- **技术** – monorepo（Turborepo、pnpm）、各应用 `package.json`、`tsconfig.json` 及共享工具

## 规范与检查清单

TOGAF 规范、ADM 流程、架构原则、治理规则与检查清单见：

- [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

## 如何查看图表

1. **PlantUML 在线** – 将 `.puml` 内容复制到 [PlantUML 在线编辑器](https://www.plantuml.com/plantuml/uml/)。
2. **VS Code** – 安装 [PlantUML 插件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)，按 `Alt+D` 预览。
3. **本地 CLI** – 执行 `plantuml docs/en/rd/togaf/*.puml` 生成 PNG/SVG。

中文 | [English](../../../en/rd/togaf/README.md)
