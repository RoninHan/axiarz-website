# GitHub Actions 自动化部署到 Docker Hub

本项目使用 GitHub Actions 自动构建多架构 Docker 镜像并推送到 Docker Hub 和 GitHub Container Registry。

## 🚀 快速开始

### 1. 在 Docker Hub 创建 Access Token

1. 登录 [Docker Hub](https://hub.docker.com/)
2. 点击右上角头像 → **Account Settings**
3. 选择 **Security** 标签
4. 点击 **New Access Token**
5. 输入描述（如 `github-actions-axiarz`）
6. 权限选择 **Read, Write, Delete**
7. 点击 **Generate**
8. **⚠️ 立即复制生成的 Token**（只会显示一次！）

### 2. 在 GitHub 仓库配置 Secrets

#### 方法 1：通过 GitHub 网页配置

1. 打开你的 GitHub 仓库：https://github.com/RoninHan/axiarz-website
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下两个 secrets：

   **DOCKERHUB_USERNAME**
   - Name: `DOCKERHUB_USERNAME`
   - Value: 你的 Docker Hub 用户名（例如：`roninwin`）

   **DOCKERHUB_TOKEN**
   - Name: `DOCKERHUB_TOKEN`
   - Value: 刚才在 Docker Hub 复制的 Access Token

#### 方法 2：通过 GitHub CLI 配置（推荐）

```bash
# 安装 GitHub CLI (如果还没安装)
brew install gh

# 登录 GitHub
gh auth login

# 添加 secrets
gh secret set DOCKERHUB_USERNAME -b"roninwin"
gh secret set DOCKERHUB_TOKEN  # 会提示你粘贴 token

# 验证 secrets
gh secret list
```

## 📦 触发方式

### 1. 自动触发（推荐）

#### a) 推送到 main 分支
每次 push 到 main 分支时自动构建，标签为 `latest`

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

#### b) 创建版本标签
推送版本标签（如 `v1.0.5`）时自动构建多个版本标签

```bash
# 创建版本标签
git tag v1.0.5

# 推送标签到远程
git push origin v1.0.5

# 或推送所有标签
git push --tags
```

**自动生成的标签：**
- `v1.0.5` - 完整版本号
- `v1.0` - 主次版本号  
- `v1` - 主版本号
- `latest` - 最新版本（仅 main 分支）

### 2. 手动触发

#### 通过 GitHub 网页

1. 进入 GitHub 仓库的 **Actions** 标签
2. 选择 **Build and Push Docker Image** 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支（默认 main）
5. 输入版本号（可选，默认 `latest`）
6. 点击绿色的 **Run workflow** 按钮确认

#### 通过 GitHub CLI

```bash
# 触发工作流（使用默认 latest 标签）
gh workflow run "Build and Push Docker Image"

# 触发工作流并指定版本
gh workflow run "Build and Push Docker Image" -f version=v1.0.5

# 查看工作流运行状态
gh run list --workflow="Build and Push Docker Image"

# 查看最新运行的详细信息
gh run view --log
```

## ✨ 工作流特性

### 🏗️ 多架构支持
构建并推送支持多种 CPU 架构的镜像：
- **linux/amd64**：Intel/AMD 处理器（服务器、PC）
- **linux/arm64**：ARM 处理器（Apple Silicon M1/M2/M3、AWS Graviton、树莓派）

**优势：**
- 一个镜像标签自动支持多个平台
- Docker 会根据运行环境自动选择正确的架构
- 无需为不同平台维护不同的镜像

### ⚡ 智能缓存
- 使用 GitHub Actions Cache 缓存 Docker 层
- 大幅加快后续构建速度（首次 ~10 分钟，后续 ~2-3 分钟）
- 节省构建时间和 GitHub Actions 配额

### 🏷️ 自动版本标签

#### 主分支推送生成：
- `latest` - 始终指向 main 分支最新版本
- `main` - main 分支标签
- `main-<git-sha>` - 带 Git SHA 的分支标签

#### 版本标签（v1.0.5）生成：
- `v1.0.5` - 完整语义化版本号
- `v1.0` - 主次版本号（自动更新到最新补丁版本）
- `v1` - 主版本号（自动更新到最新次版本）

#### 手动触发生成：
- 自定义版本号（如输入 `beta`, `staging` 等）

### 📤 双仓库推送
镜像同时推送到两个容器注册中心：
- **Docker Hub**: `roninwin/axiarz-website`
- **GitHub Container Registry**: `ghcr.io/roninhan/axiarz-website`

### 🚫 智能跳过
以下变更不会触发构建（节省资源）：
- Markdown 文件更新（`**.md`）
- 文档目录更新（`docs/**`）
- README、.gitignore 等配置文件

## 📥 使用构建的镜像

### 拉取镜像

```bash
# 从 Docker Hub 拉取最新版本
docker pull roninwin/axiarz-website:latest

# 拉取特定版本
docker pull roninwin/axiarz-website:v1.0.5

# 从 GitHub Container Registry 拉取
docker pull ghcr.io/roninhan/axiarz-website:latest

# 查看本地镜像
docker images | grep axiarz-website
```

### 运行容器

#### 基础运行

```bash
docker run -d \
  -p 3000:3000 \
  --name axiarz-website \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/axiarz" \
  roninwin/axiarz-website:latest
```

#### 使用 docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    image: roninwin/axiarz-website:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/axiarz
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=axiarz
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down
```

### 在生产环境部署

```bash
# 拉取最新稳定版本
docker pull roninwin/axiarz-website:v1.0.5

# 停止旧容器
docker stop axiarz-website
docker rm axiarz-website

# 启动新容器
docker run -d \
  --name axiarz-website \
  --restart unless-stopped \
  -p 3000:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -v /path/to/uploads:/app/public/uploads \
  roninwin/axiarz-website:v1.0.5

# 验证容器运行
docker ps | grep axiarz
docker logs -f axiarz-website
```

## 📊 查看构建状态

### 通过 GitHub 网页

1. 进入仓库：https://github.com/RoninHan/axiarz-website
2. 点击 **Actions** 标签
3. 查看最近的工作流运行记录
4. 点击任意运行记录查看详细步骤和日志
5. 绿色 ✅ 表示成功，红色 ❌ 表示失败

### 通过 GitHub CLI

```bash
# 查看工作流运行列表
gh run list --workflow="Build and Push Docker Image" --limit 5

# 查看特定运行的状态
gh run view <run-id>

# 查看实时日志
gh run watch

# 重新运行失败的工作流
gh run rerun <run-id>
```

### 添加状态徽章到 README

在 README.md 中添加：

```markdown
![Docker Build](https://github.com/RoninHan/axiarz-website/actions/workflows/docker-publish.yml/badge.svg)
```

## 🔧 故障排查

### ❌ 构建失败

#### 问题 1：Secrets 未配置或错误

```
Error: Username and password required
```

**解决方案：**
1. 检查 GitHub Secrets 是否正确配置
2. 验证 secret 名称：必须是 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN`
3. 确认 Docker Hub Token 没有过期

```bash
# 通过 CLI 检查
gh secret list

# 重新设置（如果需要）
gh secret set DOCKERHUB_USERNAME -b"roninwin"
gh secret set DOCKERHUB_TOKEN
```

#### 问题 2：权限错误

```
Error: denied: requested access to the resource is denied
```

**解决方案：**
- 检查 `DOCKERHUB_USERNAME` 是否与 Docker Hub 用户名完全一致
- 重新生成 `DOCKERHUB_TOKEN`，确保权限包含 **Read, Write, Delete**
- 确认 Docker Hub 账号状态正常（未被限制）
- 验证镜像名称格式：`<username>/axiarz-website`

#### 问题 3：Docker 构建错误

```
Error: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

**解决方案：**
1. 在本地测试构建：
```bash
# 本地构建测试
docker build -t axiarz-website:test .

# 如果成功，推送代码
git add .
git commit -m "fix: 修复构建问题"
git push
```

2. 检查 `package.json` 中的 `build:docker` 脚本
3. 确保所有依赖都在 `package.json` 中
4. 查看 GitHub Actions 日志中的详细错误信息

#### 问题 4：内存不足

```
Error: memory limit exceeded
```

**解决方案：**
- GitHub Actions 免费版有内存限制
- 优化 Dockerfile 减少构建时内存使用
- 考虑升级到 GitHub Actions 付费计划

### ⚠️ 推送缓慢

如果推送镜像到 Docker Hub 很慢：

1. **网络问题**：GitHub Actions 服务器到 Docker Hub 的网络可能较慢
2. **解决方案**：
   - 耐心等待（通常 5-15 分钟）
   - 考虑只推送到 GitHub Container Registry（更快）
   - 减少构建的平台数量（只构建 amd64）

```yaml
# 如果只需要 amd64 架构（修改 .github/workflows/docker-publish.yml）
platforms: linux/amd64  # 移除 linux/arm64
```

### 🔍 调试技巧

#### 1. 启用详细日志

在工作流文件中添加调试步骤：

```yaml
- name: Debug Info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    docker version
    docker buildx version
```

#### 2. 本地测试多架构构建

```bash
# 创建并使用 buildx builder
docker buildx create --name mybuilder --use

# 本地构建多架构镜像（不推送）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t roninwin/axiarz-website:test \
  .

# 构建并加载到本地（单架构）
docker buildx build \
  --platform linux/amd64 \
  -t roninwin/axiarz-website:test \
  --load \
  .
```

#### 3. 检查 Docker Hub 镜像

```bash
# 使用 Docker Hub API 检查标签
curl -s https://hub.docker.com/v2/repositories/roninwin/axiarz-website/tags | jq

# 或通过网页查看
# https://hub.docker.com/r/roninwin/axiarz-website/tags
```

## 🧪 本地测试

在推送到 GitHub 前，建议本地测试构建：

### 基础构建测试

```bash
# 1. 本地应用构建
npm install
npm run build

# 2. 本地 Docker 构建测试（单架构，快速）
docker build -t axiarz-website:test .

# 3. 运行测试容器
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --name axiarz-test \
  axiarz-website:test

# 4. 检查容器状态
docker ps
docker logs -f axiarz-test

# 5. 测试应用
curl http://localhost:3000

# 6. 清理
docker stop axiarz-test
docker rm axiarz-test
```

### 多架构构建测试

```bash
# 1. 创建 buildx builder（首次需要）
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap

# 2. 构建多架构镜像（不推送）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t roninwin/axiarz-website:local-test \
  .

# 3. 构建并加载到本地（仅单架构）
docker buildx build \
  --platform linux/amd64 \
  -t axiarz-website:local \
  --load \
  .

# 4. 测试推送到 Docker Hub（可选）
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t roninwin/axiarz-website:test \
  --push \
  .
```

### 使用本地脚本测试

```bash
# 使用项目提供的推送脚本（会真实推送）
./push-to-dockerhub.sh roninwin test-v1.0.0

# 只构建不推送（需要修改脚本或使用 --dry-run）
./push-to-dockerhub.sh roninwin test-v1.0.0 --single-arch
```

## ⚙️ 高级配置

### 1. 自定义构建触发条件

编辑 `.github/workflows/docker-publish.yml`：

```yaml
# 只在特定路径变更时构建
on:
  push:
    branches: [main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'prisma/**'
      - 'Dockerfile'
      - 'package.json'
      - '.github/workflows/docker-publish.yml'
```

### 2. 添加构建通知

#### Slack 通知

在工作流末尾添加：

```yaml
- name: Slack Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Docker build ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Email 通知

GitHub Actions 默认会在失败时发送邮件到你的 GitHub 邮箱。

### 3. 条件构建（仅特定平台）

```yaml
# 只构建 amd64（更快）
- name: Build and push (AMD64 only)
  uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64  # 移除 arm64
    # ... 其他配置
```

### 4. 添加构建参数

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    build-args: |
      NODE_ENV=production
      BUILD_VERSION=${{ github.ref_name }}
    # ... 其他配置
```

### 5. 定时构建（每周构建一次）

```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # 每周日 UTC 02:00
  # ... 其他触发条件
```

### 6. 并行构建多个标签

```yaml
strategy:
  matrix:
    include:
      - tag: latest
        dockerfile: Dockerfile
      - tag: alpine
        dockerfile: Dockerfile.alpine
```

## 📈 最佳实践

### ✅ 版本管理

1. **使用语义化版本**：`v1.0.0`, `v1.0.1`, `v2.0.0`
2. **主分支始终稳定**：只合并经过测试的代码到 main
3. **使用 Git 标签发布**：重要版本使用标签
4. **保持 latest 更新**：latest 应始终指向最新稳定版

### ✅ 安全最佳实践

1. **使用 Access Token**：不要使用密码
2. **定期轮换 Token**：每 3-6 个月更换一次
3. **最小权限原则**：Token 只给必要的权限
4. **不要在代码中硬编码**：使用 GitHub Secrets

### ✅ 性能优化

1. **利用缓存**：已启用 GitHub Actions Cache
2. **多阶段构建**：Dockerfile 已使用多阶段构建
3. **.dockerignore**：排除不需要的文件

创建 `.dockerignore`：
```
node_modules
.next
.git
.github
*.md
.env*
.vscode
coverage
tests
```

### ✅ 监控和维护

1. **定期检查构建状态**
2. **关注 Docker Hub 存储配额**
3. **清理旧的未使用镜像**
4. **更新依赖和 Actions 版本**

## 🔗 相关链接

- **Docker Hub**: https://hub.docker.com/r/roninwin/axiarz-website
- **GitHub Container Registry**: https://github.com/RoninHan/axiarz-website/pkgs/container/axiarz-website
- **GitHub Actions**: https://github.com/RoninHan/axiarz-website/actions
- **Docker Hub 文档**: https://docs.docker.com/docker-hub/
- **GitHub Actions 文档**: https://docs.github.com/en/actions
- **Docker Buildx 文档**: https://docs.docker.com/buildx/working-with-buildx/

## 📝 快速参考

### 常用命令

```bash
# 创建并推送版本标签
git tag v1.0.6 && git push origin v1.0.6

# 手动触发工作流
gh workflow run "Build and Push Docker Image"

# 查看构建状态
gh run list --workflow="Build and Push Docker Image" --limit 5

# 拉取最新镜像
docker pull roninwin/axiarz-website:latest

# 查看镜像信息
docker inspect roninwin/axiarz-website:latest

# 查看镜像支持的架构
docker buildx imagetools inspect roninwin/axiarz-website:latest
```

### 环境变量

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 随机字符串 |
| `NEXTAUTH_URL` | 应用 URL | `https://yourdomain.com` |
| `NODE_ENV` | Node 环境 | `production` |

---

**需要帮助？** 查看 [TROUBLESHOOTING_ADMIN.md](./TROUBLESHOOTING_ADMIN.md) 或提交 Issue。
