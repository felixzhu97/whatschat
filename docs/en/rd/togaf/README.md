# TOGAF – WhatsChat

TOGAF views for the four architecture domains (PlantUML).

## Diagrams

| Domain | File | Description |
|--------|------|-------------|
| Overview | [overview.puml](./overview.puml) | Business → Application → Data → Technology; recommendation flows, content moderation, Vision, **advertising & monetization** |
| Business | [business-architecture.puml](./business-architecture.puml) | Actors, capabilities (messaging, Instagram-style feed with multi-media, Reels, follow, recommendations, explore, content moderation, calls, file, groups, **ads & campaigns management**, behavior analytics), processes |
| Application | [application-architecture.puml](./application-architecture.puml) | Web/Mobile/Admin, REST/**GraphQL**/WebSocket/WebRTC, NestJS (media upload `POST /media/upload`, Post **cover_url**, Notifications MongoDB, Feed, Explore, Search, Suggestions, Admin recheck/hide/batch, **Ad serving/targeting/pacing + Admin Ads APIs**, analytics_events ingest endpoint used by web/mobile RTK Query mutations) + Python recommendation (Celery, Redis, **ad ETL/metrics** ) + Vision (NudeNet, ResNet50) |
| Data | [data-architecture.puml](./data-architecture.puml) | Post (**mediaUrls** + **coverUrl** Cassandra, moderationStatus, hidden ES), uploaded media object (URL/key/mimeType/size), FeedEntry, Comment, **activity notifications** (MongoDB), **AdAccount/AdCampaign/AdGroup/AdCreative/AdSpend, analytics_events (including feed/reel view/like/save and ad_impression/click/conversion)**; PostgreSQL, Redis, Cassandra, MongoDB, Elasticsearch, Kafka |
| Technology | [technology-architecture.puml](./technology-architecture.puml) | Next.js, React Native, NestJS, Prisma, **GraphQL**, Socket.IO, WebRTC, Docker, Python (Celery, LightFM, implicit, Annoy; Vision: FastAPI, NudeNet, ResNet50, OpenCV; **ad ETL & metrics**), Redis, Elasticsearch |

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
