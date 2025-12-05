#!/bin/bash

# WhatsChat 环境服务 Docker 停止脚本
# 用法: ./docker-stop.sh [dev|prod] [--remove-volumes]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取环境参数，默认为 dev
ENV=${1:-dev}
REMOVE_VOLUMES=false

# 检查是否要删除数据卷
if [[ "$1" == "--remove-volumes" ]] || [[ "$2" == "--remove-volumes" ]]; then
    REMOVE_VOLUMES=true
fi

# 验证环境参数
if [[ "$ENV" != "dev" && "$ENV" != "prod" && "$ENV" != "--remove-volumes" ]]; then
    if [[ "$ENV" != "--remove-volumes" ]]; then
        echo -e "${RED}错误: 无效的环境参数 '${ENV}'${NC}"
        echo "用法: $0 [dev|prod] [--remove-volumes]"
        exit 1
    fi
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 环境服务 Docker 停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
if [ "$REMOVE_VOLUMES" == "true" ]; then
    echo -e "${RED}警告: 将删除所有数据卷（包括数据库数据）！${NC}"
fi
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}错误: Docker 未运行${NC}"
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

# 停止服务
echo -e "${BLUE}停止服务...${NC}"
if [ "$ENV" == "dev" ]; then
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml down
else
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down
fi

# 如果指定了删除数据卷
if [ "$REMOVE_VOLUMES" == "true" ]; then
    echo -e "${YELLOW}删除数据卷...${NC}"
    if [ "$ENV" == "dev" ]; then
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml down -v
    else
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml down -v
    fi
    echo -e "${RED}所有数据卷已删除${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 显示剩余容器
echo -e "${BLUE}剩余容器:${NC}"
docker ps -a --filter "name=whatschat" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 重新启动: ${BLUE}./docker-start.sh ${ENV}${NC}"
if [ "$REMOVE_VOLUMES" == "false" ]; then
    echo -e "  - 删除数据卷: ${BLUE}./docker-stop.sh ${ENV} --remove-volumes${NC}"
fi
echo ""

