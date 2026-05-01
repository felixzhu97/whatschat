"""RAG Service FastAPI application."""
import logging
import time
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from src.config import get_settings
from src.core.qdrant_client import get_qdrant_service
from src.core.embedding import get_embedding_service
from src.schemas.common import HealthStatus

# Import routers
from src.api.routes import documents, crawler, sync, query

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Metrics
request_count = Counter(
    "rag_requests_total",
    "Total number of requests",
    ["method", "endpoint", "status"],
)
request_duration = Histogram(
    "rag_request_duration_seconds",
    "Request duration in seconds",
    ["method", "endpoint"],
)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting RAG Service...")

    settings = get_settings()
    settings.ensure_directories()

    # Initialize services
    try:
        qdrant = get_qdrant_service()
        await qdrant.initialize_collections()
        logger.info("Qdrant collections initialized")
    except Exception as e:
        logger.warning(f"Qdrant initialization failed: {e}")

    try:
        embeddings = get_embedding_service()
        logger.info("Embedding service initialized")
    except Exception as e:
        logger.warning(f"Embedding service initialization failed: {e}")

    logger.info("RAG Service started successfully")

    yield

    logger.info("Shutting down RAG Service...")


# Create FastAPI application
app = FastAPI(
    title="RAG Service",
    description="Retrieval Augmented Generation service for WhatsChat",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests."""
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {duration:.3f}s"
    )

    # Record metrics
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code,
    ).inc()
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path,
    ).observe(duration)

    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if logger.level <= logging.DEBUG else None,
        },
    )


# Health check endpoints
@app.get("/health", response_model=HealthStatus, tags=["Health"])
async def health_check():
    """Basic health check."""
    qdrant_healthy = False
    embedding_healthy = False

    try:
        qdrant = get_qdrant_service()
        qdrant_healthy = await qdrant.health_check()
    except Exception:
        pass

    try:
        embeddings = get_embedding_service()
        embedding_healthy = await embeddings.health_check()
    except Exception:
        pass

    status_str = "healthy" if (qdrant_healthy and embedding_healthy) else "degraded"

    return HealthStatus(
        status=status_str,
        version="1.0.0",
        services={
            "qdrant": qdrant_healthy,
            "embeddings": embedding_healthy,
        },
    )


@app.get("/health/live", tags=["Health"])
async def liveness():
    """Kubernetes liveness probe."""
    return {"status": "alive"}


@app.get("/health/ready", tags=["Health"])
async def readiness():
    """Kubernetes readiness probe."""
    try:
        qdrant = get_qdrant_service()
        qdrant_healthy = await qdrant.health_check()

        if not qdrant_healthy:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "not ready", "reason": "Qdrant unavailable"},
            )

        return {"status": "ready"}
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not ready", "reason": str(e)},
        )


# Prometheus metrics endpoint
@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Include routers
app.include_router(documents.router, prefix="/api/v1")
app.include_router(crawler.router, prefix="/api/v1")
app.include_router(sync.router, prefix="/api/v1")
app.include_router(query.router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "service": "RAG Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


def create_app() -> FastAPI:
    """Factory function to create the app."""
    return app


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=1 if settings.debug else settings.workers,
    )
