# Recommendation Service API Documentation

Recommendation service providing feed/explore/Reels ranking and vector recall.

## Base Information

- **Base URL**: `http://localhost:8000`
- **Framework**: FastAPI

## Service Startup

```bash
cd services/recommendation
python run_service.py
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VECTOR_BACKEND` | redis | Vector storage backend (redis/faiss) |
| `FAISS_DIM` | 64 | FAISS vector dimension |
| `FAISS_INDEX_PATH` | (empty) | FAISS index path |
| `FAISS_IDS_PATH` | (empty) | FAISS ID mapping file path |
| `DATABASE_URL` | (empty) | PostgreSQL connection string |
| `REDIS_URL` | redis://localhost:6379 | Redis connection URL |
| `CASSANDRA_*` | (empty) | Cassandra connection config |

---

## Online Ranking API

### Feed Ranking

```
POST /v1/feed/rank
```

Rank feed candidates for a user.

**Request:**
```json
{
  "userId": "user123",
  "candidateIds": ["post1", "post2", "post3", "post4", "post5"],
  "limit": 50,
  "region": "US",
  "language": "en",
  "experimentId": "exp-001",
  "variantId": "variant-a"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |
| `candidateIds` | string[] | Yes | List of candidate post IDs |
| `limit` | int | No | Max results to return, default 50 |
| `region` | string | No | User region |
| `language` | string | No | User language |
| `experimentId` | string | No | Experiment ID (A/B testing) |
| `variantId` | string | No | Experiment variant ID |

**Response:**
```json
{
  "items": [
    {"id": "post2", "score": 0.95},
    {"id": "post5", "score": 0.87},
    {"id": "post1", "score": 0.72}
  ]
}
```

---

### Explore Ranking

```
POST /v1/explore/rank
```

Rank explore page candidates. Same request format as `/v1/feed/rank`.

**Request:**
```json
{
  "userId": "user123",
  "candidateIds": ["post1", "post2", "post3"],
  "limit": 30
}
```

**Response:**
```json
{
  "items": [
    {"id": "post3", "score": 0.91},
    {"id": "post1", "score": 0.78}
  ]
}
```

---

### Reels Ranking

```
POST /v1/reels/rank
```

Rank Reels candidates. Same request format as `/v1/feed/rank`.

---

### Vector Recall

```
POST /v1/feed/recall
```

Recall similar posts based on user vector.

**Request:**
```json
{
  "userId": "user123",
  "limit": 100
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User ID |
| `limit` | int | No | Max results to return, default 100 |

**Response:**
```json
{
  "items": [
    {"id": "post456", "score": 0.92},
    {"id": "post789", "score": 0.88},
    {"id": "post123", "score": 0.85}
  ]
}
```

---

## Batch Jobs

### User Suggestions

```bash
python run_user_suggestions.py
# or
python run_jobs.py --job suggestions
```

Generates user follow suggestions, writes to Redis `recommendation:user:{userId}`.

### Explore Hot List

```bash
python run_jobs.py --job explore
```

Computes explore hot posts, writes to Redis `explore:hot`.

### Feed Rank Model Training

```bash
python run_jobs.py --job feed_rank
```

Trains PyTorch ranking model, outputs `models/feed_ranker.pt`.

### Vector Towers

```bash
python -m models.pytorch_towers
```

Generates user/post embeddings, writes to RedisVectorStore:
- User vectors: `rec:user:vec:{userId}`
- Post vectors: `rec:post:vec:{postId}`

---

## Celery Scheduled Tasks (Optional)

Start Worker:
```bash
celery -A celery_app worker -l info
```

Start Beat (scheduling):
```bash
celery -A celery_app beat -l info
```

Task Schedule:
- User suggestions: every 6 hours
- Explore hot: every 5 minutes

---

## Usage Examples

### Python Request Example

```python
import requests

# Ranking request
response = requests.post("http://localhost:8000/v1/feed/rank", json={
    "userId": "user123",
    "candidateIds": ["post1", "post2", "post3"],
    "limit": 3
})
ranked_posts = response.json()["items"]

# Vector recall
response = requests.post("http://localhost:8000/v1/feed/recall", json={
    "userId": "user123",
    "limit": 10
})
recalled_posts = response.json()["items"]
```

### curl Examples

```bash
# Ranking
curl -X POST "http://localhost:8000/v1/feed/rank" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "candidateIds": ["p1", "p2", "p3"]}'

# Recall
curl -X POST "http://localhost:8000/v1/feed/recall" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "limit": 10}'
```

---

## Data Dependencies

Recommendation service depends on:
- **PostgreSQL**: User info, follow relationships
- **Redis**: User suggestion cache, explore hot list, vector storage
- **Cassandra**: Post engagement data (likes, comments, saves)

---

[中文](../../zh/rd/api/recommendation-api.md) | English
