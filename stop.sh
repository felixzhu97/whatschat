#!/bin/bash

# WhatsChat 一键停止脚本
# 停止服务器进程和 Docker 环境服务
# 用法: ./stop.sh [dev|prod] [--remove-volumes]

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
    # 如果第一个参数是 --remove-volumes，则环境参数从第二个参数获取
    if [[ "$1" == "--remove-volumes" ]]; then
        ENV=${2:-dev}
    fi
fi

# 验证环境参数
if [[ "$ENV" != "dev" && "$ENV" != "prod" && "$ENV" != "--remove-volumes" ]]; then
    if [[ "$ENV" != "--remove-volumes" ]]; then
        echo -e "${RED}错误: 无效的环境参数 '${ENV}'${NC}"
        echo "用法: $0 [dev|prod] [--remove-volumes]"
        exit 1
    fi
fi

# 获取脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/apps/server"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  WhatsChat 一键停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}环境: ${ENV}${NC}"
if [ "$REMOVE_VOLUMES" == "true" ]; then
    echo -e "${RED}警告: 将删除所有数据卷（包括数据库数据）！${NC}"
fi
echo ""

# 1. 停止服务器进程
echo -e "${BLUE}[1/2] 停止服务器进程...${NC}"

# 查找运行中的服务器进程
# 查找包含 "nest start" 或 "node dist/main.js" 的进程
SERVER_PIDS=$(ps aux | grep -E "(nest start|node.*dist/main.js|pnpm.*dev)" | grep -v grep | awk '{print $2}' || true)

if [ -z "$SERVER_PIDS" ]; then
    echo -e "${YELLOW}  ✓ 未找到运行中的服务器进程${NC}"
else
    echo -e "${YELLOW}  找到服务器进程: ${SERVER_PIDS}${NC}"
    for PID in $SERVER_PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}  正在停止进程 ${PID}...${NC}"
            kill $PID 2>/dev/null || true
            # 等待进程结束，最多等待 5 秒
            for i in {1..5}; do
                if ! kill -0 $PID 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            # 如果进程还在运行，强制杀死
            if kill -0 $PID 2>/dev/null; then
                echo -e "${YELLOW}  强制停止进程 ${PID}...${NC}"
                kill -9 $PID 2>/dev/null || true
            fi
        fi
    done
    echo -e "${GREEN}  ✓ 服务器进程已停止${NC}"
fi

echo ""

# 2. 停止 Docker 环境
echo -e "${BLUE}[2/2] 停止 Docker 环境服务...${NC}"
cd "$SERVER_DIR"

if [ ! -f "docker-stop.sh" ]; then
    echo -e "${RED}错误: docker-stop.sh 不存在${NC}"
    exit 1
fi

# 调用 docker-stop.sh
if [ "$REMOVE_VOLUMES" == "true" ]; then
    bash docker-stop.sh "$ENV" --remove-volumes
else
    bash docker-stop.sh "$ENV"
fi

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 重新启动: ${BLUE}./start.sh ${ENV}${NC}"
if [ "$REMOVE_VOLUMES" == "false" ]; then
    echo -e "  - 删除数据卷并停止: ${BLUE}./stop.sh ${ENV} --remove-volumes${NC}"
fi
echo ""

