# Recommendation Service API 文档

推荐服务，提供信息流/探索/Reels 的排序和向量召回功能。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **框架**: FastAPI

## 服务启动

```bash
cd services/recommendation
python run_service.py
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `VECTOR_BACKEND` | redis | 向量存储后端（redis/faiss） |
| `FAISS_DIM` | 64 | FAISS 向量维度 |
| `FAISS_INDEX_PATH` | (空) | FAISS 索引路径 |
| `FAISS_IDS_PATH` | (空) | FAISS ID 映射文件路径 |
| `DATABASE_URL` | (空) | PostgreSQL 连接字符串 |
| `REDIS_URL` | redis://localhost:6379 | Redis 连接 URL |
| `CASSANDRA_*` | (空) | Cassandra 连接配置 |

---

## 在线排序 API

### 信息流排序

```
POST /v1/feed/rank
```

对信息流候选项进行排序。

**请求:**
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

**参数说明:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `userId` | string | 是 | 用户 ID |
| `candidateIds` | string[] | 是 | 候选帖子 ID 列表 |
| `limit` | int | 否 | 返回数量上限，默认 50 |
| `region` | string | 否 | 用户地区 |
| `language` | string | 否 | 用户语言 |
| `experimentId` | string | 否 | 实验 ID（A/B 测试） |
| `variantId` | string | 否 | 实验变体 ID |

**响应:**
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

### 探索排序

```
POST /v1/explore/rank
```

对探索页候选项进行排序。与 `/v1/feed/rank` 请求格式相同。

**请求:**
```json
{
  "userId": "user123",
  "candidateIds": ["post1", "post2", "post3"],
  "limit": 30
}
```

**响应:**
```json
{
  "items": [
    {"id": "post3", "score": 0.91},
    {"id": "post1", "score": 0.78}
  ]
}
```

---

### Reels 排序

```
POST /v1/reels/rank
```

对 Reels 候选项进行排序。与 `/v1/feed/rank` 请求格式相同。

---

### 向量召回

```
POST /v1/feed/recall
```

基于用户向量召回相似帖子。

**请求:**
```json
{
  "userId": "user123",
  "limit": 100
}
```

**参数说明:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `userId` | string | 是 | 用户 ID |
| `limit` | int | 否 | 返回数量上限，默认 100 |

**响应:**
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

## 批处理任务

### 用户推荐

```bash
python run_user_suggestions.py
# 或
python run_jobs.py --job suggestions
```

生成用户关注推荐，结果写入 Redis `recommendation:user:{userId}`。

### 探索热门

```bash
python run_jobs.py --job explore
```

计算探索页热门帖子，结果写入 Redis `explore:hot`。

### 信息流排序模型训练

```bash
python run_jobs.py --job feed_rank
```

训练 PyTorch 排序模型，输出 `models/feed_ranker.pt`。

### 向量塔

```bash
python -m models.pytorch_towers
```

生成用户/帖子嵌入向量，写入 RedisVectorStore：
- 用户向量: `rec:user:vec:{userId}`
- 帖子向量: `rec:post:vec:{postId}`

---

## Celery 定时任务（可选）

启动 Worker：
```bash
celery -A celery_app worker -l info
```

启动 Beat（定时调度）：
```bash
celery -A celery_app beat -l info
```

任务调度：
- 用户推荐：每 6 小时
- 探索热门：每 5 分钟

---

## 使用示例

### Python 请求示例

```python
import requests

# 排序请求
response = requests.post("http://localhost:8000/v1/feed/rank", json={
    "userId": "user123",
    "candidateIds": ["post1", "post2", "post3"],
    "limit": 3
})
ranked_posts = response.json()["items"]

# 向量召回
response = requests.post("http://localhost:8000/v1/feed/recall", json={
    "userId": "user123",
    "limit": 10
})
recalled_posts = response.json()["items"]
```

### curl 示例

```bash
# 排序
curl -X POST "http://localhost:8000/v1/feed/rank" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "candidateIds": ["p1", "p2", "p3"]}'

# 召回
curl -X POST "http://localhost:8000/v1/feed/recall" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "limit": 10}'
```

---

## 数据依赖

推荐服务依赖以下数据：
- **PostgreSQL**: 用户信息、关注关系
- **Redis**: 用户推荐缓存、探索热门列表、向量存储
- **Cassandra**: 帖子互动数据（点赞、评论、收藏）

---

中文 | [English](../../en/rd/api/recommendation-api.md)
