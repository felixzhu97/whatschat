# TOGAF – WhatsChat

TOGAF views for the four architecture domains (PlantUML).

## Diagrams

| Domain | File | Description |
|--------|------|-------------|
| Overview | [overview.puml](./overview.puml) | Business → Application → Data → Technology; recommendation flows, content moderation, Vision |
| Business | [business-architecture.puml](./business-architecture.puml) | Actors, capabilities (messaging, feed with multi-media, Reels, follow, recommendations, explore, content moderation, calls, file, groups), processes |
| Application | [application-architecture.puml](./application-architecture.puml) | Web/Mobile/Admin, REST/**GraphQL**/WebSocket/WebRTC, NestJS (Post **cover_url**, Notifications MongoDB, Feed, Explore, Search, Suggestions, Admin recheck/hide/batch) + Python recommendation (Celery, Redis) + Vision (NudeNet, ResNet50) |
| Data | [data-architecture.puml](./data-architecture.puml) | Post (**mediaUrls** + **coverUrl** Cassandra, moderationStatus, hidden ES), FeedEntry, Comment, **activity notifications** (MongoDB); PostgreSQL, Redis, Cassandra, MongoDB, Elasticsearch, Kafka |
| Technology | [technology-architecture.puml](./technology-architecture.puml) | Next.js, React Native, NestJS, Prisma, **GraphQL**, Socket.IO, WebRTC, Docker, Python (Celery, LightFM, implicit, Annoy; Vision: FastAPI, NudeNet, ResNet50, OpenCV), Redis, Elasticsearch |

## Code layout

| Layer | Code path |
|-------|-----------|
| Clients | `apps/web`, `apps/admin`, `apps/mobile` |
| API Server | `services/server` |
| Recommendation | `services/recommendation` |
| Media Gen | `services/media-gen` |
| Vision | `services/vision` |

## View

- [PlantUML Online](https://www.plantuml.com/plantuml/uml/) or VS Code PlantUML extension (`Alt+D`)
- CLI: `plantuml docs/en/rd/togaf/*.puml`

Spec: [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[中文](../../zh/rd/togaf/README.md)
