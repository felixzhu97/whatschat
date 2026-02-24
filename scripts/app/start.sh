#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV=${1:-dev}
[[ "$ENV" == "dev" || "$ENV" == "prod" ]] || { echo -e "${RED}用法: $0 [dev|prod]${NC}"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"
SERVER_PID=""

cleanup() {
    [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# ---
echo -e "${BLUE}WhatsChat 启动 (${ENV})${NC}\n"

echo -e "${BLUE}[1/5] 停止旧进程...${NC}"
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "whatschat-server.*dev" 2>/dev/null || true
sleep 1
echo -e "${GREEN}  ✓${NC}\n"

echo -e "${BLUE}[2/5] 检查依赖...${NC}"
docker info >/dev/null 2>&1 || { echo -e "${RED}Docker 未运行${NC}"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo -e "${RED}pnpm 未安装${NC}"; exit 1; }
[ -d "$SERVER_DIR" ] || { echo -e "${RED}目录不存在: $SERVER_DIR${NC}"; exit 1; }
echo -e "${GREEN}  ✓${NC}\n"

echo -e "${BLUE}[3/5] Docker 服务 (Postgres + Redis + Kafka)...${NC}"
COMPOSE_CMD="docker compose"
docker compose version >/dev/null 2>&1 || COMPOSE_CMD="docker-compose"
cd "$SERVER_DIR"
export COMPOSE_PROJECT_NAME=whatschat
$COMPOSE_CMD -f docker-compose.yml down 2>/dev/null || true
# --wait: 等健康检查通过即继续，无需固定轮询 nc（需 Docker Compose 2.1+）
if $COMPOSE_CMD -f docker-compose.yml up -d --wait postgres redis kafka 2>/dev/null; then
  :
else
  # 兼容旧版：按端口轮询
  for i in $(seq 1 45); do
    nc -z 127.0.0.1 5433 2>/dev/null && nc -z 127.0.0.1 6379 2>/dev/null && nc -z 127.0.0.1 9092 2>/dev/null && break
    sleep 1
  done
fi
# Kafka 健康后仍需几秒才能接受客户端连接
sleep 3
cd "$ROOT_DIR"
echo -e "${GREEN}  ✓ 所有 Docker 服务就绪${NC}\n"

echo -e "${BLUE}[4/5] 迁移 + 种子...${NC}"
[ "$ENV" == "dev" ] && export DATABASE_URL="postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public"
pnpm --filter whatschat-server migrate >/dev/null 2>&1 || true
[ "$ENV" == "dev" ] && "$SCRIPT_DIR/../db/seed.sh" dev >/dev/null 2>&1 || true
echo -e "${GREEN}  ✓${NC}\n"

echo -e "${BLUE}[5/5] 启动服务器...${NC}"
[ ! -d "$ROOT_DIR/node_modules" ] && pnpm install
cd "$ROOT_DIR"
pnpm --filter whatschat-server dev &
SERVER_PID=$!
sleep 2
kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}服务器启动失败${NC}"; exit 1; }

# Wait for health
for i in $(seq 1 60); do
    kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}服务器进程退出${NC}"; exit 1; }
    curl -sf http://localhost:3001/api/v1/health >/dev/null 2>&1 && break
    [ $i -eq 60 ] && { kill $SERVER_PID 2>/dev/null; echo -e "${RED}健康检查超时${NC}"; exit 1; }
    sleep 2
done

echo -e "${GREEN}  ✓ 所有环境就绪${NC}"
echo -e "\n${GREEN}API: http://localhost:3001  (Ctrl+C 停止)${NC}\n"
wait $SERVER_PID
