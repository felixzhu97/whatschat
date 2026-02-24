# Distributed Systems Architecture

This folder describes the distributed systems architecture diagrams for WhatsChat: service topology, data flow, service discovery, transactions, load balancing, message queue, replication, and sequences.  
Diagram files (`.puml`) are under [zh/rd/distributed-systems](../../zh/rd/distributed-systems/); data-flow and data-replication are under [data](../../data/).

## Diagram index

| # | Diagram | Description |
|---|---------|-------------|
| 1 | [distributed-architecture.puml](../../zh/rd/distributed-systems/distributed-architecture.puml) | Service topology and communication (API, WebSocket, DB, cache, message queue) |
| 2 | [data-flow.puml](../../data/data-flow.puml) | Data flow for messaging, auth, file upload (see [data](../../data/README.md)) |
| 3 | [service-discovery.puml](../../zh/rd/distributed-systems/service-discovery.puml) | Kubernetes service discovery (Service, Endpoint, DNS) |
| 4 | [distributed-transaction.puml](../../zh/rd/distributed-systems/distributed-transaction.puml) | Cross-service transactions (2PC, Saga, messaging, groups) |
| 5 | [load-balancing-fault-tolerance.puml](../../zh/rd/distributed-systems/load-balancing-fault-tolerance.puml) | Load balancing, health checks, failover, scaling |
| 6 | [message-queue.puml](../../zh/rd/distributed-systems/message-queue.puml) | Redis Pub/Sub message queue |
| 7 | [data-replication.puml](../../data/data-replication.puml) | PostgreSQL replication (see [data](../../data/README.md)) |
| 8 | [service-communication-sequence.puml](../../zh/rd/distributed-systems/service-communication-sequence.puml) | Sequences: login, send message, push, create group |

## Tech stack

- **App**: NestJS + TypeScript
- **Database**: PostgreSQL (replication)
- **Cache / messaging**: Redis (ioredis) + Pub/Sub
- **Realtime**: Socket.io + WebSocket
- **Orchestration**: Kubernetes + Docker
- **Discovery**: Kubernetes Service
- **Load balancing**: Kubernetes Service + Ingress

## Viewing diagrams

1. **Online**: [PlantUML online](https://www.plantuml.com/plantuml/uml/) – paste `.puml` content.
2. **VS Code**: [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml), then `Alt+D` on a `.puml` file.
3. **CLI**: `plantuml docs/zh/rd/distributed-systems/*.puml` or `plantuml docs/en/data/*.puml` (for data-flow, data-replication).

## Audience

- **Architects** – system design, technology choices, evolution
- **Developers** – onboarding, service boundaries, debugging
- **Operations** – deployment, troubleshooting, performance
- **Project** – complexity, ownership, planning

## References

- [PlantUML](https://plantuml.com/)
- [Kubernetes](https://kubernetes.io/docs/)
- [Distributed patterns](https://microservices.io/patterns/)
- [Redis Pub/Sub](https://redis.io/docs/manual/pubsub/)

English | [中文](../../zh/rd/distributed-systems/README.md)

Last updated: December 2025
