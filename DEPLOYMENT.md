# Axiarz Website 部署教程

本文档提供使用 Docker 和 Docker Compose 部署 Axiarz Website 的完整指南。

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [环境变量配置](#环境变量配置)
- [常用命令](#常用命令)
- [故障排查](#故障排查)
- [生产环境部署](#生产环境部署)

## 前置要求

### 必需软件

1. **Docker** (版本 20.10+)
   - Windows/macOS: 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: 按照 [Docker 官方文档](https://docs.docker.com/engine/install/) 安装

2. **Docker Compose** (版本 2.0+)
   - Docker Desktop 已包含 Docker Compose
   - Linux 需要单独安装: `sudo apt-get install docker-compose-plugin` 或 `pip install docker-compose`

### 系统要求

- **内存**: 至少 2GB RAM（推荐 4GB+）
- **磁盘空间**: 至少 5GB 可用空间
- **端口**: 3000（应用）、5432（PostgreSQL，可选暴露）

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd axiarz-website
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

编辑 `.env` 文件，修改以下关键配置：

```env
# 数据库配置（Docker Compose 会自动创建）
POSTGRES_USER=axiarz_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=axiarz_db
POSTGRES_PORT=5432

# JWT 密钥（生产环境必须修改为强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 管理员初始账号
ADMIN_EMAIL=admin@axiarz.com
ADMIN_PASSWORD=admin123456
ADMIN_NAME=Super Admin

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_PORT=3000
```

### 3. 使用部署脚本启动（推荐）

#### Linux/macOS

```bash
# 赋予执行权限
chmod +x deploy.sh

# 启动服务
./deploy.sh start

# 或者直接使用 docker-compose
docker-compose up -d
```

#### Windows PowerShell

```powershell
# 启动服务
.\deploy.ps1 start

# 或者直接使用 docker-compose
docker-compose up -d
```

### 4. 访问应用

- **前台**: http://localhost:3000
- **后台管理**: http://localhost:3000/admin/login
  - 默认账号: `admin@axiarz.com`
  - 默认密码: `admin123456`

## 详细步骤

### 方式一：使用 Docker Compose（推荐）

#### 1. 构建并启动所有服务

```bash
docker-compose up -d
```

此命令会：
- 拉取 PostgreSQL 16.1 镜像
- 构建 Next.js 应用镜像
- 创建并启动两个容器（postgres 和 app）
- 自动运行数据库迁移
- 初始化数据库（如果首次运行）

#### 2. 查看服务状态

```bash
docker-compose ps
```

#### 3. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 只查看应用日志
docker-compose logs -f app

# 只查看数据库日志
docker-compose logs -f postgres
```

#### 4. 停止服务

```bash
docker-compose down
```

#### 5. 重启服务

```bash
docker-compose restart
```

### 方式二：手动 Docker 命令

#### 1. 构建应用镜像

```bash
docker build -t axiarz-app .
```

#### 2. 启动 PostgreSQL 容器

```bash
docker run -d \
  --name axiarz-postgres \
  -e POSTGRES_USER=axiarz_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=axiarz_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16.1-alpine
```

#### 3. 启动应用容器

```bash
docker run -d \
  --name axiarz-app \
  --link axiarz-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://axiarz_user:your_password@postgres:5432/axiarz_db?schema=public" \
  -e JWT_SECRET="your-secret-key" \
  -e ADMIN_EMAIL="admin@axiarz.com" \
  -e ADMIN_PASSWORD="admin123456" \
  -v $(pwd)/public/uploads:/app/public/uploads \
  axiarz-app
```

## 环境变量配置

### 必需环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@postgres:5432/db?schema=public` |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须修改） | `your-super-secret-key` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@axiarz.com` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123456` |
| `ADMIN_NAME` | 管理员名称 | `Super Admin` |
| `NEXT_PUBLIC_APP_URL` | 应用公开 URL | `http://localhost:3000` |

### Docker Compose 环境变量

在 `docker-compose.yml` 中可以通过环境变量覆盖默认配置：

```yaml
environment:
  - POSTGRES_USER=${POSTGRES_USER:-axiarz_user}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-axiarz_password}
  - POSTGRES_DB=${POSTGRES_DB:-axiarz_db}
  - POSTGRES_PORT=${POSTGRES_PORT:-5432}
  - APP_PORT=${APP_PORT:-3000}
```

## 常用命令

### 使用部署脚本

#### Linux/macOS

```bash
./deploy.sh start      # 启动服务
./deploy.sh stop       # 停止服务
./deploy.sh restart    # 重启服务
./deploy.sh logs       # 查看日志
./deploy.sh build      # 重新构建镜像
```

#### Windows PowerShell

```powershell
.\deploy.ps1 start      # 启动服务
.\deploy.ps1 stop       # 停止服务
.\deploy.ps1 restart    # 重启服务
.\deploy.ps1 logs       # 查看日志
.\deploy.ps1 build      # 重新构建镜像
```

### 直接使用 Docker Compose

```bash
# 启动服务（后台运行）
docker-compose up -d

# 启动服务（前台运行，查看日志）
docker-compose up

# 停止服务
docker-compose down

# 停止服务并删除数据卷（⚠️ 会删除数据库数据）
docker-compose down -v

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart app

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh
docker-compose exec postgres psql -U axiarz_user -d axiarz_db

# 重新构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看资源使用情况
docker stats
```

### 数据库操作

```bash
# 进入数据库容器
docker-compose exec postgres psql -U axiarz_user -d axiarz_db

# 运行数据库迁移
docker-compose exec app npx prisma migrate deploy

# 运行数据库种子
docker-compose exec app npm run db:seed

# 备份数据库
docker-compose exec postgres pg_dump -U axiarz_user axiarz_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U axiarz_user axiarz_db < backup.sql
```

## 故障排查

### 1. 容器无法启动

**问题**: 容器启动后立即退出

**解决方案**:
```bash
# 查看容器日志
docker-compose logs app

# 检查环境变量是否正确
docker-compose config

# 检查端口是否被占用
netstat -an | grep 3000  # Linux/macOS
netstat -an | findstr 3000  # Windows
```

### 2. 数据库连接失败

**问题**: 应用无法连接到数据库

**解决方案**:
```bash
# 检查数据库容器是否运行
docker-compose ps postgres

# 检查数据库健康状态
docker-compose exec postgres pg_isready -U axiarz_user

# 检查 DATABASE_URL 环境变量
docker-compose exec app env | grep DATABASE_URL

# 等待数据库完全启动（首次启动可能需要时间）
docker-compose logs -f postgres
```

### 3. 端口冲突

**问题**: 端口 3000 或 5432 已被占用

**解决方案**:
- 修改 `docker-compose.yml` 中的端口映射
- 或停止占用端口的服务

```yaml
ports:
  - "3001:3000"  # 将外部端口改为 3001
```

### 4. 权限问题

**问题**: 文件上传目录权限不足

**解决方案**:
```bash
# Linux/macOS
chmod -R 755 public/uploads

# 或在 docker-compose.yml 中设置
volumes:
  - ./public/uploads:/app/public/uploads
```

### 5. 镜像构建失败

**问题**: `docker-compose build` 失败

**解决方案**:
```bash
# 清理构建缓存
docker system prune -a

# 重新构建（不使用缓存）
docker-compose build --no-cache
```

### 6. 数据库迁移失败

**问题**: Prisma 迁移执行失败

**解决方案**:
```bash
# 手动运行迁移
docker-compose exec app npx prisma migrate deploy

# 重置数据库（⚠️ 会删除所有数据）
docker-compose exec app npx prisma migrate reset
```

## 生产环境部署

### 1. 安全配置

#### 修改默认密码和密钥

```env
# 使用强密码
POSTGRES_PASSWORD=your_very_strong_password_here
ADMIN_PASSWORD=your_strong_admin_password

# 使用强 JWT 密钥（至少 32 字符）
JWT_SECRET=your-very-long-and-random-secret-key-at-least-32-characters

# 使用 HTTPS
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 限制数据库端口暴露

在生产环境中，建议不暴露 PostgreSQL 端口：

```yaml
# docker-compose.yml
postgres:
  ports:
    # - "5432:5432"  # 注释掉，只在内部网络访问
```

### 2. 使用反向代理（Nginx）

创建 `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 使用 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com
```

### 4. 数据备份

#### 自动备份脚本

创建 `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U axiarz_user axiarz_db > "$BACKUP_DIR/backup_$DATE.sql"
# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

添加到 crontab:

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

### 5. 监控和日志

#### 使用 Docker 日志驱动

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 使用健康检查

```yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 6. 性能优化

#### 增加资源限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

#### 使用多阶段构建优化镜像大小

Dockerfile 已使用多阶段构建，确保 `.dockerignore` 文件正确配置。

### 7. 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 运行数据库迁移（如果需要）
docker-compose exec app npx prisma migrate deploy
```

## 常见问题

### Q: 如何重置管理员密码？

A: 进入数据库容器，直接更新密码哈希：

```bash
docker-compose exec postgres psql -U axiarz_user -d axiarz_db
# 在 psql 中执行（需要先获取 bcrypt 哈希）
UPDATE admins SET password = '$2a$10$...' WHERE email = 'admin@axiarz.com';
```

或重新运行种子脚本：

```bash
docker-compose exec app npm run db:seed
```

### Q: 如何查看数据库数据？

A: 使用数据库管理工具（如 pgAdmin、DBeaver）连接到 `localhost:5432`，或使用命令行：

```bash
docker-compose exec postgres psql -U axiarz_user -d axiarz_db
```

### Q: 文件上传后在哪里？

A: 文件保存在 `public/uploads` 目录，在容器内路径为 `/app/public/uploads`。

### Q: 如何扩展存储？

A: 使用 Docker 卷或挂载外部存储：

```yaml
volumes:
  - /path/to/external/storage:/app/public/uploads
```

## 技术支持

如遇到问题，请：

1. 查看容器日志: `docker-compose logs -f`
2. 检查环境变量配置
3. 查看本文档的故障排查部分
4. 提交 Issue 到项目仓库

## 许可证

MIT





