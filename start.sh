#!/bin/bash

# WhatsChat 一键启动脚本
# 启动 Docker 环境（PostgreSQL 和 Redis）、运行数据库迁移、启动服务器
# 用法: ./start.sh [dev|prod]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取环境参数，默认为 dev
ENV=${1:-dev}

# 验证环境参数
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    echo -e "${RED}错误: 无效的环境参数 '${ENV}'${NC}"
    echo "用法: $0 [dev|prod]"
    exit 1
fi

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/apps/server"

# 服务器进程 PID
SERVER_PID=""

# 清理函数
cleanup() {
    if [ -n "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}正在停止服务器进程...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}清理完成${NC}"
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 一键启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
echo ""

# 1. 环境检查
echo -e "${BLUE}[1/5] 检查环境依赖...${NC}"

# 检查 Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Docker 已运行${NC}"

# 检查 docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: docker-compose 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ docker-compose 已安装${NC}"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: pnpm 未安装${NC}"
    echo -e "${YELLOW}提示: 请运行 npm install -g pnpm${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ pnpm 已安装${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}  ✓ Node.js 已安装 (${NODE_VERSION})${NC}"

# 检查服务器目录
if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}错误: 服务器目录不存在: ${SERVER_DIR}${NC}"
    exit 1
fi

echo ""

# 2. 启动 Docker 环境
echo -e "${BLUE}[2/5] 启动 Docker 环境服务...${NC}"
cd "$SERVER_DIR"
if [ ! -f "docker-start.sh" ]; then
    echo -e "${RED}错误: docker-start.sh 不存在${NC}"
    exit 1
fi

# 调用 docker-start.sh，但不显示其输出（避免重复信息）
bash docker-start.sh "$ENV" > /dev/null 2>&1 || {
    echo -e "${RED}错误: Docker 环境启动失败${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Docker 环境服务已启动${NC}"
cd "$SCRIPT_DIR"

echo ""

# 3. 等待数据库就绪
echo -e "${BLUE}[3/5] 等待数据库就绪...${NC}"

# 检查 PostgreSQL 是否可用
MAX_RETRIES=30
RETRY_COUNT=0
DB_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # 尝试连接 PostgreSQL
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

# 4. 运行数据库迁移
echo -e "${BLUE}[4/5] 运行数据库迁移...${NC}"

# 检查服务器目录的 .env 文件
if [ ! -f "$SERVER_DIR/.env" ]; then
    echo -e "${YELLOW}  警告: .env 文件不存在，将使用默认配置${NC}"
    if [ -f "$SERVER_DIR/env.example" ]; then
        echo -e "${YELLOW}  提示: 可以复制 env.example 为 .env 并配置${NC}"
    fi
fi

# 从根目录运行迁移（使用 pnpm workspace filter）
cd "$SCRIPT_DIR"
if pnpm --filter whatschat-server migrate > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ 数据库迁移完成${NC}"
else
    echo -e "${YELLOW}  警告: 数据库迁移可能失败，请检查日志${NC}"
    echo -e "${YELLOW}  提示: 可以手动运行 pnpm --filter whatschat-server migrate${NC}"
fi
echo ""

# 5. 启动服务器
echo -e "${BLUE}[5/5] 启动服务器...${NC}"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  检测到未安装依赖，正在安装...${NC}"
    pnpm install
fi

# 启动服务器（后台运行）
echo -e "${GREEN}  正在启动服务器...${NC}"
echo -e "${YELLOW}  提示: 服务器将在后台运行，日志将显示在下方${NC}"
echo ""

# 从根目录启动服务器（使用 pnpm workspace filter）
cd "$SCRIPT_DIR"
pnpm --filter whatschat-server dev &
SERVER_PID=$!

# 等待一下确保进程启动
sleep 2

# 检查进程是否还在运行
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
echo -e "  - 停止服务: ${BLUE}./stop.sh ${ENV}${NC}"
echo ""

# 等待服务器进程（这样脚本会一直运行直到被中断）
wait $SERVER_PID

