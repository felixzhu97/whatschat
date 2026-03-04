# WhatsChat

A modern instant messaging application with real-time chat, voice/video calls, and file sharing.

## ✨ Features

- 💬 **Real-time Chat** – Instant messaging with Socket.IO (real connection only)
- 📞 **Voice/Video Calls** – WebRTC-based audio and video
- 📎 **File Sharing** – Send images, documents, and media
- 👥 **Contact Management** – Add, search, and manage contacts
- 🔍 **Message Search** – Full-text search powered by Elasticsearch
- 🔐 **Authentication** – JWT-based auth with bcrypt
- 🤖 **AI Text** – Streaming chat via Ollama (configurable base URL/model)
- 🖼️ **Image Generation** – Self-hosted (apps/image-gen, :3457) or Replicate; prompt refined and translated to English via Ollama, then generate
- 🎬 **Video Generation** – Self-hosted HTTP service (apps/video-gen, :3456); text-to-video
- 🌐 **Web App** – Next.js SPA on port 4000
- 📱 **Mobile App** – React Native + Expo
- 📊 **Behavior Analytics** – SDK in `@whatschat/analytics`; Web/Mobile track events; API ingests; Admin shows overview
- ⚙️ **Admin Dashboard** – Dashboard, Users, Content Safety, Ops Monitor, Business, Data Analytics, System Config, Permission & Audit (port 4001)

## 📸 Screenshots

### Mobile

<p align="center">
  <img src="./screenshots/mobile-login.png" width="200" alt="Mobile Login">
  <img src="./screenshots/mobile-chats-list.png" width="200" alt="Mobile Chats">
  <img src="./screenshots/mobile-chat-conversation.png" width="200" alt="Mobile Chat">
</p>
<p align="center">
  <img src="./screenshots/mobile-communities.png" width="200" alt="Mobile Communities">
  <img src="./screenshots/mobile-video-call.png" width="200" alt="Mobile Video Call">
  <img src="./screenshots/mobile-settings.png" width="200" alt="Mobile Settings">
</p>

### Web

<p align="center">
  <img src="./screenshots/web-login.png" width="280" alt="Web Login">
  <img src="./screenshots/web-chat-list.png" width="280" alt="Web Chat List">
  <img src="./screenshots/web-chat-conversation.png" width="280" alt="Web Chat">
  <img src="./screenshots/web-video-call.png" width="280" alt="Web Video Call">
</p>

### Admin

<p align="center">
  <img src="./screenshots/admin-dashboard.png" width="280" alt="Admin Dashboard">
  <img src="./screenshots/admin-users.png" width="280" alt="Admin Users">
</p>

## 🛠 Tech Stack

- **Frontend** – Next.js · React · TypeScript · Emotion · Redux Toolkit · Tailwind CSS · React Native · Expo · AG Grid · Recharts · i18next
- **Backend** – NestJS · Prisma · PostgreSQL · Redis · Socket.IO · Kafka · Elasticsearch (optional)
- **AI / Media** – Ollama (text stream), self-hosted image-gen (Python/FastAPI/diffusers), self-hosted video-gen (Python/FastAPI/CogVideoX); optional Replicate for image

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (PostgreSQL, Redis, Kafka via `apps/server/docker-compose.yml`)

### Setup

```bash
pnpm install
pnpm setup
```

### Run

```bash
pnpm start           # Full: Docker + image-gen (:3457) + video-gen (:3456) + API (:3001)
pnpm start:server    # Docker (postgres/redis/kafka) + NestJS API (:3001) only
pnpm start:web       # Web app on :4000
pnpm start:admin     # Admin dashboard on :4001
pnpm start:mobile:ios   # or start:mobile:android
```

### Environment

- `apps/server/.env` – Copy from `apps/server/.env.example`
  - **AI**: `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL`
  - **Image**: `IMAGE_GENERATION_API_URL` (e.g. `http://localhost:3457` for apps/image-gen) or `REPLICATE_API_TOKEN`
  - **Video**: `VIDEO_GENERATION_API_URL` (e.g. `http://localhost:3456` for apps/video-gen)
- `apps/web/.env.local` – `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`, `NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3001` (optional, for Socket.IO)
- `apps/admin/.env.local` – `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- `ADMIN_EMAILS=admin@whatschat.com` (comma-separated) for admin access

## 📁 Project Structure

```
apps/
  web        # Next.js web app (whatschat-web, :4000)
  admin      # Admin dashboard (whatschat-admin, :4001)
  mobile     # Expo mobile app (react-native-app)
  server     # NestJS API (whatschat-server, :3001)
  image-gen  # Self-hosted image generation (Python/FastAPI/diffusers, :3457)
  video-gen  # Self-hosted video generation (Python/FastAPI/CogVideoX, :3456)
packages/
  domain           # Shared types and constants (@whatschat/domain)
  im               # Instant messaging + RTC (@whatschat/im)
  rtc              # Voice/video call logic (@whatschat/rtc, used by im)
  analytics        # Behavior analytics SDK (@whatschat/analytics)
  llm              # LLM client (Ollama stream, used by server)
  image-generation # Image client (HTTP job API or Replicate, used by server)
  video-generation # Video client (HTTP job API, used by server)
```

**Shared packages:**
- `@whatschat/domain` – User, Message, Chat, Contact, Call types
- `@whatschat/im` – Chat slices, hooks (useRealChat, useChatsWithLiveMessages), RTC (useCall, createCallManager). Apps inject platform adapters.
- `@whatschat/rtc` – RTC domain (RTCCallState, ICallManager), config-driven createCallManager, formatDuration, CallManagerStub.
- `@whatschat/analytics` – Event types, track/identify API; Web/Mobile send events to API; Admin reads via REST.
- `@whatschat/llm` – Ollama streaming chat client.
- `@whatschat/image-generation` – Image generation: HTTP client (jobId poll) or Replicate adapter.
- `@whatschat/video-generation` – Video generation: HTTP client (jobId poll).

## 📚 Docs & Diagrams

- [文档索引](docs/README.md)
- [C4 Model](docs/en/rd/c4/README.md)
  - [System Context](docs/en/rd/c4/system-context.puml)
  - [Containers](docs/en/rd/c4/containers.puml)
  - [Components: API Server](docs/en/rd/c4/components-api-server.puml)
  - [Components: Web App](docs/en/rd/c4/components-web-app.puml)
  - [Components: Mobile App](docs/en/rd/c4/components-mobile-app.puml)
  - [Components: Admin App](docs/en/rd/c4/components-admin-app.puml)
- [TOGAF](docs/en/rd/togaf/overview.puml) · [Business](docs/en/rd/togaf/business-architecture.puml) · [Application](docs/en/rd/togaf/application-architecture.puml)

## 📄 License

MIT
