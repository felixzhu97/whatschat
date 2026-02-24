# C4 Model – WhatsChat

This folder contains the [C4 model](https://c4model.com/) diagrams for WhatsChat, authored in PlantUML using [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML).

## Diagram levels

| Level | Diagram | Description |
|-------|---------|-------------|
| **1 – System Context** | [system-context.puml](./system-context.puml) | WhatsChat as one system and its users and external systems (email, push, storage, STUN/TURN). |
| **2 – Containers** | [containers.puml](./containers.puml) | Main containers: Web App, Admin App, Mobile App, API Server, PostgreSQL, Redis, Object Storage. |
| **3 – Components (API Server)** | [components-api-server.puml](./components-api-server.puml) | NestJS API Server: controllers, WebSocket gateway, services, repositories. |
| **3 – Components (Web App)** | [components-web-app.puml](./components-web-app.puml) | Next.js Web App: pages, chat/call UI (Emotion, Radix UI), hooks, API/WebSocket clients, @whatschat/domain. |

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

# Generate PNGs
plantuml docs/c4/*.puml

# Or SVG
plantuml -tsvg docs/c4/*.puml
```

## Conventions

- **System Context**: One system (WhatsChat), actors (Web/Mobile User), and external systems only.
- **Containers**: Runnable deployables and data stores; Web App, Admin App, Mobile App, API Server, PostgreSQL, Redis, Object Storage.
- **Components**: Logical building blocks inside a container (e.g. services, gateways, hooks, API client).  
  Shared domain types are represented where relevant (e.g. Web App uses `@whatschat/domain`).

## References

- [C4 Model](https://c4model.com/)
- [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)

English | [中文](../../zh/rd/c4/README.md)
