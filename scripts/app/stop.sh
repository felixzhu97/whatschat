#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENV=${1:-dev}
REMOVE_VOLUMES=false

if [[ "$1" == "--remove-volumes" ]] || [[ "$2" == "--remove-volumes" ]]; then
    REMOVE_VOLUMES=true
    if [[ "$1" == "--remove-volumes" ]]; then
        ENV=${2:-dev}
    fi
fi

if [[ "$ENV" != "dev" && "$ENV" != "prod" && "$ENV" != "--remove-volumes" ]]; then
    if [[ "$ENV" != "--remove-volumes" ]]; then
        echo -e "${RED}错误: 无效的环境参数 '${ENV}'${NC}"
        echo "用法: $0 [dev|prod] [--remove-volumes]"
        exit 1
    fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 一键停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
if [ "$REMOVE_VOLUMES" == "true" ]; then
    echo -e "${RED}警告: 将删除所有数据卷（包括数据库数据）！${NC}"
fi
echo ""

echo -e "${BLUE}[1/2] 停止服务器进程...${NC}"

SERVER_PIDS=$(ps aux | grep -E "(nest start|node.*dist/main.js|pnpm.*dev)" | grep -v grep | awk '{print $2}' || true)

if [ -z "$SERVER_PIDS" ]; then
    echo -e "${YELLOW}  ✓ 未找到运行中的服务器进程${NC}"
else
    echo -e "${YELLOW}  找到服务器进程: ${SERVER_PIDS}${NC}"
    for PID in $SERVER_PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}  正在停止进程 ${PID}...${NC}"
            kill $PID 2>/dev/null || true
            for i in {1..5}; do
                if ! kill -0 $PID 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}  强制停止进程 ${PID}...${NC}"
                kill -9 $PID 2>/dev/null || true
            fi
        fi
    done
    echo -e "${GREEN}  ✓ 服务器进程已停止${NC}"
fi

echo ""

echo -e "${BLUE}[2/2] 停止 Docker 环境服务...${NC}"
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi
cd "$SERVER_DIR"
export COMPOSE_PROJECT_NAME=whatschat
if [ "$REMOVE_VOLUMES" == "true" ]; then
    $COMPOSE_CMD -f docker-compose.yml down -v
else
    $COMPOSE_CMD -f docker-compose.yml down
fi
cd "$ROOT_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 重新启动: ${BLUE}pnpm start${NC}"
if [ "$REMOVE_VOLUMES" == "false" ]; then
    echo -e "  - 删除数据卷并停止: ${BLUE}pnpm run stop -- --remove-volumes${NC}"
fi
echo ""
