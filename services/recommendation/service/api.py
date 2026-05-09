"""Recommendation service API with proper dependency injection."""
from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager

from service.models import FeedRankingService
from vector_store import RedisVectorStore, FaissVectorStore
import redis
import config as cfg


class RankRequest(BaseModel):
    userId: str
    candidateIds: List[str]
    limit: Optional[int] = 50
    region: Optional[str] = None
    language: Optional[str] = None
    experimentId: Optional[str] = None
    variantId: Optional[str] = None


class RankedItem(BaseModel):
    id: str
    score: float


class RankResponse(BaseModel):
    items: List[RankedItem]


class RecallRequest(BaseModel):
    userId: str
    limit: Optional[int] = 100


class RecallResponse(BaseModel):
    items: List[RankedItem]


class VectorStoreFactory:
    """Factory for creating vector store instances."""

    @staticmethod
    def create_redis_store() -> RedisVectorStore:
        client = redis.from_url(cfg.REDIS_URL, password=cfg.REDIS_PASSWORD, decode_responses=True)
        return RedisVectorStore(client, user_key_prefix="rec:user:vec:", item_key_prefix="rec:post:vec:")

    @staticmethod
    def create_faiss_store() -> FaissVectorStore:
        import os
        dim = int(os.getenv("FAISS_DIM", "64"))
        index_path = os.getenv("FAISS_INDEX_PATH")
        ids_path = os.getenv("FAISS_IDS_PATH")
        return FaissVectorStore(dim=dim, index_path=index_path, ids_path=ids_path)

    @staticmethod
    def get_vector_store():
        import os
        backend = os.getenv("VECTOR_BACKEND", "redis").lower()
        if backend == "faiss":
            return VectorStoreFactory.create_faiss_store()
        return VectorStoreFactory.create_redis_store()


class RankerFactory:
    """Factory for creating ranker instances."""

    @staticmethod
    def create_ranker() -> Optional[FeedRankingService]:
        import os
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(root, "models", "feed_ranker.pt")
        if not os.path.isfile(model_path):
            return None
        return FeedRankingService(model_path=model_path)


class AppState:
    """Application state container for dependency injection."""

    def __init__(self):
        self._ranker: Optional[FeedRankingService] = None
        self._redis_store: Optional[RedisVectorStore] = None
        self._faiss_store: Optional[FaissVectorStore] = None

    @property
    def ranker(self) -> Optional[FeedRankingService]:
        if self._ranker is None:
            self._ranker = RankerFactory.create_ranker()
        return self._ranker

    @property
    def redis_store(self) -> RedisVectorStore:
        if self._redis_store is None:
            self._redis_store = VectorStoreFactory.create_redis_store()
        return self._redis_store

    @property
    def faiss_store(self) -> FaissVectorStore:
        if self._faiss_store is None:
            self._faiss_store = VectorStoreFactory.create_faiss_store()
        return self._faiss_store

    def get_vector_store(self):
        import os
        backend = os.getenv("VECTOR_BACKEND", "redis").lower()
        if backend == "faiss":
            return self.faiss_store
        return self.redis_store


app_state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for initialization and cleanup."""
    ranker = app_state.ranker
    if ranker:
        print("Ranker loaded successfully")
    yield
    app_state._ranker = None
    app_state._redis_store = None
    app_state._faiss_store = None


app = FastAPI(lifespan=lifespan)


def recall_from_store(
    store: RedisVectorStore,
    user_id: str,
    top_k: int,
) -> List[RankedItem]:
    """Recall items from a vector store."""
    if isinstance(store, RedisVectorStore):
        user_key = f"{store.user_key_prefix}{user_id}"
        raw = store.client.get(user_key)
        if not raw:
            return []
        vec = [float(x) for x in raw.split(",") if x]
        results = store.query_similar_items(vec, top_k)
        return [RankedItem(id=item_id, score=score) for item_id, score in results]
    return []


@app.post("/v1/feed/rank", response_model=RankResponse)
async def rank_feed(body: RankRequest) -> RankResponse:
    if not body.candidateIds:
        return RankResponse(items=[])

    limit = body.limit or 50
    ranker = app_state.ranker
    if ranker is None:
        return RankResponse(
            items=[RankedItem(id=cid, score=1.0) for cid in body.candidateIds[:limit]]
        )

    ranked = ranker.rank(
        body.userId,
        body.candidateIds,
        region=body.region,
        language=body.language,
        experiment_id=body.experimentId,
        variant_id=body.variantId,
    )
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
    store = app_state.get_vector_store()
    top_k = body.limit or 100
    items = recall_from_store(store, body.userId, top_k)
    return RecallResponse(items=items)
