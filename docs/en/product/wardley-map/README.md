# WhatsFeed Wardley Map

This folder contains the Wardley Map for the WhatsFeed social platform.

## Wardley Map

![WhatsFeed Wardley Map](./images/Wardley_Map_WhatsFeed.png)

## What is a Wardley Map

A Wardley Map shows where system components sit on:

- **Value chain (Y-axis)** – From user needs down to infrastructure
- **Evolution (X-axis)** – From genesis (novel) to commodity

## File

- [wardley-map.puml](./wardley-map.puml) – Full Wardley Map (PlantUML)
- [images/Wardley_Map_WhatsFeed.png](./images/Wardley_Map_WhatsFeed.png) – Generated image

## Uses

- **Technology decisions** – Build vs buy
- **Architecture evolution** – How components move toward commodity
- **Cost optimization** – What can be commoditized
- **Strategy** – Differentiating vs generic capabilities

## Map structure

### Value chain (Y)

1. **User needs** – Messaging, social feed, voice/video calls, content creation, file sharing, discovery & recommendations, AI assistant
2. **Applications** – Web app, mobile app, admin dashboard
3. **Platform services** – Messaging, auth, calls, posts, media, search, notifications, recommendations, content moderation, RAG QA
4. **Infrastructure** – PostgreSQL, Redis, Cassandra, MongoDB, Elasticsearch, Object Storage, CDN, WebSocket, Containers, Qdrant, Ollama

### Evolution (X)

- **Genesis** – AI Assistant, Content Generation, RAG QA, Advanced Recommendations
- **Custom built** – Realtime Messaging, WebRTC Calls, Post Engagement, Content Moderation
- **Product** – Web App, Mobile App, Auth Platform, Search Platform, Push Notification
- **Commodity** – Databases, Storage, Containers, Vector Store

## Viewing

1. [PlantUML online](https://www.plantuml.com/plantuml/uml/) – paste `wardley-map.puml` content
2. VS Code – [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml), `Alt+D`
3. CLI: `plantuml docs/zh/product/wardley-map/wardley-map.puml`

## Related Documents

- [C4 Architecture](../rd/c4/) – View C4 architecture diagrams
- [Documentation Index](../README.md) – Back to documentation

## References

- [Wardley Maps](https://wardleymaps.com/)
- [Learn Wardley Mapping](https://learnwardleymapping.com/)
- [PlantUML](https://plantuml.com/)

---

[中文](../../zh/product/wardley-map/README.md)

Last updated: May 2026
