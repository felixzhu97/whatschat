# C4 模型 – WhatsChat

PlantUML 绘制的 C4 图（[C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)）。本目录为中文版图，英文版见 [en/rd/c4](../../../en/rd/c4/)。

## 图表

| 层级 | 文件 | 说明 |
|------|------|------|
| 1 | [system-context.puml](./system-context.puml) | 系统上下文：WhatsChat、用户、外部系统 |
| 2 | [containers.puml](./containers.puml) | 容器：Web、Admin、Mobile、API、媒体生成、推荐服务、视觉服务、PostgreSQL、Redis、Kafka、Cassandra、MongoDB、Elasticsearch |
| 3 | [components-api-server.puml](./components-api-server.puml) | API：REST + **GraphQL**、媒体上传 `POST /media/upload`、帖子（Cassandra **coverUrl**）、通知（MongoDB）、Feed/评论/关注/搜索/探索/Admin/Image/Video/Voice/Vision/WebSocket，并明确 Clean Architecture 分层：应用服务依赖领域端口（`IPostRepository`、`IEngagementRepository`、`ICommentRepository`、`INotificationRepository`），由基础设施适配器实现 |
| 3 | [components-web-app.puml](./components-web-app.puml) | Web：导航、信息流、Reels、**通知抽屉** + **搜索抽屉**、全局搜索、个人网格（视频封面 coverUrl）、**探索网格（最大 963px 居中）**、发帖（先上传媒体再提交帖子+封面、违规内联提示）、私信、Redux 通知 + WS、i18n |
| 3 | [components-mobile-app.puml](./components-mobile-app.puml) | 移动端：状态/主页 + Reels + 私信 + **搜索/探索**（`/posts/explore`、`/search`）+ **个人主页**（帖子网格、推荐、Tab）+ **设置与动态**栈；`FeedService` + RTK feedApi（GraphQL feed/reels + REST 探索/搜索/用户帖/按帖补拉）；发帖、媒体查看器、聊天/通话、埋点 |
| 3 | [components-admin-app.puml](./components-admin-app.puml) | 管理端：仪表盘、用户、内容安全（统计、重新识别、隐藏、批量删除）、分析、API 客户端 |

## 代码布局

| 容器 | 代码路径 |
|------|----------|
| Web / Admin / Mobile | `apps/web`、`apps/admin`、`apps/mobile` |
| API 服务 | `services/server` |
| 媒体生成服务 | `services/media-gen` |
| 推荐服务 | `services/recommendation` |
| 视觉服务 | `services/vision` |

## Clean Architecture 说明

- 应用层（`services/server/src/application/services`）依赖 `domain/interfaces/repositories` 中的端口接口
- 基础设施层通过 `services/server/src/infrastructure/adapters/repositories` 适配器实现端口
- DI 组合根在 `services/server/src/infrastructure/database/database.module.ts`，通过 `I...Repository` token 绑定实现

## 查看

- **PlantUML 在线**：将 `.puml` 粘贴至 [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**：PlantUML 插件，`Alt+D` 预览（使用 `docs/c4-lib/C4-PlantUML/`）
- **CLI**：`plantuml docs/zh/rd/c4/*.puml`

[English](../../../en/rd/c4/README.md)
