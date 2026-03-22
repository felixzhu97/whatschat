# TOGAF – WhatsChat

四大架构域视图（PlantUML）。本目录为中文版图，英文版见 [en/rd/togaf](../../../en/rd/togaf/)。

## 图表

| 域 | 文件 | 说明 |
|----|------|------|
| 概览 | [overview.puml](./overview.puml) | 业务 → 应用 → 数据 → 技术；推荐流、内容审核、Vision |
| 业务 | [business-architecture.puml](./business-architecture.puml) | 参与者、能力（消息、类 Instagram 信息流与多媒体、Reels、推荐与探索、内容审核、关注、通话、文件、群组、**广告与投放管理**、行为分析）、流程 |
| 应用 | [application-architecture.puml](./application-architecture.puml) | Web/移动端/管理端；GraphQL Post **coverUrl**；媒体上传 `POST /media/upload`；WS **notification:new**；通知 MongoDB；探索与发帖；推荐（Celery、Redis）；Vision（标签、审核）；Admin 与广告 API；Analytics `analytics_events`。**移动端**：个人主页、搜索/探索、「设置与动态」栈；`FeedService` REST 探索/搜索/用户帖 + GraphQL |
| 数据 | [data-architecture.puml](./data-architecture.puml) | Post（**cover_url**、moderationStatus、hidden）、上传媒体对象（url/key/mimeType/size）、评论与**活动通知**（MongoDB）、信息流、互动、广告配置与投放、行为埋点 `analytics_events`；PostgreSQL、Redis、Cassandra、MongoDB、Elasticsearch |
| 技术 | [technology-architecture.puml](./technology-architecture.puml) | Next.js、React Native、NestJS、**GraphQL**、Python（Celery、Vision）、Prisma、Socket.IO、WebRTC、Redis、Docker、Elasticsearch、LightFM、implicit、Annoy、NudeNet、ResNet50 |

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
