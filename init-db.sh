#!/bin/bash

# Linux 服务器数据库初始化脚本
# 用于重新初始化管理员账号

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}数据库初始化脚本${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检测 docker-compose 命令
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}✗ 未找到 docker-compose 命令${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 1/3: 检查容器状态...${NC}"
if ! $COMPOSE_CMD ps | grep -q "axiarz-app.*Up"; then
    echo -e "${RED}✗ 应用容器未运行${NC}"
    echo -e "${YELLOW}请先启动应用: $COMPOSE_CMD up -d${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 容器运行正常${NC}"
echo ""

echo -e "${YELLOW}步骤 2/4: 运行数据库迁移...${NC}"
$COMPOSE_CMD exec app node node_modules/prisma/build/index.js migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 数据库迁移失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库迁移成功${NC}"
echo ""

echo -e "${YELLOW}步骤 3/4: 生成 Prisma Client...${NC}"
$COMPOSE_CMD exec app node node_modules/prisma/build/index.js generate
echo -e "${GREEN}✓ Prisma Client 生成成功${NC}"
echo ""

echo -e "${YELLOW}步骤 4/4: 创建管理员账号...${NC}"
echo -e "${CYAN}通过 API 初始化数据库...${NC}"

# 获取应用端口
APP_PORT=${APP_PORT:-3000}

# 等待应用启动
sleep 3

# 调用初始化 API
RESPONSE=$(curl -s -X POST http://localhost:${APP_PORT}/api/init)

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ 管理员账号创建成功${NC}"
else
    echo -e "${YELLOW}⚠️  API 响应: $RESPONSE${NC}"
    echo -e "${YELLOW}提示: 管理员账号可能已存在${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 数据库初始化完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}管理员信息:${NC}"
echo -e "  邮箱: ${GREEN}\${ADMIN_EMAIL:-admin@axiarz.com}${NC}"
echo -e "  密码: ${GREEN}\${ADMIN_PASSWORD:-admin123456}${NC}"
echo ""
echo -e "${YELLOW}注意: 如果使用了自定义环境变量，请使用 .env 文件中设置的值${NC}"
echo ""
