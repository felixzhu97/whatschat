# TOGAF – WhatsChat

TOGAF views for the four architecture domains (PlantUML).

## Diagrams

| Domain | File | Description |
|--------|------|-------------|
| Overview | [overview.puml](./overview.puml) | Relationships between Business → Application → Data → Technology |
| Business | [business-architecture.puml](./business-architecture.puml) | Actors, capabilities (messaging, feed, Reels, follow, calls, file, groups), processes |
| Application | [application-architecture.puml](./application-architecture.puml) | Web/Mobile/Admin, REST/WebSocket/WebRTC, NestJS (Post, Feed, Comment, Follow, Search) |
| Data | [data-architecture.puml](./data-architecture.puml) | User, Chat, Message, Post, FeedEntry, Comment, UserFollow; PostgreSQL, Redis, Cassandra, MongoDB, Elasticsearch |
| Technology | [technology-architecture.puml](./technology-architecture.puml) | Next.js, React Native, NestJS, Prisma, Socket.IO, WebRTC, Docker |

## View

- [PlantUML Online](https://www.plantuml.com/plantuml/uml/) or VS Code PlantUML extension (`Alt+D`)
- CLI: `plantuml docs/en/rd/togaf/*.puml`

Spec: [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

[中文](../../zh/rd/togaf/README.md)
