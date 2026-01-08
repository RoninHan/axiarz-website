# GitHub Actions 自动化部署到 Docker Hub

本项目使用 GitHub Actions 自动构建多架构 Docker 镜像并推送到 Docker Hub。

## 配置步骤

### 1. 在 Docker Hub 创建 Access Token

1. 登录 [Docker Hub](https://hub.docker.com/)
2. 点击右上角头像 → **Account Settings**
3. 选择 **Security** 标签
4. 点击 **New Access Token**
5. 输入描述（如 `github-actions`）
6. 权限选择 **Read, Write, Delete**
7. 点击 **Generate**
8. **复制生成的 Token**（只会显示一次）

### 2. 在 GitHub 仓库配置 Secrets

1. 打开你的 GitHub 仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下两个 secrets：

   **DOCKERHUB_USERNAME**
   - Name: `DOCKERHUB_USERNAME`
   - Value: 你的 Docker Hub 用户名（如 `roninwin`）

   **DOCKERHUB_TOKEN**
   - Name: `DOCKERHUB_TOKEN`
   - Value: 刚才在 Docker Hub 复制的 Access Token

## 触发方式

### 1. 自动触发

- **推送到 main 分支**：每次 push 到 main 分支时自动构建，标签为 `latest`
- **创建版本标签**：推送类似 `v1.0.5` 的标签时自动构建，生成对应版本标签

```bash
# 创建并推送版本标签
git tag v1.0.5
git push origin v1.0.5
```

### 2. 手动触发

1. 进入 GitHub 仓库的 **Actions** 标签
2. 选择 **Build and Push Docker Image** 工作流
3. 点击 **Run workflow**
4. 输入版本号（可选，默认 `latest`）
5. 点击 **Run workflow** 确认

## 工作流特性

### ✅ 多架构支持
- **linux/amd64**：支持 Intel/AMD 处理器
- **linux/arm64**：支持 ARM 处理器（如 Apple Silicon、树莓派）

### ✅ 智能缓存
- 使用 Docker Registry 缓存层
- 加快后续构建速度
- 节省构建时间和资源

### ✅ 自动版本标签
- `latest`：main 分支最新版本
- `v1.0.5`：特定版本号
- `v1.0`：主次版本号
- `v1`：主版本号

## 使用构建的镜像

### 拉取镜像

```bash
# 拉取最新版本
docker pull roninwin/axiarz-website:latest

# 拉取特定版本
docker pull roninwin/axiarz-website:v1.0.5
```

### 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  --name axiarz-website \
  -e DATABASE_URL="your_database_url" \
  roninwin/axiarz-website:latest
```

## 查看构建状态

- 进入 GitHub 仓库的 **Actions** 标签
- 查看最近的工作流运行记录
- 点击任意运行记录查看详细日志

## 故障排查

### 构建失败

1. 检查 GitHub Secrets 是否正确配置
2. 确认 Docker Hub Token 权限足够
3. 查看 Actions 日志中的错误信息
4. 确保 Dockerfile 没有语法错误

### 权限错误

```
Error: denied: requested access to the resource is denied
```

解决方案：
- 检查 `DOCKERHUB_USERNAME` 是否正确
- 重新生成 `DOCKERHUB_TOKEN` 并更新 Secret
- 确认 Docker Hub 账号状态正常

## 本地测试

在推送到 GitHub 前，可以本地测试构建：

```bash
# 本地构建
npm run build

# 本地 Docker 构建测试
docker build -t axiarz-website:test .

# 运行测试
docker run -p 3000:3000 axiarz-website:test
```

## 高级配置

### 只在特定条件下构建

编辑 `.github/workflows/docker-publish.yml`：

```yaml
on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### 添加构建通知

可以集成 Slack、Discord 等通知服务，在构建完成后发送通知。

---

## 相关链接

- [Docker Hub](https://hub.docker.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Buildx 文档](https://docs.docker.com/buildx/working-with-buildx/)
