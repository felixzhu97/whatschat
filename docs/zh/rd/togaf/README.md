# TOGAF – WhatsChat

四大架构域视图（PlantUML）。本目录为中文版图，英文版见 [en/rd/togaf](../../../en/rd/togaf/)。

## 图表

| 域 | 文件 | 说明 |
|----|------|------|
| 概览 | [overview.puml](./overview.puml) | 业务 → 应用 → 数据 → 技术 关系，含推荐流 |
| 业务 | [business-architecture.puml](./business-architecture.puml) | 参与者、能力（消息、信息流、Reels、推荐与探索、关注、通话、文件、群组）、流程 |
| 应用 | [application-architecture.puml](./application-architecture.puml) | Web/移动端/管理端，NestJS（信息流、探索、关注、搜索（帖子/用户/话题、游标、高亮、限流；ES 不可用时用户回退）、推荐、互动），Python 推荐（Celery、LightFM、implicit、Annoy） |
| 数据 | [data-architecture.puml](./data-architecture.puml) | User、Chat、Message、Post、FeedEntry、Comment、Engagement、Follow；PostgreSQL、Redis（含推荐缓存）、Cassandra、MongoDB、Elasticsearch（帖子/用户/话题搜索；用户注册/更新入索引、话题 post.created 入索引；游标、高亮、限流） |
| 技术 | [technology-architecture.puml](./technology-architecture.puml) | Next.js、React Native、NestJS、Python、Celery、Prisma、Socket.IO、WebRTC、Redis、Docker、Elasticsearch（搜索与同步脚本）、LightFM、implicit、Annoy |

## 查看

- [PlantUML 在线](https://www.plantuml.com/plantuml/uml/) 或 VS Code PlantUML 插件（`Alt+D`）
- CLI：`plantuml docs/zh/rd/togaf/*.puml`

规范：[.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[English](../../../en/rd/togaf/README.md)
