# RAG Service API Documentation

RAG (Retrieval Augmented Generation) service API documentation for semantic search and AI-powered question answering.

## Base Information

- **Base URL**: `http://localhost:8002`
- **API Version**: v1
- **API Prefix**: `/api/v1`

## Service Startup

```bash
# Using Docker Compose
cd services/rag
docker-compose up -d

# Or manually
cd services/rag
PYTHONPATH=. uvicorn src.main:app --host 0.0.0.0 --port 8002
```

## Health Check

### Health Check

```
GET /health
```

Returns overall service health status.

**Response Example:**
```json
{
  "status": "healthy",
  "services": {
    "qdrant": true,
    "ollama": true,
    "redis": true
  },
  "timestamp": "2026-05-02T01:00:00"
}
```

### Liveness Probe

```
GET /health/live
```

### Readiness Probe

```
GET /health/ready
```

---

## Document Management

### Upload Document

```
POST /api/v1/documents/upload
Content-Type: multipart/form-data
```

Upload and index PDF, HTML, Markdown, DOCX, or TXT files.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | File to upload |

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "file_size": 102400,
  "status": "indexed",
  "chunks_count": 15,
  "created_at": "2026-05-02T01:00:00"
}
```

---

### List Documents

```
GET /api/v1/documents?skip=0&limit=20
```

List all indexed documents.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Number of items to skip |
| `limit` | int | 20 | Number of items to return |

**Response Example:**
```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "document.pdf",
      "status": "indexed",
      "chunks_count": 15,
      "created_at": "2026-05-02T01:00:00"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

---

### Get Document Details

```
GET /api/v1/documents/{id}
```

**Response Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "file_size": 102400,
  "status": "indexed",
  "chunks_count": 15,
  "created_at": "2026-05-02T01:00:00",
  "updated_at": "2026-05-02T01:05:00"
}
```

---

### Delete Document

```
DELETE /api/v1/documents/{id}
```

Delete a document and all its chunks.

**Response Example:**
```json
{
  "message": "Document deleted successfully",
  "deleted_chunks": 15
}
```

---

## Web Crawler

### Scrape Single URL

```
POST /api/v1/crawler/scrape
Content-Type: application/json
```

**Request Example:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong",
  "max_depth": 1,
  "include_subpages": false
}
```

**Response Example:**
```json
{
  "id": "64d107e455ac94c7",
  "url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong",
  "title": "/wiki/Black_Myth_Wukong",
  "content_length": 83219,
  "chunks_count": 56,
  "status": "completed"
}
```

---

### Batch Scrape URLs

```
POST /api/v1/crawler/crawl
Content-Type: application/json
```

**Request Example:**
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2"
  ],
  "max_depth": 1
}
```

**Response Example:**
```json
{
  "total_urls": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "id": "...",
      "url": "https://example.com/page1",
      "status": "completed",
      "chunks_count": 10
    }
  ]
}
```

---

## Database Sync

### Sync Posts

```
POST /api/v1/sync/posts
```

Sync posts from the main database to vector store.

### Sync Comments

```
POST /api/v1/sync/comments
```

Sync comments from the main database to vector store.

### Sync All

```
POST /api/v1/sync/all
```

Sync all content types (posts and comments).

---

## RAG Query

### Query (Non-Streaming)

```
POST /api/v1/query
Content-Type: application/json
```

**Request Example:**
```json
{
  "query": "What is Black Myth: Wukong about?",
  "collection": "webpages",
  "top_k": 5,
  "include_sources": true,
  "temperature": 0.7,
  "stream": false
}
```

**Parameter Description:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | Required | Query question |
| `collection` | string | null | Target collection: `documents`, `posts`, `comments`, `webpages` |
| `top_k` | int | 5 | Number of relevant documents to return |
| `include_sources` | bool | false | Whether to include source documents |
| `temperature` | float | 0.7 | LLM temperature parameter |
| `stream` | bool | false | Stream response flag |
| `filter_metadata` | object | {} | Metadata filter conditions |

**Response Example:**
```json
{
  "answer": "Black Myth: Wukong is an action role-playing game...",
  "sources": [
    {
      "id": "uuid",
      "text": "Source text content...",
      "score": 0.892,
      "metadata": {
        "source_url": "https://...",
        "doc_id": "..."
      }
    }
  ],
  "query": "What is Black Myth: Wukong about?",
  "collection_used": "webpages",
  "total_chunks_searched": 5,
  "generation_time_ms": 2146
}
```

---

### Query (Streaming)

```
POST /api/v1/query/stream
Content-Type: application/json
Accept: text/event-stream
```

Stream LLM generated response.

**Response Format:** Server-Sent Events (SSE)

```
data: Black
data: Myth
data: : W
data: ukong
data: is
data: ...
data: [DONE]
```

---

### List Collections

```
GET /api/v1/query/collections
```

List all available collections and their information.

**Response Example:**
```json
{
  "collections": [
    {
      "name": "documents",
      "vectors_count": 150,
      "points_count": 150,
      "status": "green",
      "vector_size": 768,
      "distance": "Cosine"
    }
  ]
}
```

---

## Available Collections

| Collection | Description | Data Source |
|------------|-------------|-------------|
| `documents` | Document chunks | File upload |
| `posts` | Post chunks | Database sync |
| `comments` | Comment chunks | Database sync |
| `webpages` | Webpage chunks | Web crawler |

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message description"
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request parameters |
| 404 | Resource not found |
| 500 | Internal server error |
| 503 | Service unavailable (e.g., Ollama not running) |

---

## Complete Usage Examples

### 1. Upload Document

```bash
curl -X POST "http://localhost:8002/api/v1/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/document.pdf"
```

### 2. Scrape Webpage

```bash
curl -X POST "http://localhost:8002/api/v1/crawler/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong"}'
```

### 3. Query RAG

```bash
curl -X POST "http://localhost:8002/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the game about?",
    "collection": "webpages",
    "top_k": 3,
    "include_sources": true
  }'
```

### 4. Streaming Query

```bash
curl -X POST "http://localhost:8002/api/v1/query/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"query": "Summarize the content", "collection": "documents"}'
```

---

## Dependent Services

RAG service depends on the following services:

1. **Qdrant** (Vector Database)
   - URL: `http://localhost:6333`
   - Ports: 6333, 6334

2. **Ollama** (Local LLM)
   - URL: `http://localhost:11434`
   - Required models: `nomic-embed-text`, `qwen3-coder:30b`

3. **Redis** (Optional, caching)
   - URL: `redis://localhost:6379`

---

## Interactive Documentation

After starting the service, visit these URLs for interactive API documentation:

- Swagger UI: http://localhost:8002/docs
- ReDoc: http://localhost:8002/redoc

---

[中文](../../zh/rd/api/rag-api.md) | English
