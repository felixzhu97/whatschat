# C4 Model – WhatsChat

C4 diagrams in PlantUML ([C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)).

## Diagrams

| Level | File | Description |
|-------|------|-------------|
| 1 | [system-context.puml](./system-context.puml) | System context: WhatsChat, users, external systems |
| 2 | [containers.puml](./containers.puml) | Containers: Web (:4000), Admin (:4001), Mobile, API (:3001), Media Gen (:3456), Recommendation (:8000), Vision (:8001), PostgreSQL, Redis, Kafka, Cassandra, MongoDB, Elasticsearch |
| 3 | [components-api-server.puml](./components-api-server.puml) | API server: REST + **GraphQL** (Apollo, feed + nested post, DataLoader, JWT), Posts (**coverUrl** in Cassandra), Notifications (MongoDB, GET/PATCH/POST), WebSocket **notification:new**, Feed, Comments, Follow, Search, Explore, Admin (recheck, hide, batch), Image/Video/Voice (Media Gen), Vision (tag suggestion, moderation), WebSocket, repos |
| 3 | [components-web-app.puml](./components-web-app.puml) | Web app: nav, feed, Reels, **notifications sheet** + **search drawer** (left sheets), global search, profile grid (**coverUrl**/coverImageUrl for video), **explore grid** (max-width 963px), create post (**coverUrl** submit, inline violation message), DM, sidebar, i18n, Redux notifications + WS |
| 3 | [components-mobile-app.puml](./components-mobile-app.puml) | Mobile app: screens, chat/call/settings, hooks, API/WS |
| 3 | [components-admin-app.puml](./components-admin-app.puml) | Admin: dashboard, users, content safety (stats, recheck, hide, batch delete), analytics, API client |

## Code layout

| Container | Code path |
|-----------|-----------|
| Web / Admin / Mobile | `apps/web`, `apps/admin`, `apps/mobile` |
| API Server | `services/server` |
| Media Gen Service | `services/media-gen` |
| Recommendation Service | `services/recommendation` |
| Vision Service | `services/vision` |

## View

- **PlantUML Online**: paste `.puml` into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**: PlantUML extension, `Alt+D` to preview (uses `docs/c4-lib/C4-PlantUML/`)
- **CLI**: `plantuml docs/en/rd/c4/*.puml`

[中文](../../zh/rd/c4/README.md)
