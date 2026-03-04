#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV=${1:-dev}
[[ "$ENV" == "dev" || "$ENV" == "prod" ]] || { echo -e "${RED}$0 [dev|prod]${NC}"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"
VIDEO_GEN_DIR="$ROOT_DIR/apps/video-gen"
IMAGE_GEN_DIR="$ROOT_DIR/apps/image-gen"
SERVER_PID=""
VIDEO_GEN_PID=""
IMAGE_GEN_PID=""

cleanup() {
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
  [ -n "$VIDEO_GEN_PID" ] && kill $VIDEO_GEN_PID 2>/dev/null || true
  [ -n "$IMAGE_GEN_PID" ] && kill $IMAGE_GEN_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}WhatsChat (${ENV})${NC}\n"

echo "[1/4] Stopping old processes..."
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3457 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "whatschat-server.*dev" 2>/dev/null || true
pkill -f "apps/video-gen/app.py" 2>/dev/null || true
pkill -f "apps/image-gen/app.py" 2>/dev/null || true
sleep 1

echo "[2/4] Docker (Postgres, Redis, Kafka)..."
COMPOSE_CMD="docker compose"
docker compose version >/dev/null 2>&1 || COMPOSE_CMD="docker-compose"
cd "$SERVER_DIR"
export COMPOSE_PROJECT_NAME=whatschat
$COMPOSE_CMD -f docker-compose.yml down 2>/dev/null || true
$COMPOSE_CMD -f docker-compose.yml up -d --wait postgres redis kafka 2>/dev/null || true
for i in $(seq 1 45); do
  nc -z 127.0.0.1 5433 2>/dev/null && nc -z 127.0.0.1 6379 2>/dev/null && nc -z 127.0.0.1 9092 2>/dev/null && break
  sleep 1
done
sleep 3
cd "$ROOT_DIR"

echo "[3/4] Migrate + seed..."
[ "$ENV" == "dev" ] && export DATABASE_URL="postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public"
pnpm --filter whatschat-server migrate >/dev/null 2>&1 || true
[ "$ENV" == "dev" ] && "$SCRIPT_DIR/../db/seed.sh" dev >/dev/null 2>&1 || true

echo "[4/4] Starting..."
if [ -f "$VIDEO_GEN_DIR/app.py" ] && command -v python3 >/dev/null 2>&1; then
  if [ -f "$VIDEO_GEN_DIR/requirements.txt" ]; then
    (cd "$VIDEO_GEN_DIR" && python3 -m pip install -r requirements.txt -q 2>/dev/null) || true
  fi
  (cd "$VIDEO_GEN_DIR" && ( [ -d ".venv" ] && . .venv/bin/activate; python3 app.py )) &
  VIDEO_GEN_PID=$!
  sleep 2
fi
if [ -f "$IMAGE_GEN_DIR/app.py" ] && command -v python3 >/dev/null 2>&1; then
  if [ -f "$IMAGE_GEN_DIR/requirements.txt" ]; then
    (cd "$IMAGE_GEN_DIR" && python3 -m pip install -r requirements.txt -q 2>/dev/null) || true
  fi
  (cd "$IMAGE_GEN_DIR" && ( [ -d ".venv" ] && . .venv/bin/activate; python3 app.py )) &
  IMAGE_GEN_PID=$!
  sleep 2
fi
[ ! -d "$ROOT_DIR/node_modules" ] && pnpm install
cd "$ROOT_DIR"
pnpm --filter whatschat-server dev &
SERVER_PID=$!
sleep 2
kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}Server failed${NC}"; exit 1; }

for i in $(seq 1 60); do
  kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}Server exited${NC}"; exit 1; }
  curl -sf http://localhost:3001/api/v1/health >/dev/null 2>&1 && break
  [ $i -eq 60 ] && { kill $SERVER_PID 2>/dev/null; echo -e "${RED}Health timeout${NC}"; exit 1; }
  sleep 2
done

echo -e "\n${GREEN}Ready. API: http://localhost:3001  (Ctrl+C to stop)${NC}\n"
wait $SERVER_PID
