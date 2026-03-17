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
- 🖼️ **Image / Video / Voice** – Self-hosted media-gen (Python/FastAPI, :3456): image (Stable Diffusion), video (CogVideoX), voice (edge-tts); or Replicate for image only
- 📷 **Feed & Posts** – Create posts with multiple photos/videos + caption; **video cover** stored in Cassandra as separate `coverUrl` (not mixed into `mediaUrls`); home feed shows real posts from followed users (Cassandra + Kafka post.created); **GraphQL** `POST /api/v1/graphql` for feed + post details in one request; Reels and profile grid use cover when present; **Explore** grid max-width 963px centered; multi-media carousel on feed and in comments dialog; comments in MongoDB
- 🧲 **Advertising System** – Ad accounts/campaigns/groups/creatives stored in PostgreSQL; ad serving service mixes sponsored posts into feed/explore based on targeting and pacing; impressions/clicks/conversions tracked via `@whatschat/analytics` and aggregated for reporting and recommendation features
- 🛡️ **Content Moderation** – Vision service (Python/FastAPI, :8001): image/video NSFW detection (NudeNet), tag suggestion (ResNet50); sync moderation on create; Kafka post.created for async; Admin: recheck, hide, batch delete
- 🔎 **Global Search** – Search posts, users, and hashtags (topics) via Elasticsearch; cursor-based pagination and highlight; rate limit (60/min); users indexed on register/update, hashtags on post.created; optional sync script `pnpm run search:sync-users`; startup script runs user sync after seed
- 🎯 **Recommendations** – Follow suggestions, engagement-based feed ranking, and explore stream; Python recommendation service (LightFM, implicit ALS + Annoy) with Celery workers, Redis caches, Kafka/PostgreSQL/Cassandra data (optional); ETL jobs read ad analytics to build ad metrics for models
- 👤 **Social** – Follow/unfollow, profile followers/following counts and list modals with infinite scroll and inline follow/unfollow
- 🌐 **Web App** – Next.js SPA (:4000); Instagram-style UI (nav, feed, Reels, profile, global search, **notifications** left sheet + **search** drawer, explore grid, DM-style messages, right sidebar suggestions), Redux notifications slice + Socket.IO `notification:new`, i18n (en/zh, footer language switch); sponsored posts rendered inline with "Sponsored" badge and ad click tracking
- 📱 **Mobile App** – React Native + Expo
- 📊 **Behavior & Ads Analytics** – SDK in `@whatschat/analytics`; Web/Mobile track events (including post view/like/save and ad_impression/ad_click/ad_conversion); API ingests; Admin shows overview and can run ETL for recommendation
- ⚙️ **Admin Dashboard** – Dashboard, Users, Content Safety (moderation stats, recheck, hide, batch delete), Ops Monitor, Business, Data Analytics, System Config, Permission & Audit, **Ads** (ad accounts, campaigns, ad sets/groups, creatives) (port 4001)

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
  <img src="./screenshots/web-screen-1.png" width="280" alt="Web Screen 1">
  <img src="./screenshots/web-screen-2.png" width="280" alt="Web Screen 2">
  <img src="./screenshots/web-screen-3.png" width="280" alt="Web Screen 3">
</p>
<p align="center">
  <img src="./screenshots/web-screen-4.png" width="280" alt="Web Screen 4">
  <img src="./screenshots/web-screen-5.png" width="280" alt="Web Screen 5">
  <img src="./screenshots/web-screen-6.png" width="280" alt="Web Screen 6">
</p>
<p align="center">
  <img src="./screenshots/web-screen-7.png" width="280" alt="Web Screen 7">
  <img src="./screenshots/web-screen-8.png" width="280" alt="Web Screen 8">
  <img src="./screenshots/web-screen-9.png" width="280" alt="Web Screen 9">
</p>

### Admin

<p align="center">
  <img src="./screenshots/admin-dashboard.png" width="280" alt="Admin Dashboard">
  <img src="./screenshots/admin-users.png" width="280" alt="Admin Users">
</p>

## 🛠 Tech Stack

- **Frontend** – Next.js · React · TypeScript · Emotion · Redux Toolkit · Tailwind CSS · React Native · Expo · AG Grid · Recharts · i18next
- **Backend** – NestJS · Prisma · PostgreSQL · Redis · Socket.IO · Kafka · Cassandra (posts, feed, engagement, **post cover_url**) · MongoDB (comments, **activity notifications** like/comment) · Elasticsearch (search, moderation status) · **GraphQL** (Apollo Server, code-first feed query + DataLoader; PostType includes `coverUrl`; feed/explore entries can be organic or sponsored ads)
- **Ads & Analytics** – `@whatschat/analytics` SDK (web/mobile) · NestJS analytics service (ingest + ad metrics aggregation) · Prisma models for `AdAccount`/`AdCampaign`/`AdGroup`/`AdCreative`/`AdSpend` · ad serving/targeting/pacing services mixed into feed/explore · Admin Ads REST APIs and dashboard
- **Recommendations** – Python (services/recommendation) · Celery (Redis broker) · LightFM · implicit (ALS) · Annoy · pandas · NumPy/SciPy; scheduled jobs generate follow suggestions and explore lists into Redis (optional); ETL scripts consume analytics_events (including ads) for model features
- **Vision** – Python (services/vision) · FastAPI · NudeNet (NSFW) · ResNet50 (tags) · OpenCV (video frames); sync moderation on post create; Kafka consumer updates ES
- **AI / Media** – Ollama (text stream), self-hosted media-gen (Python/FastAPI: diffusers + CogVideoX + edge-tts for image/video/voice); optional Replicate for image

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (PostgreSQL, Redis, Kafka, Cassandra, MongoDB, Elasticsearch via `services/server/docker-compose.yml`)

