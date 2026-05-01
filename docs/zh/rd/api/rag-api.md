# RAG Service API 文档

RAG (Retrieval Augmented Generation) 服务 API 文档，提供语义搜索和 AI 问答功能。

## 基础信息

- **Base URL**: `http://localhost:8002`
- **API Version**: v1
- **API Prefix**: `/api/v1`

## 服务启动

```bash
# 使用 Docker Compose
cd services/rag
docker-compose up -d

# 或手动启动
cd services/rag
PYTHONPATH=. uvicorn src.main:app --host 0.0.0.0 --port 8002
```

## 健康检查

### 健康检查

```
GET /health
```

返回服务整体健康状态。

**响应示例:**
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

### 存活探测

```
GET /health/live
```

### 就绪探测

```
GET /health/ready
```

---

## 文档管理

### 上传文档

```
POST /api/v1/documents/upload
Content-Type: multipart/form-data
```

上传并索引 PDF、HTML、Markdown、DOCX、TXT 文件。

**请求参数:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `file` | File | 是 | 要上传的文件 |

**响应示例:**
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

### 列出文档

```
GET /api/v1/documents?skip=0&limit=20
```

列出所有已索引的文档。

**查询参数:**

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `skip` | int | 0 | 跳过数量 |
| `limit` | int | 20 | 返回数量 |

**响应示例:**
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

### 获取文档详情

```
GET /api/v1/documents/{id}
```

**响应示例:**
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

### 删除文档

```
DELETE /api/v1/documents/{id}
```

删除文档及其所有 chunks。

**响应示例:**
```json
{
  "message": "Document deleted successfully",
  "deleted_chunks": 15
}
```

---

## 网页爬虫

### 抓取单个 URL

```
POST /api/v1/crawler/scrape
Content-Type: application/json
```

**请求示例:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong",
  "max_depth": 1,
  "include_subpages": false
}
```

**响应示例:**
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

### 批量抓取 URLs

```
POST /api/v1/crawler/crawl
Content-Type: application/json
```

**请求示例:**
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2"
  ],
  "max_depth": 1
}
```

**响应示例:**
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
    },
    {
      "id": "...",
      "url": "https://example.com/page2",
      "status": "completed",
      "chunks_count": 8
    }
  ]
}
```

---

## 数据库同步

### 同步帖子

```
POST /api/v1/sync/posts
```

从主数据库同步帖子到向量数据库。

### 同步评论

```
POST /api/v1/sync/comments
```

从主数据库同步评论到向量数据库。

### 同步全部

```
POST /api/v1/sync/all
```

同步所有内容类型（帖子和评论）。

---

## RAG 查询

### 查询（非流式）

```
POST /api/v1/query
Content-Type: application/json
```

**请求示例:**
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

**参数说明:**

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `query` | string | 必填 | 查询问题 |
| `collection` | string | null | 指定集合，可选: `documents`, `posts`, `comments`, `webpages` |
| `top_k` | int | 5 | 返回的相关文档数量 |
| `include_sources` | bool | false | 是否返回源文档 |
| `temperature` | float | 0.7 | LLM 温度参数 |
| `stream` | bool | false | 是否流式响应（仅标记） |
| `filter_metadata` | object | {} | 元数据过滤条件 |

**响应示例:**
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

### 查询（流式）

```
POST /api/v1/query/stream
Content-Type: application/json
Accept: text/event-stream
```

流式返回 LLM 生成的回答。

**响应格式:** Server-Sent Events (SSE)

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

### 列出集合

```
GET /api/v1/query/collections
```

列出所有可用的集合及其信息。

**响应示例:**
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
    },
    {
      "name": "webpages",
      "vectors_count": 56,
      "points_count": 56,
      "status": "green",
      "vector_size": 768,
      "distance": "Cosine"
    }
  ]
}
```

---

## 可用集合

| 集合名 | 描述 | 数据来源 |
|--------|------|----------|
| `documents` | 文档 chunks | 文件上传 |
| `posts` | 帖子 chunks | 数据库同步 |
| `comments` | 评论 chunks | 数据库同步 |
| `webpages` | 网页 chunks | 网页爬虫 |

---

## 错误处理

### 错误响应格式

```json
{
  "detail": "Error message description"
}
```

### 常见错误码

| 状态码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用（如 Ollama 未运行） |

---

## 完整使用示例

### 1. 上传文档

```bash
curl -X POST "http://localhost:8002/api/v1/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/document.pdf"
```

### 2. 抓取网页

```bash
curl -X POST "http://localhost:8002/api/v1/crawler/scrape" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Black_Myth_Wukong"}'
```

### 3. 查询 RAG

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

### 4. 流式查询

```bash
curl -X POST "http://localhost:8002/api/v1/query/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"query": "Summarize the content", "collection": "documents"}'
```

---

## 依赖服务

RAG 服务依赖以下服务：

1. **Qdrant** (向量数据库)
   - URL: `http://localhost:6333`
   - 端口: 6333, 6334

2. **Ollama** (本地 LLM)
   - URL: `http://localhost:11434`
   - 必需模型: `nomic-embed-text`, `qwen3-coder:30b`

3. **Redis** (可选，缓存)
   - URL: `redis://localhost:6379`

---

## 交互式文档

服务启动后，可访问以下地址查看交互式 API 文档：

- Swagger UI: http://localhost:8002/docs
- ReDoc: http://localhost:8002/redoc

---

中文 | [English](../../en/rd/api/rag-api.md)
