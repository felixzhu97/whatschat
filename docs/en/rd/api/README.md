# API Documentation

This folder contains API documentation for all WhatsChat services.

## Services

| Service | Port | Description |
|---------|------|-------------|
| [Server (NestJS)](./server-api.md) | 3001 | Main API server |
| [RAG Service](./rag-api.md) | 8002 | Semantic search and RAG |
| [Media Gen](./media-gen-api.md) | 3456 | Image, video, voice generation |
| [Vision](./vision-api.md) | 8001 | Image tagging and moderation |
| [Recommendation](./recommendation-api.md) | 8000 | Feed ranking and recall |

---

## Quick Links

### RAG Service (Semantic Search)
- [RAG API](./rag-api.md) - Document upload, web crawler, RAG query

### Media Generation
- [Media Gen API](./media-gen-api.md) - Image/Video/Voice synthesis

### Vision & Moderation
- [Vision API](./vision-api.md) - Image tags and NSFW detection

### Recommendation
- [Recommendation API](./recommendation-api.md) - Feed ranking and recall

---

## Server API

### Postman Collection

- [whatschat-api.postman_collection.json](../../zh/rd/api/whatschat-api.postman_collection.json) – Full Postman collection for WhatsChat Server API

#### Included Tests:
- Health check
- User authentication
- Messages
- File upload
- WebSocket connection
- Other business endpoints

### How to use Postman

1. Open Postman
2. Click **Import**
3. Select `whatschat-api.postman_collection.json`
4. Configure `base_url` environment variable:
   - Development: `http://localhost:4000`
   - Production: `https://api.whatschat.com`
5. Run requests

---

English | [中文](./README.md)
