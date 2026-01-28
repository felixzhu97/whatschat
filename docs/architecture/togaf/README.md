# TOGAF Enterprise Architecture - WhatsChat

This directory contains the TOGAF (The Open Group Architecture Framework) views for the WhatsChat real‑time messaging system.  
The diagrams describe the **four core architecture domains**: Business, Application, Data, and Technology.

## Architecture Overview

- [overview.puml](./overview.puml) – **TOGAF Architecture Overview**: shows relationships and dependencies between the four domains (Business → Application → Data → Technology) as a single entry‑point diagram.

## Four Architecture Domains

| Diagram | Description |
| --- | --- |
| [business-architecture.puml](./business-architecture.puml) | **Business Architecture** – business actors, capabilities (user management, instant messaging, voice & video calls, file sharing, groups, contacts, notifications), business processes and business value |
| [application-architecture.puml](./application-architecture.puml) | **Application Architecture** – Web/Mobile clients, API gateways (REST, WebSocket, WebRTC), NestJS application services, data access, and infrastructure services |
| [data-architecture.puml](./data-architecture.puml) | **Data Architecture** – core entities (User, Chat, Message, Group, Call, Status, Contact, Notification, FileUpload), association entities, PostgreSQL/Redis/S3 storage and data flows |
| [technology-architecture.puml](./technology-architecture.puml) | **Technology Architecture** – frontend and backend technology stack (Next.js, React Native, NestJS, Prisma, JWT, Socket.IO, WebRTC), data persistence, and deployment (Docker, etc.) |

## Mapping to WhatsChat

- **Business** – instant messaging, audio/video calling, file sharing, groups, contacts, notifications and related core capabilities
- **Application** – `apps/web`, `apps/mobile`, `apps/server` and NestJS modules (Auth, Users, Messages, Chats, Calls, Groups, Status, WebSocket)
- **Data** – Prisma schema in `apps/server/prisma/` and PostgreSQL/Redis/S3
- **Technology** – monorepo (Turborepo, pnpm), each app’s `package.json`, `tsconfig.json`, and shared tooling

## Specification & Checklist

TOGAF specification, ADM process, architecture principles, governance rules, and checklists are documented in:

- [.cursor/rules/togaf-specification.mdc](../../../.cursor/rules/togaf-specification.mdc)

## How to View the Diagrams

1. **PlantUML Online** – copy the `.puml` content into the [PlantUML online editor](https://www.plantuml.com/plantuml/uml/)
2. **VS Code** – install the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) and press `Alt+D` to preview
3. **Local CLI** – run `plantuml docs/architecture/togaf/*.puml` to generate PNG/SVG files
