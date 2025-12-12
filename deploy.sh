#!/bin/bash

# Axiarz Website 部署脚本 (Linux/macOS)
# 使用方法: ./deploy.sh [start|stop|restart|logs|build]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 和 Docker Compose
check_dependencies() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未安装 Docker，请先安装 Docker${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}错误: 未安装 Docker Compose，请先安装 Docker Compose${NC}"
        exit 1
    fi
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}警告: .env 文件不存在，正在从 .env.example 创建...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}已创建 .env 文件，请编辑后重新运行部署脚本${NC}"
            exit 1
        else
            echo -e "${RED}错误: .env.example 文件不存在${NC}"
            exit 1
        fi
    fi
}

# 创建必要的目录
create_directories() {
    echo -e "${YELLOW}创建必要的目录...${NC}"
    mkdir -p public/uploads
    chmod 755 public/uploads
}

# 启动服务
start_services() {
    echo -e "${GREEN}启动服务...${NC}"
    docker-compose up -d || docker compose up -d
    echo -e "${GREEN}服务已启动！${NC}"
    echo -e "${YELLOW}等待数据库初始化...${NC}"
    sleep 5
    echo -e "${GREEN}应用地址: http://localhost:3000${NC}"
    echo -e "${GREEN}后台管理: http://localhost:3000/admin/login${NC}"
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}停止服务...${NC}"
    docker-compose down || docker compose down
    echo -e "${GREEN}服务已停止${NC}"
}

# 重启服务
restart_services() {
    echo -e "${YELLOW}重启服务...${NC}"
    docker-compose restart || docker compose restart
    echo -e "${GREEN}服务已重启${NC}"
}

# 查看日志
view_logs() {
    echo -e "${YELLOW}查看服务日志...${NC}"
    docker-compose logs -f || docker compose logs -f
}

# 构建镜像
build_images() {
    echo -e "${YELLOW}构建 Docker 镜像...${NC}"
    docker-compose build --no-cache || docker compose build --no-cache
    echo -e "${GREEN}镜像构建完成${NC}"
}

# 主函数
main() {
    check_dependencies
    check_env_file
    create_directories

    case "${1:-start}" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs
            ;;
        build)
            build_images
            ;;
        *)
            echo -e "${RED}用法: $0 [start|stop|restart|logs|build]${NC}"
            echo -e "${YELLOW}  start   - 启动服务（默认）${NC}"
            echo -e "${YELLOW}  stop    - 停止服务${NC}"
            echo -e "${YELLOW}  restart - 重启服务${NC}"
            echo -e "${YELLOW}  logs    - 查看日志${NC}"
            echo -e "${YELLOW}  build   - 构建镜像${NC}"
            exit 1
            ;;
    esac
}

main "$@"





