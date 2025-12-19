#!/bin/bash

# 检查并修复管理员账号脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}检查管理员账号${NC}"
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

# 获取环境变量
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@axiarz.com}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123456}

echo -e "${YELLOW}1. 运行数据库迁移...${NC}"
$COMPOSE_CMD exec app node node_modules/prisma/build/index.js migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库迁移成功${NC}"
else
    echo -e "${RED}✗ 数据库迁移失败${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}2. 生成 Prisma Client...${NC}"
$COMPOSE_CMD exec app node node_modules/prisma/build/index.js generate
echo -e "${GREEN}✓ Prisma Client 生成成功${NC}"
echo ""

echo -e "${CYAN}正在检查数据库中的管理员账号...${NC}"
echo ""

# 检查管理员是否存在
echo -e "${YELLOW}3. 检查管理员账号是否存在...${NC}"
$COMPOSE_CMD exec postgres psql -U ${POSTGRES_USER:-axiarz_user} -d ${POSTGRES_DB:-axiarz_db} -c "SELECT id, email, name, status, role FROM admins WHERE email = '${ADMIN_EMAIL}';" 2>/dev/null || echo "管理员表已创建，但可能还没有数据"

echo ""
echo -e "${YELLOW}4. 创建/更新管理员账号${NC}"
echo -e "${CYAN}管理员邮箱: ${ADMIN_EMAIL}${NC}"
echo -e "${CYAN}管理员密码: ${ADMIN_PASSWORD}${NC}"
echo ""
read -p "是否继续创建/更新管理员账号? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 使用 SQL 直接创建管理员（密码: admin123456 的 bcrypt hash）
echo -e "${YELLOW}正在创建/更新管理员账号...${NC}"

# bcrypt hash for "admin123456" with salt rounds 10
HASHED_PASSWORD='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

$COMPOSE_CMD exec postgres psql -U ${POSTGRES_USER:-axiarz_user} -d ${POSTGRES_DB:-axiarz_db} -c "
INSERT INTO admins (id, email, name, password, role, status, \"createdAt\", \"updatedAt\")
VALUES (
  gen_random_uuid(),
  '${ADMIN_EMAIL}',
  'Super Admin',
  '${HASHED_PASSWORD}',
  'super_admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  password = '${HASHED_PASSWORD}',
  status = 'active',
  role = 'super_admin',
  \"updatedAt\" = NOW();
"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 管理员账号已就绪！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}登录信息:${NC}"
    echo -e "  邮箱: ${GREEN}${ADMIN_EMAIL}${NC}"
    echo -e "  密码: ${GREEN}${ADMIN_PASSWORD}${NC}"
    echo -e "  状态: ${GREEN}active${NC}"
    echo ""
    echo -e "${CYAN}请使用上述信息登录管理后台${NC}"
    echo ""
else
    echo -e "${RED}✗ 创建管理员账号失败${NC}"
    exit 1
fi
