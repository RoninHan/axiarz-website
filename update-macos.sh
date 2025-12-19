#!/bin/bash

# macOS 本地开发更新脚本
# 用于在 macOS 上更新和重启应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}macOS 应用更新脚本${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ 错误: 未找到 package.json 文件${NC}"
    echo -e "${YELLOW}请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 1. 停止当前运行的开发服务器
echo -e "${YELLOW}步骤 1/5: 停止开发服务器...${NC}"
# 查找并杀死 next dev 进程
pkill -f "next dev" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ 开发服务器已停止${NC}"
echo ""

# 2. 拉取最新代码
echo -e "${YELLOW}步骤 2/5: 拉取最新代码...${NC}"
git pull
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 拉取代码失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 代码更新成功${NC}"
echo ""

# 3. 安装依赖
echo -e "${YELLOW}步骤 3/5: 安装/更新依赖...${NC}"
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 安装依赖失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 依赖安装成功${NC}"
echo ""

# 4. 数据库迁移
echo -e "${YELLOW}步骤 4/5: 运行数据库迁移...${NC}"
if command -v yarn &> /dev/null; then
    yarn db:push
else
    npm run db:push
fi
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 数据库迁移失败${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 数据库迁移成功${NC}"
echo ""

# 5. 启动开发服务器
echo -e "${YELLOW}步骤 5/5: 启动开发服务器...${NC}"
echo -e "${CYAN}开发服务器将在后台启动...${NC}"
echo ""

if command -v yarn &> /dev/null; then
    nohup yarn dev > dev.log 2>&1 &
else
    nohup npm run dev > dev.log 2>&1 &
fi

sleep 3

# 检查进程是否启动
if pgrep -f "next dev" > /dev/null; then
    echo -e "${GREEN}✓ 开发服务器已启动${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 更新完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}应用地址: http://localhost:3000${NC}"
    echo -e "${CYAN}查看日志: tail -f dev.log${NC}"
    echo -e "${CYAN}停止服务: pkill -f 'next dev'${NC}"
    echo ""
else
    echo -e "${RED}✗ 开发服务器启动失败${NC}"
    echo -e "${YELLOW}请手动启动: yarn dev 或 npm run dev${NC}"
    exit 1
fi
