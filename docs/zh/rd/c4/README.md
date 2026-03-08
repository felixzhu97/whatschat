# C4 模型 – WhatsChat

PlantUML 绘制的 C4 图（[C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)），图文件见 [en/rd/c4](../../../en/rd/c4/)。

## 图表

| 层级 | 文件 | 说明 |
|------|------|------|
| 1 | [system-context.puml](../../../en/rd/c4/system-context.puml) | 系统上下文：WhatsChat、用户、外部系统 |
| 2 | [containers.puml](../../../en/rd/c4/containers.puml) | 容器：Web (:4000)、Admin (:4001)、Mobile、API (:3001)、Media Gen (:3456)、PostgreSQL、Redis、Kafka、Cassandra、MongoDB、Elasticsearch |
| 3 | [components-api-server.puml](../../../en/rd/c4/components-api-server.puml) | API：Auth、Users、Messages、Chats、Posts、Feed、Comments、Follow、Search、WebSocket、仓储 |
| 3 | [components-web-app.puml](../../../en/rd/c4/components-web-app.puml) | Web：导航、Feed、Reels、个人页（关注/粉丝）、私信（侧栏+聊天）、右侧栏（推荐、关注）、i18n、Hooks、API/WS |
| 3 | [components-mobile-app.puml](../../../en/rd/c4/components-mobile-app.puml) | 移动端：页面、聊天/通话/设置、Hooks、API/WS |
| 3 | [components-admin-app.puml](../../../en/rd/c4/components-admin-app.puml) | Admin：仪表盘、用户、内容安全、分析、API 客户端 |

## 查看

- **PlantUML 在线**：将 `.puml` 粘贴至 [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**：PlantUML 插件，`Alt+D` 预览（使用 `docs/c4-lib/C4-PlantUML/`）
- **CLI**：`plantuml docs/en/rd/c4/*.puml`

[English](../../../en/rd/c4/README.md)
