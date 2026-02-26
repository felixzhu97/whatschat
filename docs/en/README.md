# WhatsChat Documentation (English)

Technical documentation for WhatsChat, grouped by **product**, **data**, and **R&D**. 中文: [zh](../zh/README.md).

## Directory structure

```
docs/
├── README.md                 # Index (zh / en)
├── c4-lib/                   # C4-PlantUML (used by en/rd/c4)
│   └── C4-PlantUML/
├── zh/                       # Chinese
│   ├── README.md
│   ├── product/              # Product: user journey, Wardley map
│   │   ├── user-journey-map/
│   │   └── wardley-map/
│   ├── data/                 # Data: data flow, replication
│   │   ├── data-flow.puml
│   │   └── data-replication.puml
│   └── rd/                   # R&D: API, distributed systems
│       ├── api/
│       └── distributed-systems/
└── en/                       # English (this tree)
    ├── README.md
    ├── product/              # Product (links to zh/product)
    ├── data/                 # Data: same + TOGAF data-architecture
    └── rd/                   # R&D: C4, TOGAF, API links
        ├── c4/
        └── togaf/
```

## Documentation by category

### Product

- [User journey & Wardley map](product/README.md) — index, links to [zh/product](../zh/product/)
- [User journey map](../zh/product/user-journey-map/user-journey-map.puml)
- [User persona map](../zh/product/user-journey-map/user-persona-map.puml)
- [User story map](../zh/product/user-journey-map/user-story-map.puml)
- [Wardley map](../zh/product/wardley-map/wardley-map.puml)

### Data

- [Data architecture & flow](data/README.md) — data-flow, data-replication, TOGAF data-architecture
- [data-flow.puml](data/data-flow.puml) — messaging, auth, file upload, call signaling (WebRTC)
- [data-replication.puml](data/data-replication.puml) — PostgreSQL replication
- [TOGAF data-architecture](rd/togaf/data-architecture.puml)

### R&D

- [C4 Model](rd/c4/README.md) — system context, containers, components (API server, web app, mobile app)
  - [Level 1 – System Context](rd/c4/system-context.puml)
  - [Level 2 – Containers](rd/c4/containers.puml)
  - [Level 3 – API Server Components](rd/c4/components-api-server.puml)
  - [Level 3 – Web App Components](rd/c4/components-web-app.puml)
  - [Level 3 – Mobile App Components](rd/c4/components-mobile-app.puml)
- [TOGAF](rd/togaf/README.md) — overview, business, application, data, technology
- [API](../zh/rd/api/README.md) — API docs and Postman collection
- [Distributed systems](../zh/rd/distributed-systems/README.md) — architecture, service discovery, transaction, load balancing, message queue

## Viewing diagrams

**Option 1 – Online:** [PlantUML online](https://www.plantuml.com/plantuml/uml/). Paste `.puml` content and submit.

**Option 2 – VS Code:** Install [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml), open a `.puml` file, press `Alt+D` to preview. C4 diagrams use shared [c4-lib](../c4-lib/).

**Option 3 – Local CLI:**

```bash
brew install java plantuml

# PNG
plantuml docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml

# SVG
plantuml -tsvg docs/zh/product/**/*.puml docs/zh/data/*.puml docs/zh/rd/distributed-systems/*.puml docs/en/rd/**/*.puml docs/en/data/*.puml
```

## Quick links (for root README)

- [C4 README](rd/c4/README.md)
- [Level 1 – System Context](rd/c4/system-context.puml)
- [Level 2 – Containers](rd/c4/containers.puml)
- [Level 3 – API Server](rd/c4/components-api-server.puml)
- [Level 3 – Web App](rd/c4/components-web-app.puml)
- [Level 3 – Mobile App](rd/c4/components-mobile-app.puml)
- [TOGAF](rd/togaf/)
- [Distributed systems](../zh/rd/distributed-systems/)
- [User journey map](../zh/product/user-journey-map/user-journey-map.puml)
- [Wardley map](../zh/product/wardley-map/wardley-map.puml)
## License

Documentation is under the same [MIT License](../../LICENSE) as the project.

[中文文档](../zh/README.md)
