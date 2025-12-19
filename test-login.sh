#!/bin/bash

# 测试管理员登录

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}测试管理员登录${NC}"
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

ADMIN_EMAIL=${ADMIN_EMAIL:-admin@axiarz.com}

echo -e "${YELLOW}1. 查询数据库中的管理员信息...${NC}"
$COMPOSE_CMD exec postgres psql -U ${POSTGRES_USER:-axiarz_user} -d ${POSTGRES_DB:-axiarz_db} -c "SELECT id, email, name, status, role, LEFT(password, 20) as password_hash FROM admins WHERE email = '${ADMIN_EMAIL}';"

echo ""
echo -e "${YELLOW}2. 测试登录 API...${NC}"
echo -e "${CYAN}正在调用登录接口...${NC}"

APP_PORT=${APP_PORT:-3000}

RESPONSE=$(curl -s -X POST http://localhost:${APP_PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"admin123456\",\"type\":\"admin\"}")

echo -e "${CYAN}API 响应:${NC}"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✓ 登录成功！${NC}"
else
    echo -e "${RED}✗ 登录失败${NC}"
    echo ""
    echo -e "${YELLOW}尝试重新设置密码...${NC}"
    
    # 使用容器内的 bcryptjs 生成新的密码哈希
    echo -e "${CYAN}正在生成新的密码哈希...${NC}"
    
    # 尝试多种方式加载 bcryptjs
    NEW_HASH=$($COMPOSE_CMD exec app node -e "
      try {
        const bcrypt = require('./node_modules/bcryptjs');
        const hash = bcrypt.hashSync('admin123456', 10);
        console.log(hash);
      } catch (e1) {
        try {
          const bcrypt = require('bcryptjs');
          const hash = bcrypt.hashSync('admin123456', 10);
          console.log(hash);
        } catch (e2) {
          console.error('ERROR: Cannot load bcryptjs');
          process.exit(1);
        }
      }
    " 2>&1 | grep -v "WARN" | tail -1 | tr -d '\r\n')
    
    if [ -z "$NEW_HASH" ] || echo "$NEW_HASH" | grep -q "ERROR"; then
        echo -e "${RED}✗ 无法生成密码哈希，容器内缺少 bcryptjs${NC}"
        echo -e "${YELLOW}正在使用预生成的哈希值...${NC}"
        # 这是 admin123456 的标准 bcrypt hash (使用在线工具生成)
        NEW_HASH='$2b$10$YQ98PzeoYRDVmvr3cKHAYO7R3cUBCvbBLzNNJXpJOLLdhYy1PkWRm'
    fi
    
    echo -e "${GREEN}新密码哈希: ${NEW_HASH}${NC}"
    
    # 更新数据库
    $COMPOSE_CMD exec postgres psql -U ${POSTGRES_USER:-axiarz_user} -d ${POSTGRES_DB:-axiarz_db} -c "
    UPDATE admins 
    SET password = '${NEW_HASH}', 
        status = 'active',
        \"updatedAt\" = NOW()
    WHERE email = '${ADMIN_EMAIL}';
    "
    
    echo ""
    echo -e "${YELLOW}3. 再次测试登录...${NC}"
    sleep 2
    
    RESPONSE2=$(curl -s -X POST http://localhost:${APP_PORT}/api/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"admin123456\",\"type\":\"admin\"}")
    
    echo -e "${CYAN}API 响应:${NC}"
    echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
    
    if echo "$RESPONSE2" | grep -q "success.*true"; then
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✓ 密码已修复，登录成功！${NC}"
        echo -e "${GREEN}========================================${NC}"
    else
        echo ""
        echo -e "${RED}✗ 仍然无法登录${NC}"
        echo -e "${YELLOW}请检查应用日志: docker compose logs app${NC}"
    fi
fi

echo ""