### Setup

```bash
pnpm install
pnpm setup
```

### Run

```bash
pnpm start           # Full: Docker (postgres, redis, kafka, cassandra, mongodb, elasticsearch) + migrate + seed + search:sync-users + media-gen (:3456) + API (:3001) + Vision (:8001)
pnpm start:server    # Docker (postgres/redis/kafka) + NestJS API (:3001) only
pnpm start:web       # Web app on :4000
pnpm start:admin     # Admin dashboard on :4001
pnpm start:mobile:ios   # or start:mobile:android
pnpm start:recommendation # Python recommendation worker + Celery beat (optional, runs in services/recommendation)
```

From repo root, `scripts/app/start.sh [dev|prod]` runs Docker, migrate, seed, **user sync to Elasticsearch**, then server (and optional media-gen, recommendation, Vision).

### Environment

- `services/server/.env` – Copy from `services/server/.env.example`
  - **AI**: `OLLAMA_BASE_URL`, `OLLAMA_DEFAULT_MODEL`
  - **Media** (image + video + voice): `MEDIA_GENERATION_API_URL` (e.g. `http://localhost:3456` for services/media-gen); or `REPLICATE_API_TOKEN` for image only
- **Vision** (content moderation, tag suggestion): `VISION_SERVICE_URL` (default `http://localhost:8001`)
- `apps/web/.env.local` – `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`, `NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3001` (optional, for Socket.IO)
- `apps/admin/.env.local` – `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- `ADMIN_EMAILS=admin@whatschat.com` (comma-separated) for admin access

## 📁 Project Structure

```
apps/
  web        # Next.js web app, Instagram-style UI + i18n (whatschat-web, :4000) – includes feed/explore ads rendering
  admin      # Admin dashboard (whatschat-admin, :4001) – includes Ads management section
  mobile     # Expo mobile app (react-native-app)
services/
  server        # NestJS API (whatschat-server, :3001) – REST/GraphQL + ad serving, analytics ingest, admin Ads APIs
  media-gen     # Self-hosted image + video + voice (Python/FastAPI, :3456)
  recommendation # Python recommendation + Celery + FastAPI rank (:8000) – reads analytics_events (including ads) via ETL
  vision        # Content moderation + tag suggestion (Python/FastAPI, :8001)
packages/
  domain           # Shared types and constants (@whatschat/domain)
  im               # Instant messaging + RTC (@whatschat/im)
  rtc              # Voice/video call logic (@whatschat/rtc, used by im)
  analytics        # Behavior & ads analytics SDK (@whatschat/analytics)
  llm              # LLM client (Ollama stream, used by server)
  image-generation # Image client (HTTP job API or Replicate, used by server)
  video-generation # Video client (HTTP job API, used by server)
```

**Code layout (C4/TOGAF):** API Server = `services/server` (including GraphQL feed + ads delivery, analytics ingest, admin Ads APIs), Media Gen = `services/media-gen`, Recommendation = `services/recommendation` (including ad ETL), Vision = `services/vision`; Web/Admin/Mobile = `apps/web` (feed/explore ads rendering), `apps/admin` (Ads management), `apps/mobile`.

**Shared packages:**
- `@whatschat/domain` – User, Message, Chat, Contact, Call types
- `@whatschat/im` – Chat slices, hooks (useRealChat, useChatsWithLiveMessages), RTC (useCall, createCallManager). Apps inject platform adapters.
- `@whatschat/rtc` – RTC domain (RTCCallState, ICallManager), config-driven createCallManager, formatDuration, CallManagerStub.
- `@whatschat/analytics` – Event types, track/identify API; Web/Mobile send events to API; Admin reads via REST; includes ad_impression/ad_click/ad_conversion.
- `@whatschat/llm` – Ollama streaming chat client.
- `@whatschat/image-generation` – Image generation: HTTP client (jobId poll) or Replicate adapter.
- `@whatschat/video-generation` – Video generation: HTTP client (jobId poll).

## 📚 Docs

- [Docs index](docs/README.md)
- [C4 Model](docs/en/rd/c4/README.md) – System context, containers, components (API incl. GraphQL feed, Web, Mobile, Admin, Media Gen, Recommendation, Vision); feed from followed users, multi-media posts, content moderation
- [TOGAF](docs/en/rd/togaf/README.md) – Business, Application, Data, Technology (four architecture domains)

## 📄 License

MIT
