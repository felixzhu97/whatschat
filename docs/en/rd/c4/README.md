# C4 Model – WhatsChat

C4 diagrams in PlantUML ([C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)).

## Diagrams

| Level | File | Description |
|-------|------|-------------|
| 1 | [system-context.puml](./system-context.puml) | System context: WhatsChat, users, external systems |
| 2 | [containers.puml](./containers.puml) | Containers: Web (:4000), Admin (:4001), Mobile, API (:3001), Media Gen (:3456), Recommendation service (Python/Celery), PostgreSQL, Redis, Kafka, Cassandra, MongoDB, Elasticsearch |
| 3 | [components-api-server.puml](./components-api-server.puml) | API server: REST controllers + **GraphQL** (Apollo, feed + nested post, DataLoader, JWT), Auth, Users, Messages, Chats, Posts, Feed (followed users with engagement ranking), Comments, Follow, Search (posts/users/hashtags, cursor, highlight, rate limit; user fallback via Prisma when ES unavailable), Explore, Recommendations (follow suggestions), WebSocket, repos |
| 3 | [components-web-app.puml](./components-web-app.puml) | Web app: nav, feed (real posts from followed users, multi-photo/video carousel, like/save, engagement counts), Reels, global search (posts/users/hashtags, debounce, cursor load more, highlight), profile (followers/following lists with infinite scroll), explore tab, create post (multi media), DM, right sidebar suggestions, i18n, hooks, API/WS clients |
| 3 | [components-mobile-app.puml](./components-mobile-app.puml) | Mobile app: screens, chat/call/settings, hooks, API/WS |
| 3 | [components-admin-app.puml](./components-admin-app.puml) | Admin: dashboard, users, content safety, analytics, API client |

## View

- **PlantUML Online**: paste `.puml` into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/)
- **VS Code**: PlantUML extension, `Alt+D` to preview (uses `docs/c4-lib/C4-PlantUML/`)
- **CLI**: `plantuml docs/en/rd/c4/*.puml`

[中文](../../zh/rd/c4/README.md)
