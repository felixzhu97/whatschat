# C4 Model – WhatsChat

C4 diagrams in PlantUML ([C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)).

## Diagrams

| Level | File | Description |
|-------|------|-------------|
| 1 | [system-context.puml](./system-context.puml) | System context: WhatsChat, users, external systems |
| 2 | [containers.puml](./containers.puml) | Containers: Web (:4000), Admin (:4001), Mobile, API (:3001), Media Gen (:3456), Recommendation (:8000), Vision (:8001), PostgreSQL, Redis, Kafka, Cassandra, MongoDB, Elasticsearch; ad serving and analytics live inside API/Recommendation/PostgreSQL |
| 3 | [components-api-server.puml](./components-api-server.puml) | API server: REST + **GraphQL** (Apollo, feed/reels + nested post, DataLoader, JWT), media upload `POST /media/upload`, Posts (**coverUrl** in Cassandra), Notifications (MongoDB), WebSocket **notification:new**, Feed/Explore/Comments/Follow/Search, **Ads**, and explicit Clean Architecture layering: application services depend on domain ports (`IPostRepository`, `IEngagementRepository`, `ICommentRepository`, `INotificationRepository`) implemented by infrastructure adapters |
| 3 | [components-web-app.puml](./components-web-app.puml) | Web app: nav, feed, Reels, **notifications sheet** + **search drawer** (left sheets), global search, profile grid (**coverUrl**/coverImageUrl for video), **explore grid** (max-width 963px), create post (**upload media first, then submit post + cover**), DM, sidebar, i18n, Redux notifications + WS, **sponsored posts rendering + ad click tracking** |
| 3 | [components-mobile-app.puml](./components-mobile-app.puml) | Mobile app: Status/Home + Reels + DM + **Search/Explore** (`/posts/explore`, `/search`) + **Profile** (user posts grid, discover, tabs) + **Settings & activity** stack; `FeedService` + RTK feedApi (GraphQL feed/reels + REST explore/search/profile/user posts/getPostById); create post, media-viewer, chat/call, analytics |
| 3 | [components-admin-app.puml](./components-admin-app.puml) | Admin: dashboard, users, content safety (stats, recheck, hide, batch delete), analytics, **Ads management (accounts, campaigns, groups, creatives)**, API client |

## Code layout

| Container | Code path |
|-----------|-----------|
| Web / Admin / Mobile | `apps/web`, `apps/admin`, `apps/mobile` |
| API Server | `services/server` |
| Media Gen Service | `services/media-gen` |
| Recommendation Service | `services/recommendation` |
| Vision Service | `services/vision` |

## Clean Architecture notes

- Application layer (`services/server/src/application/services`) depends on repository interfaces in `domain/interfaces/repositories`
- Infrastructure layer implements ports via adapters in `services/server/src/infrastructure/adapters/repositories`
- DI composition root is `services/server/src/infrastructure/database/database.module.ts` using string tokens (`I...Repository`)

## View

- **PlantUML Online**: paste `.puml` into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**: PlantUML extension, `Alt+D` to preview (uses `docs/c4-lib/C4-PlantUML/`)
- **CLI**: `plantuml docs/en/rd/c4/*.puml`

[中文](../../zh/rd/c4/README.md)
