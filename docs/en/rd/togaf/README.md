# TOGAF – WhatsChat

TOGAF views for the four architecture domains (PlantUML).

## Diagrams

| Domain | File | Description |
|--------|------|-------------|
| Overview | [overview.puml](./overview.puml) | Relationships between Business → Application → Data → Technology, including recommendation flows |
| Business | [business-architecture.puml](./business-architecture.puml) | Actors, capabilities (messaging, feed with multi-media, Reels, follow, recommendations, explore, calls, file, groups), processes |
| Application | [application-architecture.puml](./application-architecture.puml) | Web/Mobile/Admin, REST/**GraphQL** (feed + Post **coverUrl**)/WebSocket (**notification:new**)/WebRTC, NestJS (Post **cover_url**, Notifications MongoDB, Feed, Explore, Search, Suggestions) + Python recommendation (Celery, Redis, Cassandra/PostgreSQL) |
| Data | [data-architecture.puml](./data-architecture.puml) | Post (**mediaUrls** + **coverUrl** Cassandra), FeedEntry, Comment, **activity notifications** (MongoDB), engagement; PostgreSQL, Redis, Cassandra, MongoDB (comments + notifications), Elasticsearch, Kafka |
| Technology | [technology-architecture.puml](./technology-architecture.puml) | Next.js, React Native, NestJS, Prisma, **GraphQL** (Apollo Server, @nestjs/graphql), Socket.IO, WebRTC, Docker, Python, Celery, LightFM, implicit (ALS), Annoy, Redis, Elasticsearch (search with sync script) |

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
