# C4 模型 – WhatsChat

本目录说明 WhatsChat 的 [C4 模型](https://c4model.com/) 图表，图表使用 [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML) 以 PlantUML 编写，图表文件位于 [en/rd/c4](../../../../en/rd/c4/)。

## 图表层级

| 层级 | 图表 | 说明 |
|------|------|------|
| **1 – 系统上下文** | [system-context.puml](../../../en/rd/c4/system-context.puml) | WhatsChat 作为单一系统，与用户及外部系统（邮件、推送、存储、STUN/TURN）的关系。 |
| **2 – 容器** | [containers.puml](../../../en/rd/c4/containers.puml) | 主要容器：Web 应用 (:4000)、Admin 应用 (:4001)、移动应用、API 服务 (:3001)、媒体生成服务 (:3456，图/视频/语音)、PostgreSQL、Redis、Kafka、本地文件存储、Ollama（可选）。 |
| **3 – 组件（API 服务）** | [components-api-server.puml](../../../en/rd/c4/components-api-server.puml) | NestJS API 服务：控制器（含 AI/Image/Video/Voice）、WebSocket 网关、服务（含 AI/Image/Video/Voice/Analytics）、仓储；图生经 Ollama 润色；语音为 LLM 文本 + 可选翻译后 TTS。 |
| **3 – 组件（Web 应用）** | [components-web-app.puml](../../../en/rd/c4/components-web-app.puml) | Next.js Web 应用：页面、聊天/通话 UI、Hooks、API/WebSocket 客户端、@whatschat/domain。 |
| **3 – 组件（移动应用）** | [components-mobile-app.puml](../../../en/rd/c4/components-mobile-app.puml) | Expo 移动应用：屏幕、聊天/通话/设置 UI、Hooks、i18n、主题、API/WebSocket 客户端。 |
| **3 – 组件（Admin 应用）** | [components-admin-app.puml](../../../en/rd/c4/components-admin-app.puml) | Next.js Admin 应用：页面、DataGrid、图表、认证/主题/i18n、API 客户端。 |

## 如何查看

### 方法一：PlantUML 在线

1. 打开 [PlantUML 在线](https://www.plantuml.com/plantuml/uml/)。
2. 粘贴 `.puml` 文件内容。
3. 生成图表。

### 方法二：VS Code

1. 安装 [PlantUML 插件](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)。
2. 打开 [en/rd/c4](../../../../en/rd/c4/) 下的 `.puml` 文件。
3. 使用 `Alt+D` 预览。图表引用本地 C4-PlantUML 库，无需联网。

### 方法三：本地 PlantUML（CLI）

```bash
brew install plantuml
plantuml docs/en/rd/c4/*.puml
plantuml -tsvg docs/en/rd/c4/*.puml
```

## 约定

- **系统上下文**：单一系统（WhatsChat）、参与者（Web/移动用户）及外部系统。
- **容器**：可部署的运行单元与数据存储；Web 应用 (:4000)、Admin 应用 (:4001)、移动应用、API 服务 (:3001)、媒体生成服务 (:3456，图/视频/语音)、PostgreSQL、Redis、Kafka、本地文件存储、Ollama（可选）。
- **组件**：容器内的逻辑模块（如服务、网关、Hooks、API 客户端）。共享领域类型在图中体现（如 Web 应用使用 `@whatschat/domain`）。

## 参考

- [C4 Model](https://c4model.com/)
- [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)

中文 | [English](../../../en/rd/c4/README.md)
