# C4 模型 – WhatsChat

PlantUML 绘制的 C4 图（[C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)）。本目录为中文版图，英文版见 [en/rd/c4](../../../en/rd/c4/)。

## 图表

### C1 系统上下文图

![C1 系统上下文](./images/system-context.png)

### C2 容器图

![C2 容器](./images/containers.png)

### C3 组件图

#### API Server

![C3 API Server](./images/components-api-server.png)

#### Web App

![C3 Web App](./images/components-web-app.png)

#### Mobile App

![C3 Mobile App](./images/components-mobile-app.png)

#### Admin App

![C3 Admin App](./images/components-admin-app.png)

## 查看

- **PlantUML 在线**：将 `.puml` 粘贴至 [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**：PlantUML 插件，`Alt+D` 预览（使用 `docs/c4-lib/C4-PlantUML/`）
- **CLI**：`plantuml docs/zh/rd/c4/*.puml`

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

[English](../../../en/rd/c4/README.md)
