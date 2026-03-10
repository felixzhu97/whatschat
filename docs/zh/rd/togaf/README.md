# TOGAF – WhatsChat

四大架构域视图（PlantUML），图文件见 [en/rd/togaf](../../../en/rd/togaf/)。

## 图表

| 域 | 文件 | 说明 |
|----|------|------|
| 概览 | [overview.puml](../../../en/rd/togaf/overview.puml) | 业务 → 应用 → 数据 → 技术 关系 |
| 业务 | [business-architecture.puml](../../../en/rd/togaf/business-architecture.puml) | 参与者、能力（消息、Feed 多图/视频、Reels、关注、通话、文件、群组）、流程 |
| 应用 | [application-architecture.puml](../../../en/rd/togaf/application-architecture.puml) | Web/Mobile/Admin，REST/WebSocket/WebRTC，NestJS（Post mediaUrls[]、Feed 关注流、Comment、Follow、Search） |
| 数据 | [data-architecture.puml](../../../en/rd/togaf/data-architecture.puml) | User、Chat、Message、Post(mediaUrls)、FeedEntry、Comment、UserFollow；PostgreSQL、Redis、Cassandra、MongoDB、Elasticsearch |
| 技术 | [technology-architecture.puml](../../../en/rd/togaf/technology-architecture.puml) | Next.js、React Native、NestJS、Prisma、Socket.IO、WebRTC、Docker |

## 查看

- [PlantUML 在线](https://www.plantuml.com/plantuml/uml/) 或 VS Code PlantUML 插件（`Alt+D`）
- CLI：`plantuml docs/en/rd/togaf/*.puml`

规范：[.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[English](../../../en/rd/togaf/README.md)
