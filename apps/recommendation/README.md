# Recommendation Service (Python)

Batch jobs for user suggestions (LightFM + Implicit/Annoy + FoF) and explore. Results are written to Redis for the NestJS API to serve.

## Setup

```bash
cd apps/recommendation
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
```

Configure `.env` with the same `DATABASE_URL`, `REDIS_URL`, and `CASSANDRA_*` as the server.

## Run (CLI)

User suggestions (LightFM with user features + Implicit ALS with Annoy + FoF), write to Redis `recommendation:user:{userId}`:

```bash
python run_user_suggestions.py
# or
python run_jobs.py --job suggestions
```

Explore hot list:

```bash
python run_jobs.py --job explore
```

## Celery (Phase 4)

Optional: run jobs on a schedule via Celery with Redis as broker.

Start worker (run tasks):

```bash
celery -A celery_app worker -l info
```

Start beat (schedule: suggestions every 6h, explore every 5min):

```bash
celery -A celery_app beat -l info
```

Or run worker and beat in one process (dev only):

```bash
celery -A celery_app worker -l info -B
```

Trigger tasks manually (e.g. from Python or another app):

```python
from tasks import run_suggestions, run_explore
run_suggestions.delay()
run_explore.delay()
```

Set `CELERY_BROKER_URL` in `.env` (defaults to `REDIS_URL`).

## Jobs

- **suggestions**: LightFM (WARP + user cohort features), Implicit ALS with Annoy for fast recommend, FoF merge; export to Redis. Node API reads from Redis with fallback to real-time FoF.
- **feed_rank**: Not implemented; feed ranking is done in Node (engagement + recency).
- **explore**: Read post engagement and post_by_id from Cassandra, compute hot score, write `explore:hot` to Redis. Node `GET /posts/explore` serves it (filtered by not following).
