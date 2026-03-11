# C4 模型 – WhatsChat

PlantUML 绘制的 C4 图（[C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)）。本目录为中文版图，英文版见 [en/rd/c4](../../../en/rd/c4/)。

## 图表

| 层级 | 文件 | 说明 |
|------|------|------|
| 1 | [system-context.puml](./system-context.puml) | 系统上下文：WhatsChat、用户、外部系统 |
| 2 | [containers.puml](./containers.puml) | 容器：Web、Admin、Mobile、API、Media Gen、推荐服务（Python/Celery）、PostgreSQL、Redis、Kafka、Cassandra、MongoDB、Elasticsearch |
| 3 | [components-api-server.puml](./components-api-server.puml) | API：认证、用户、消息、聊天、帖子、信息流（互动排序）、探索、评论、关注（推荐）、搜索（帖子/用户/话题、游标、高亮、限流；ES 不可用时用户回退 Prisma）、WebSocket、仓储 |
| 3 | [components-web-app.puml](./components-web-app.puml) | Web：导航、信息流（点赞/收藏）、Reels、全局搜索（帖子/用户/话题、防抖、游标加载更多、高亮）、探索、个人页（粉丝/关注列表无限滚动、isFollowing）、发帖、评论弹窗、私信、右侧栏、i18n、Hooks、API/WS |
| 3 | [components-mobile-app.puml](./components-mobile-app.puml) | 移动端：页面、聊天/通话/设置、Hooks、API/WS |
| 3 | [components-admin-app.puml](./components-admin-app.puml) | 管理端：仪表盘、用户、内容安全、分析、API 客户端 |

## 查看

- **PlantUML 在线**：将 `.puml` 粘贴至 [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**：PlantUML 插件，`Alt+D` 预览（使用 `docs/c4-lib/C4-PlantUML/`）
- **CLI**：`plantuml docs/zh/rd/c4/*.puml`

[English](../../../en/rd/c4/README.md)
