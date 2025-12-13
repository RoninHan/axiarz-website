# Docker Hub 推送指南

本指南将帮助您将 Axiarz 应用的 Docker 镜像构建并推送到 Docker Hub。

## ✨ 多架构支持

本项目支持构建多架构 Docker 镜像，包括：
- **linux/amd64** - Intel/AMD 64位处理器
- **linux/arm64** - ARM 64位处理器（如 Apple Silicon M1/M2、AWS Graviton）

使用提供的脚本会自动构建并推送多架构镜像，Docker 会根据运行平台自动选择正确的架构版本。

## 前置要求

1. **Docker Hub 账号**：如果没有，请前往 [https://hub.docker.com](https://hub.docker.com) 注册
2. **Docker 已安装**：确保本地已安装 Docker Desktop 或 Docker Engine（推荐最新版本以支持 Buildx）
3. **已登录 Docker Hub**：在本地终端中登录 Docker Hub

## 步骤 1: 登录 Docker Hub

在终端中执行以下命令登录 Docker Hub：

```bash
docker login
```

输入您的 Docker Hub 用户名和密码。如果使用访问令牌（推荐），请使用令牌作为密码。

## 步骤 2: 构建 Docker 镜像

### 🚀 推荐方法：使用提供的脚本（支持多架构）

#### Windows PowerShell:
```powershell
# 多架构构建（默认，支持 ARM64 和 AMD64）
.\push-to-dockerhub.ps1 -Username YOUR_DOCKERHUB_USERNAME

# 单架构构建（仅当前平台）
.\push-to-dockerhub.ps1 -Username YOUR_DOCKERHUB_USERNAME -SingleArch
```

#### Linux/macOS:
```bash
# 多架构构建（默认，支持 ARM64 和 AMD64）
chmod +x push-to-dockerhub.sh
./push-to-dockerhub.sh YOUR_DOCKERHUB_USERNAME

# 单架构构建（仅当前平台）
./push-to-dockerhub.sh YOUR_DOCKERHUB_USERNAME latest --single-arch
```

脚本会自动：
- 检查 Docker 和 Buildx 安装
- 登录 Docker Hub（如需要）
- 创建多架构 builder
- 构建并推送多架构镜像

### 方法 1: 使用 Docker Buildx 手动构建多架构镜像

```bash
# 创建多架构 builder（首次使用）
docker buildx create --name axiarz-multiarch --use --bootstrap

# 构建并推送多架构镜像（ARM64 + AMD64）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag YOUR_DOCKERHUB_USERNAME/axiarz-website:latest \
  --push \
  .

# 或者指定版本标签
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag YOUR_DOCKERHUB_USERNAME/axiarz-website:v1.0.0 \
  --push \
  .
```

### 方法 2: 使用 Docker 命令构建单架构镜像

```bash
# 构建镜像（替换 YOUR_DOCKERHUB_USERNAME 为您的 Docker Hub 用户名）
docker build -t YOUR_DOCKERHUB_USERNAME/axiarz-website:latest .

# 或者指定版本标签
docker build -t YOUR_DOCKERHUB_USERNAME/axiarz-website:v1.0.0 .
```

### 方法 3: 使用 Docker Compose 构建

```bash
# 构建镜像
docker-compose build

# 或者使用新版本的 docker compose
docker compose build
```

构建完成后，需要手动标记镜像：

```bash
# 标记镜像（替换 YOUR_DOCKERHUB_USERNAME 为您的 Docker Hub 用户名）
docker tag axiarz-website_app:latest YOUR_DOCKERHUB_USERNAME/axiarz-website:latest
```

## 步骤 3: 验证镜像

在推送之前，可以验证镜像是否已正确构建：

```bash
# 查看本地镜像列表
docker images | grep axiarz

# 或者查看所有镜像
docker images
```

## 步骤 4: 推送镜像到 Docker Hub

```bash
# 推送 latest 标签
docker push YOUR_DOCKERHUB_USERNAME/axiarz-website:latest

# 推送特定版本标签
docker push YOUR_DOCKERHUB_USERNAME/axiarz-website:v1.0.0
```

## 步骤 5: 更新 docker-compose.yml 使用 Docker Hub 镜像

推送成功后，您可以更新 `docker-compose.yml` 文件，使其从 Docker Hub 拉取镜像而不是本地构建：

```yaml
services:
  app:
    # 将 build 部分替换为 image
    image: YOUR_DOCKERHUB_USERNAME/axiarz-website:latest
    # 注释掉或删除 build 部分
    # build:
    #   context: .
    #   dockerfile: Dockerfile
    container_name: axiarz-app
    # ... 其他配置保持不变
```

## 多架构构建说明

### 为什么需要多架构支持？

- **ARM64 设备**：Apple Silicon (M1/M2/M3)、AWS Graviton、树莓派等
- **AMD64 设备**：传统 Intel/AMD 服务器和 PC
- **自动选择**：Docker 会根据运行平台自动拉取正确的架构版本

### 使用 Docker Buildx

Docker Buildx 是构建多架构镜像的标准工具：

```bash
# 检查 Buildx 是否可用
docker buildx version

# 查看可用的 builder
docker buildx ls

# 创建新的多架构 builder
docker buildx create --name multiarch --use --bootstrap

# 查看支持的平台
docker buildx inspect --bootstrap
```

### 验证多架构镜像

推送后，可以在 Docker Hub 上查看镜像支持的架构，或使用以下命令：

```bash
# 查看镜像清单（需要安装 manifest-tool 或使用 docker buildx imagetools）
docker buildx imagetools inspect YOUR_DOCKERHUB_USERNAME/axiarz-website:latest
```

这将显示镜像支持的所有架构。

## 版本管理建议

建议使用语义化版本控制。对于多架构镜像，可以同时推送多个版本标签：

```bash
# 使用 Buildx 构建并推送多个版本标签（多架构）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag YOUR_DOCKERHUB_USERNAME/axiarz-website:1.0.0 \
  --tag YOUR_DOCKERHUB_USERNAME/axiarz-website:1.0 \
  --tag YOUR_DOCKERHUB_USERNAME/axiarz-website:latest \
  --push \
  .

# 或者使用脚本多次运行
./push-to-dockerhub.sh YOUR_USERNAME 1.0.0
./push-to-dockerhub.sh YOUR_USERNAME 1.0
./push-to-dockerhub.sh YOUR_USERNAME latest
```

## 从 Docker Hub 拉取并使用镜像

其他用户或服务器可以从 Docker Hub 拉取您的镜像：

```bash
# 拉取镜像
docker pull YOUR_DOCKERHUB_USERNAME/axiarz-website:latest

# 使用 docker-compose.yml 时，确保 image 字段指向正确的镜像
docker-compose pull
docker-compose up -d
```

## 自动化推送（CI/CD）

### GitHub Actions 示例（支持多架构）

创建 `.github/workflows/docker-push.yml`：

```yaml
name: Build and Push Docker Image (Multi-arch)

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: YOUR_DOCKERHUB_USERNAME/axiarz-website
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push (Multi-arch)
        uses: docker/build-push-action@v4
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

**关键点**：
- `platforms: linux/amd64,linux/arm64` 指定要构建的架构
- GitHub Actions 会自动使用 QEMU 模拟器来构建不同架构的镜像

## 注意事项

1. **多架构构建时间**：
   - 多架构构建需要更长时间（需要为每个架构分别构建）
   - 如果本地是 AMD64，构建 ARM64 需要模拟，会较慢
   - 建议在 CI/CD 中自动构建多架构镜像

2. **镜像大小**：
   - 使用多阶段构建（已在 Dockerfile 中实现）可以减小最终镜像大小
   - 每个架构的镜像大小可能略有不同

3. **安全性**：
   - 不要在镜像中包含敏感信息（如密码、密钥）
   - 使用环境变量或 Docker secrets 传递敏感配置
   - 定期更新基础镜像以获取安全补丁

4. **性能**：
   - 使用 `.dockerignore` 文件排除不必要的文件
   - 利用 Docker 层缓存加速构建
   - 多架构构建时，每个架构的层会分别缓存

5. **私有仓库**：如果需要私有仓库，可以使用 Docker Hub 的私有仓库功能（需要付费）或其他私有仓库服务

6. **架构兼容性**：
   - Node.js 18 Alpine 镜像原生支持 ARM64 和 AMD64
   - Prisma 也支持多架构，无需特殊配置

## 故障排除

### 推送失败：未授权

```bash
# 重新登录
docker logout
docker login
```

### 推送失败：镜像不存在

```bash
# 确保镜像已正确标记
docker images | grep YOUR_DOCKERHUB_USERNAME

# 如果不存在，重新标记
docker tag axiarz-website_app:latest YOUR_DOCKERHUB_USERNAME/axiarz-website:latest
```

### 网络问题

如果遇到网络问题，可以：
- 使用国内镜像加速器（如阿里云、腾讯云）
- 配置 Docker 代理
- 使用 VPN

## 相关资源

- [Docker Hub 官方文档](https://docs.docker.com/docker-hub/)
- [Docker 构建最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker 多阶段构建](https://docs.docker.com/build/building/multi-stage/)

