#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV=${1:-dev}

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo -e "${RED}错误: 无效的环境参数 '${ENV}'${NC}"
    echo "用法: $0 [dev|prod]"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"

SERVER_PID=""

cleanup() {
    if [ -n "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}正在停止服务器进程...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}清理完成${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 一键启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
echo ""

echo -e "${BLUE}[1/6] 停止已运行的服务器...${NC}"
PORT_PIDS=$(lsof -ti:3001 2>/dev/null || true)
if [ -n "$PORT_PIDS" ]; then
    echo "$PORT_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
fi
SERVER_PIDS=$(ps aux | grep -E "(nest start|node.*dist/main.js|pnpm.*whatschat-server.*dev)" | grep -v grep | awk '{print $2}' || true)
if [ -n "$SERVER_PIDS" ]; then
    for PID in $SERVER_PIDS; do
        if kill -0 $PID 2>/dev/null; then
            kill $PID 2>/dev/null || true
            for i in 1 2 3 4 5; do
                kill -0 $PID 2>/dev/null || break
                sleep 1
            done
            kill -9 $PID 2>/dev/null || true
        fi
    done
    sleep 1
fi
if [ -n "$PORT_PIDS" ] || [ -n "$SERVER_PIDS" ]; then
    echo -e "${GREEN}  ✓ 已停止旧进程${NC}"
else
    echo -e "${GREEN}  ✓ 无运行中的服务器${NC}"
fi
echo ""

echo -e "${BLUE}[2/6] 检查环境依赖...${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker 已运行${NC}"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: docker-compose 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ docker-compose 已安装${NC}"

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: pnpm 未安装${NC}"
    echo -e "${YELLOW}提示: 请运行 npm install -g pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ pnpm 已安装${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}  ✓ Node.js 已安装 (${NODE_VERSION})${NC}"

if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}错误: 服务器目录不存在: ${SERVER_DIR}${NC}"
    exit 1
fi

echo ""

echo -e "${BLUE}[3/6] 启动 Docker 环境服务...${NC}"
cd "$SERVER_DIR"
if [ ! -f "docker-start.sh" ]; then
    echo -e "${RED}错误: docker-start.sh 不存在${NC}"
    exit 1
fi

bash docker-start.sh "$ENV" > /dev/null 2>&1 || {
    echo -e "${RED}错误: Docker 环境启动失败${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Docker 环境服务已启动${NC}"
cd "$ROOT_DIR"

echo ""

echo -e "${BLUE}[4/6] 等待数据库就绪...${NC}"

MAX_RETRIES=30
RETRY_COUNT=0
DB_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec whatschat-postgres pg_isready -U whatschat > /dev/null 2>&1; then
        DB_READY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}  等待数据库就绪... (${RETRY_COUNT}/${MAX_RETRIES})${NC}"
    sleep 2
done

if [ "$DB_READY" = false ]; then
    echo -e "${RED}错误: 数据库在 ${MAX_RETRIES} 次重试后仍未就绪${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ 数据库已就绪${NC}"
echo ""

echo -e "${BLUE}[5/6] 运行数据库迁移...${NC}"

if [ ! -f "$SERVER_DIR/.env" ]; then
    echo -e "${YELLOW}  警告: .env 文件不存在，将使用默认配置${NC}"
    if [ -f "$SERVER_DIR/env.example" ]; then
        echo -e "${YELLOW}  提示: 可以复制 env.example 为 .env 并配置${NC}"
    fi
fi

cd "$ROOT_DIR"
if pnpm --filter whatschat-server migrate > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ 数据库迁移完成${NC}"
else
    echo -e "${YELLOW}  警告: 数据库迁移可能失败，请检查日志${NC}"
    echo -e "${YELLOW}  提示: 可以手动运行 pnpm --filter whatschat-server migrate${NC}"
fi
echo ""

echo -e "${BLUE}[6/6] 启动服务器...${NC}"

if [ ! -d "$ROOT_DIR/node_modules" ]; then
    echo -e "${YELLOW}  检测到未安装依赖，正在安装...${NC}"
    pnpm install
fi

echo -e "${GREEN}  正在启动服务器...${NC}"
echo -e "${YELLOW}  提示: 服务器将在后台运行，日志将显示在下方${NC}"
echo ""

cd "$ROOT_DIR"
pnpm --filter whatschat-server dev &
SERVER_PID=$!

sleep 2

if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}错误: 服务器启动失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}服务信息:${NC}"
echo -e "  - 环境: ${GREEN}${ENV}${NC}"
echo -e "  - PostgreSQL: ${BLUE}postgresql://whatschat:whatschat123@localhost:5432/whatschat${NC}"
echo -e "  - Redis: ${BLUE}redis://localhost:6379${NC}"
echo -e "  - 服务器进程 PID: ${GREEN}${SERVER_PID}${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 按 Ctrl+C 停止所有服务${NC}"
echo -e "  - 查看服务器日志: ${BLUE}tail -f apps/server/logs/*.log${NC}"
echo -e "  - 停止服务: ${BLUE}pnpm run stop${NC}"
echo ""

wait $SERVER_PID
