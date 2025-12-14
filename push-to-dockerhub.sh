#!/bin/bash

# Docker Hub 推送脚本 (Bash) - 支持多架构 (ARM64/AMD64)
# 使用方法: ./push-to-dockerhub.sh YOUR_USERNAME [VERSION] [--single-arch]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 参数解析
SINGLE_ARCH=false
if [[ "$*" == *"--single-arch"* ]]; then
    SINGLE_ARCH=true
    # 移除 --single-arch 参数
    set -- "${@/--single-arch/}"
fi

# 参数检查
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供 Docker Hub 用户名${NC}"
    echo "使用方法: $0 YOUR_USERNAME [VERSION] [--single-arch]"
    echo "示例: $0 myusername v1.0.0"
    echo "      $0 myusername latest --single-arch"
    exit 1
fi

DOCKERHUB_USERNAME=$1
VERSION=${2:-latest}
IMAGE_NAME="axiarz-website"
FULL_IMAGE_NAME="${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}Docker Hub 镜像推送脚本 (多架构支持)${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查 Docker 是否安装
echo -e "${YELLOW}检查 Docker 安装...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker 未安装或未在 PATH 中${NC}"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ Docker 已安装: $DOCKER_VERSION${NC}"

# 检查是否已登录
echo -e "${YELLOW}检查 Docker Hub 登录状态...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}需要登录 Docker Hub...${NC}"
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Docker Hub 登录失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 已登录 Docker Hub${NC}"
fi

if [ "$SINGLE_ARCH" = true ]; then
    # 单架构构建（当前平台）
    echo ""
    echo -e "${YELLOW}构建单架构镜像: $FULL_IMAGE_NAME${NC}"
    echo -e "${YELLOW}这可能需要几分钟时间...${NC}"
    docker build -t "$FULL_IMAGE_NAME" .

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ 镜像构建失败${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 镜像构建成功${NC}"

    # 推送镜像
    echo ""
    echo -e "${YELLOW}推送镜像到 Docker Hub...${NC}"
    docker push "$FULL_IMAGE_NAME"

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ 镜像推送失败${NC}"
        exit 1
    fi
else
    # 多架构构建 (ARM64 + AMD64)
    echo ""
    echo -e "${YELLOW}设置 Docker Buildx...${NC}"
    
    # 检查 buildx 是否可用
    if ! docker buildx version &> /dev/null; then
        echo -e "${RED}✗ Docker Buildx 不可用，请更新 Docker 到最新版本${NC}"
        echo -e "${YELLOW}  或者使用 --single-arch 参数进行单架构构建${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker Buildx 可用${NC}"

    # 创建并使用多架构 builder
    BUILDER_NAME="axiarz-multiarch"
    echo -e "${YELLOW}创建多架构 builder...${NC}"
    
    if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
        docker buildx create --name "$BUILDER_NAME" --use --bootstrap
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ 创建 builder 失败${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ 已创建 builder: $BUILDER_NAME${NC}"
    else
        docker buildx use "$BUILDER_NAME"
        echo -e "${GREEN}✓ 使用现有 builder: $BUILDER_NAME${NC}"
    fi

    # 构建并推送多架构镜像
    echo ""
    echo -e "${YELLOW}构建多架构镜像 (linux/amd64, linux/arm64): $FULL_IMAGE_NAME${NC}"
    echo -e "${YELLOW}这可能需要较长时间，请耐心等待...${NC}"
    echo ""
    
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --tag "$FULL_IMAGE_NAME" \
        --push \
        .

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ 多架构镜像构建/推送失败${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 多架构镜像构建并推送成功${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 完成！镜像已成功推送到 Docker Hub${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}镜像信息:${NC}"
echo -e "  名称: $FULL_IMAGE_NAME"
if [ "$SINGLE_ARCH" = false ]; then
    echo -e "  架构: linux/amd64, linux/arm64"
fi
echo -e "  URL: https://hub.docker.com/r/${DOCKERHUB_USERNAME}/${IMAGE_NAME}"
echo ""
echo -e "${CYAN}使用方法:${NC}"
echo -e "  docker pull $FULL_IMAGE_NAME"
echo ""
if [ "$SINGLE_ARCH" = false ]; then
    echo -e "${YELLOW}注意: Docker 会自动选择适合您平台的架构版本${NC}"
    echo ""
fi

