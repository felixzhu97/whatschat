# TOGAF – WhatsChat

四大架构域视图（PlantUML），图文件见 [en/rd/togaf](../../../en/rd/togaf/)。

## 图表

| 域 | 文件 | 说明 |
|----|------|------|
| 概览 | [overview.puml](../../../en/rd/togaf/overview.puml) | 业务 → 应用 → 数据 → 技术 关系，含推荐流 |
| 业务 | [business-architecture.puml](../../../en/rd/togaf/business-architecture.puml) | 参与者、能力（消息、Feed、Reels、推荐与探索、关注、通话、文件、群组）、流程 |
| 应用 | [application-architecture.puml](../../../en/rd/togaf/application-architecture.puml) | Web/Mobile/Admin，NestJS（Feed、Explore、Follow、Suggestions、engagement），Python 推荐（Celery、LightFM、implicit、Annoy） |
| 数据 | [data-architecture.puml](../../../en/rd/togaf/data-architecture.puml) | User、Chat、Message、Post、FeedEntry、Comment、Engagement、UserFollow；PostgreSQL、Redis（含推荐缓存）、Cassandra、MongoDB、Elasticsearch |
| 技术 | [technology-architecture.puml](../../../en/rd/togaf/technology-architecture.puml) | Next.js、React Native、NestJS、Python、Celery、Prisma、Socket.IO、WebRTC、Redis、Docker、LightFM、implicit、Annoy |

## 查看

- [PlantUML 在线](https://www.plantuml.com/plantuml/uml/) 或 VS Code PlantUML 插件（`Alt+D`）
- CLI：`plantuml docs/en/rd/togaf/*.puml`

规范：[.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[English](../../../en/rd/togaf/README.md)
