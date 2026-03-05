# C4 Model – WhatsChat

This folder contains the [C4 model](https://c4model.com/) diagrams for WhatsChat, authored in PlantUML using [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML).

## Diagram levels

| Level | Diagram | Description |
|-------|---------|-------------|
| **1 – System Context** | [system-context.puml](./system-context.puml) | WhatsChat, users, external systems (email, push, file storage, STUN/TURN). |
| **2 – Containers** | [containers.puml](./containers.puml) | Web App (:4000), Admin (:4001), Mobile, API Server (:3001), Media Gen (:3456, image/video/voice), PostgreSQL, Redis, Kafka, Local File Storage, Ollama (optional). |
| **3 – Components (API Server)** | [components-api-server.puml](./components-api-server.puml) | NestJS API Server: controllers (incl. AI/Image/Video/Voice), WebSocket gateway, services (incl. AI/Image/Video/Voice/Analytics), repositories; image prompts refined via Ollama; voice uses LLM + optional translate then TTS. |
| **3 – Components (Web App)** | [components-web-app.puml](./components-web-app.puml) | Next.js Web App: pages, left nav (Instagram-style), feed, chat, right sidebar, i18n (default en), call UI, hooks, API/WebSocket clients, @whatschat/domain. |
| **3 – Components (Mobile App)** | [components-mobile-app.puml](./components-mobile-app.puml) | Expo Mobile App: screens (Expo Router), chat/call/settings UI (Emotion), auth/message hooks, i18n, theme, API/WebSocket clients, @whatschat/domain. |
| **3 – Components (Admin App)** | [components-admin-app.puml](./components-admin-app.puml) | Next.js Admin: pages, DataGrid (AG Grid), Recharts, auth/theme/i18n providers, API client. |

## How to view

### Option 1: PlantUML online

1. Open [PlantUML Online](https://www.plantuml.com/plantuml/uml/).
2. Paste the contents of a `.puml` file (or use the “include” URL if supported).
3. Render the diagram.

### Option 2: VS Code

1. Install the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml).
2. Open a `.puml` file in this folder.
3. Use `Alt+D` (or the command “PlantUML: Preview”) to preview.  
   Diagrams use the local C4-PlantUML lib in `../c4-lib/C4-PlantUML/` (no network required).

### Option 3: Local PlantUML (CLI)

```bash
# Install Java and PlantUML (e.g. on macOS)
brew install plantuml

# Generate PNGs (from repo root)
plantuml docs/en/rd/c4/*.puml

# Or SVG
plantuml -tsvg docs/en/rd/c4/*.puml
```

## Conventions

- **System Context**: One system (WhatsChat), actors (Web/Mobile User), and external systems only.
- **Containers**: Web App (:4000), Admin (:4001), Mobile, API Server (:3001), Media Gen (:3456, image + video + voice), PostgreSQL, Redis, Kafka, Local File Storage, Ollama (optional). Admin includes Dashboard, Users, Content Safety, Ops Monitor, Business, Data Analytics, System Config, Permission & Audit.
- **Components**: Logical building blocks inside a container (e.g. services, gateways, hooks, API client).  
  Shared domain types are represented where relevant (e.g. Web App uses `@whatschat/domain`).

## References

- [C4 Model](https://c4model.com/)
- [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)

English | [中文](../../zh/rd/c4/README.md)
