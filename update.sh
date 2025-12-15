#!/bin/bash

# 容器更新脚本
# 用于在 Linux 服务器上更新 Docker 容器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Docker 容器更新脚本${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查 docker-compose 是否存在
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ 错误: 未找到 docker-compose.yml 文件${NC}"
    exit 1
fi

# 1. 拉取最新镜像
echo -e "${YELLOW}步骤 1/4: 拉取最新镜像...${NC}"
docker-compose pull
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 拉取镜像失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 镜像拉取成功${NC}"
echo ""

# 2. 备份当前容器状态（可选）
echo -e "${YELLOW}步骤 2/4: 备份配置...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
if [ -d "public/uploads" ]; then
    echo -e "${YELLOW}备份上传文件...${NC}"
    cp -r public/uploads "$BACKUP_DIR/" 2>/dev/null || true
fi
echo -e "${GREEN}✓ 配置备份完成（保存在 $BACKUP_DIR）${NC}"
echo ""

# 3. 停止并删除旧容器
echo -e "${YELLOW}步骤 3/4: 停止旧容器...${NC}"
docker-compose down
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 停止容器失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 旧容器已停止${NC}"
echo ""

# 4. 启动新容器
echo -e "${YELLOW}步骤 4/4: 启动新容器...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 启动容器失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 新容器已启动${NC}"
echo ""

# 5. 等待容器启动
echo -e "${YELLOW}等待容器启动...${NC}"
sleep 5

# 6. 检查容器状态
echo -e "${YELLOW}检查容器状态...${NC}"
docker-compose ps

# 7. 显示日志
echo ""
echo -e "${CYAN}最近的应用日志:${NC}"
docker-compose logs --tail=20 app

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 更新完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}使用以下命令查看日志:${NC}"
echo -e "  docker-compose logs -f app"
echo ""
echo -e "${CYAN}如果遇到问题，可以回滚到备份:${NC}"
echo -e "  cp -r $BACKUP_DIR/uploads/* public/uploads/"
echo ""
