from typing import List

from fastapi import FastAPI
from pydantic import BaseModel

from service.models import FeedRankingService
from vector_store import RedisVectorStore, FaissVectorStore
import redis
import config as cfg
import os


class RankRequest(BaseModel):
    userId: str
    candidateIds: List[str]
    limit: int | None = 50
    region: str | None = None
    language: str | None = None
    experimentId: str | None = None
    variantId: str | None = None


class RankedItem(BaseModel):
    id: str
    score: float


class RankResponse(BaseModel):
    items: List[RankedItem]


class RecallRequest(BaseModel):
    userId: str
    limit: int | None = 100


class RecallResponse(BaseModel):
    items: List[RankedItem]


app = FastAPI()


ranker: FeedRankingService | None = None
redis_store: RedisVectorStore | None = None
faiss_store: FaissVectorStore | None = None


def get_ranker() -> FeedRankingService:
    global ranker
    if ranker is None:
        ranker = FeedRankingService(model_path="models/feed_ranker.pt")
    return ranker


def get_redis_store() -> RedisVectorStore:
    global redis_store
    if redis_store is None:
        client = redis.from_url(cfg.REDIS_URL, password=cfg.REDIS_PASSWORD, decode_responses=True)
        redis_store = RedisVectorStore(client, user_key_prefix="rec:user:vec:", item_key_prefix="rec:post:vec:")
    return redis_store


def get_faiss_store() -> FaissVectorStore:
    global faiss_store
    if faiss_store is None:
        dim = int(os.getenv("FAISS_DIM", "64"))
        index_path = os.getenv("FAISS_INDEX_PATH")
        ids_path = os.getenv("FAISS_IDS_PATH")
        faiss_store = FaissVectorStore(dim=dim, index_path=index_path, ids_path=ids_path)
    return faiss_store


def get_vector_store():
    backend = os.getenv("VECTOR_BACKEND", "redis").lower()
    if backend == "faiss":
        return get_faiss_store()
    return get_redis_store()


@app.post("/v1/feed/rank", response_model=RankResponse)
async def rank_feed(body: RankRequest) -> RankResponse:
    if not body.candidateIds:
        return RankResponse(items=[])
    service = get_ranker()
    ranked = service.rank(
        body.userId,
        body.candidateIds,
        region=body.region,
        language=body.language,
        experiment_id=body.experimentId,
        variant_id=body.variantId,
    )
    limit = body.limit or 50
    items = [RankedItem(id=item_id, score=score) for item_id, score in ranked[:limit]]
    return RankResponse(items=items)


@app.post("/v1/explore/rank", response_model=RankResponse)
async def rank_explore(body: RankRequest) -> RankResponse:
    return await rank_feed(body)


@app.post("/v1/reels/rank", response_model=RankResponse)
async def rank_reels(body: RankRequest) -> RankResponse:
    return await rank_feed(body)


@app.post("/v1/feed/recall", response_model=RecallResponse)
async def recall_feed(body: RecallRequest) -> RecallResponse:
    store = get_vector_store()
    if isinstance(store, RedisVectorStore):
        client = store.client
        user_key = f"{store.user_key_prefix}{body.userId}"
        raw = client.get(user_key)
        if not raw:
            return RecallResponse(items=[])
        vec = [float(x) for x in raw.split(",") if x]
        top_k = body.limit or 100
        results = store.query_similar_items(vec, top_k)
        items = [RankedItem(id=item_id, score=score) for item_id, score in results]
        return RecallResponse(items=items)
    if isinstance(store, FaissVectorStore):
        redis_client = get_redis_store().client
        user_key = f"{get_redis_store().user_key_prefix}{body.userId}"
        raw = redis_client.get(user_key)
        if not raw:
            return RecallResponse(items=[])
        vec = [float(x) for x in raw.split(",") if x]
        top_k = body.limit or 100
        results = store.query_similar_items(vec, top_k)
        items = [RankedItem(id=item_id, score=score) for item_id, score in results]
        return RecallResponse(items=items)
    return RecallResponse(items=[])

