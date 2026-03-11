# TOGAF – WhatsChat

TOGAF views for the four architecture domains (PlantUML).

## Diagrams

| Domain | File | Description |
|--------|------|-------------|
| Overview | [overview.puml](./overview.puml) | Relationships between Business → Application → Data → Technology, including recommendation flows |
| Business | [business-architecture.puml](./business-architecture.puml) | Actors, capabilities (messaging, feed with multi-media, Reels, follow, recommendations, explore, calls, file, groups), processes |
| Application | [application-architecture.puml](./application-architecture.puml) | Web/Mobile/Admin, REST/WebSocket/WebRTC, NestJS (Post with mediaUrls[], Feed from followed users, Comment, Follow, Search (posts/users/hashtags, cursor, highlight, rate limit; user fallback when ES unavailable), Explore, Suggestions) and Python recommendation app (batch jobs via Celery, Redis, Cassandra/PostgreSQL) |
| Data | [data-architecture.puml](./data-architecture.puml) | User, Chat, Message, Post (mediaUrls), FeedEntry, Comment, UserFollow, engagement counters; PostgreSQL, Redis (caches + recommendation results), Cassandra (posts, feed, engagement), MongoDB, Elasticsearch (post/user/hashtag search; user index on register/update, hashtags on post.created; cursor, highlight, rate limit), Kafka events |
| Technology | [technology-architecture.puml](./technology-architecture.puml) | Next.js, React Native, NestJS, Prisma, Socket.IO, WebRTC, Docker, Python, Celery, LightFM, implicit (ALS), Annoy, Redis, Elasticsearch (search with sync script) |

## View

- [PlantUML Online](https://www.plantuml.com/plantuml/uml/) or VS Code PlantUML extension (`Alt+D`)
- CLI: `plantuml docs/en/rd/togaf/*.puml`

Spec: [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[中文](../../zh/rd/togaf/README.md)
