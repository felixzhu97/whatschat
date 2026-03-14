# TOGAF – WhatsChat

四大架构域视图（PlantUML）。本目录为中文版图，英文版见 [en/rd/togaf](../../../en/rd/togaf/)。

## 图表

| 域 | 文件 | 说明 |
|----|------|------|
| 概览 | [overview.puml](./overview.puml) | 业务 → 应用 → 数据 → 技术 关系，含推荐流 |
| 业务 | [business-architecture.puml](./business-architecture.puml) | 参与者、能力（消息、信息流、Reels、推荐与探索、关注、通话、文件、群组）、流程 |
| 应用 | [application-architecture.puml](./application-architecture.puml) | Web/移动端/管理端；GraphQL Post **coverUrl**；WS **notification:new**；通知服务 MongoDB；探索网格与发帖 coverUrl |
| 数据 | [data-architecture.puml](./data-architecture.puml) | Post（**cover_url**）、评论与**活动通知**（MongoDB）、信息流、互动；PostgreSQL、Redis、Cassandra、MongoDB、Elasticsearch |
| 技术 | [technology-architecture.puml](./technology-architecture.puml) | Next.js、React Native、NestJS、**GraphQL**（Apollo、@nestjs/graphql）、Python、Celery、Prisma、Socket.IO、WebRTC、Redis、Docker、Elasticsearch（搜索与同步脚本）、LightFM、implicit、Annoy |

## 代码布局

| 层级 | 代码路径 |
|------|----------|
| 客户端 | `apps/web`、`apps/admin`、`apps/mobile` |
| API 服务 | `services/server` |
| 推荐 | `services/recommendation` |
| 媒体生成 | `services/media-gen` |
| 视觉 | `services/vision` |

## 查看

- [PlantUML 在线](https://www.plantuml.com/plantuml/uml/) 或 VS Code PlantUML 插件（`Alt+D`）
- CLI：`plantuml docs/zh/rd/togaf/*.puml`

规范：[.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[English](../../../en/rd/togaf/README.md)
