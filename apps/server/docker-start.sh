#!/bin/bash

# WhatsChat 环境服务 Docker 启动脚本
# 只启动 PostgreSQL 和 Redis 服务，不包含应用服务
# 用法: ./docker-start.sh [dev|prod]

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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 环境服务 Docker 启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
echo -e "${YELLOW}注意: 只启动 PostgreSQL 和 Redis 服务${NC}"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: docker-compose 未安装${NC}"
    exit 1
fi

# 使用 docker compose 或 docker-compose
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# 检查 .env 文件（可选，环境服务可以不需要）
if [ ! -f .env ]; then
    echo -e "${YELLOW}提示: .env 文件不存在，将使用默认配置${NC}"
    echo -e "${BLUE}如需自定义配置，请创建 .env 文件${NC}"
fi

# 启动环境服务
echo -e "${BLUE}启动环境服务（PostgreSQL 和 Redis）...${NC}"
if [ "$ENV" == "dev" ]; then
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis
else
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis
fi

# 等待服务就绪
echo -e "${BLUE}等待服务就绪...${NC}"
sleep 3

# 显示服务状态
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}服务状态:${NC}"
if [ "$ENV" == "dev" ]; then
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml ps
else
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml ps
fi

echo ""
echo -e "${GREEN}服务连接信息:${NC}"
echo -e "  - PostgreSQL: ${BLUE}postgresql://whatschat:whatschat123@localhost:5432/whatschat${NC}"
echo -e "  - Redis: ${BLUE}redis://localhost:6379${NC}"
echo ""
echo -e "${YELLOW}查看日志:${NC}"
if [ "$ENV" == "dev" ]; then
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml logs -f${NC}"
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres${NC}"
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml logs -f redis${NC}"
else
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml logs -f${NC}"
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml logs -f postgres${NC}"
    echo -e "  ${BLUE}$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml logs -f redis${NC}"
fi
echo ""
echo -e "${YELLOW}停止服务:${NC}"
echo -e "  ${BLUE}./docker-stop.sh ${ENV}${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 应用服务需要在本地运行，连接到这些环境服务${NC}"
echo -e "  - 数据库迁移需要在本地运行: ${BLUE}pnpm migrate${NC}"
echo ""

