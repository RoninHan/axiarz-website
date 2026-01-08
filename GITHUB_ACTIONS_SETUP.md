# GitHub Actions 自动打包到 Docker Hub - 快速设置指南

## 🚀 一键设置（5分钟完成）

### 步骤 1: 获取 Docker Hub Token

```bash
# 1. 打开 Docker Hub
open https://hub.docker.com/settings/security

# 2. 创建 Access Token
#    - 点击 "New Access Token"
#    - 描述: github-actions-axiarz
#    - 权限: Read, Write, Delete
#    - 复制生成的 token（只显示一次！）
```

### 步骤 2: 配置 GitHub Secrets

#### 方法 A: 使用 GitHub CLI（推荐）

```bash
# 安装 GitHub CLI (如果未安装)
brew install gh

# 登录 GitHub
gh auth login

# 设置 secrets
gh secret set DOCKERHUB_USERNAME -b"roninwin"
gh secret set DOCKERHUB_TOKEN  # 会提示输入，粘贴 token

# 验证
gh secret list
```

#### 方法 B: 使用网页

```bash
# 1. 打开仓库设置
open https://github.com/RoninHan/axiarz-website/settings/secrets/actions

# 2. 点击 "New repository secret"
# 3. 添加两个 secrets:
#    - DOCKERHUB_USERNAME: roninwin
#    - DOCKERHUB_TOKEN: (粘贴 token)
```

### 步骤 3: 触发构建

#### 选项 A: 推送代码到 main 分支

```bash
git add .
git commit -m "feat: 启用 GitHub Actions Docker 构建"
git push origin main
```

#### 选项 B: 创建版本标签

```bash
git tag v1.0.6
git push origin v1.0.6
```

#### 选项 C: 手动触发

```bash
# 使用 CLI
gh workflow run "Build and Push Docker Image"

# 或访问网页
open https://github.com/RoninHan/axiarz-website/actions
# 选择工作流 → Run workflow
```

### 步骤 4: 查看构建状态

```bash
# 查看运行状态
gh run list --workflow="Build and Push Docker Image" --limit 3

# 实时查看日志
gh run watch

# 或访问网页
open https://github.com/RoninHan/axiarz-website/actions
```

### 步骤 5: 使用构建的镜像

```bash
# 拉取镜像
docker pull roninwin/axiarz-website:latest

# 运行容器
docker run -d -p 3000:3000 roninwin/axiarz-website:latest
```

## ✅ 完成！

现在每次推送到 main 分支或创建标签时，GitHub Actions 会自动：
- ✅ 构建 Docker 镜像
- ✅ 支持 AMD64 和 ARM64 架构
- ✅ 推送到 Docker Hub
- ✅ 推送到 GitHub Container Registry
- ✅ 创建版本标签

## 📚 更多信息

详细文档请查看：[GITHUB_ACTIONS_DOCKER.md](./GITHUB_ACTIONS_DOCKER.md)

## 🔧 常见问题

**Q: 如何查看是否配置成功？**
```bash
gh secret list
# 应该看到 DOCKERHUB_USERNAME 和 DOCKERHUB_TOKEN
```

**Q: 构建失败怎么办？**
```bash
# 查看详细日志
gh run list --workflow="Build and Push Docker Image"
gh run view <run-id> --log
```

**Q: 如何本地测试？**
```bash
docker build -t axiarz-website:test .
docker run -p 3000:3000 axiarz-website:test
```

**Q: 如何查看 Docker Hub 上的镜像？**
```bash
open https://hub.docker.com/r/roninwin/axiarz-website/tags
```

## 🎯 下一步

1. **添加状态徽章到 README**
   ```markdown
   ![Docker Build](https://github.com/RoninHan/axiarz-website/actions/workflows/docker-publish.yml/badge.svg)
   ```

2. **配置自动部署**
   - 构建成功后自动部署到服务器
   - 可以使用 SSH 或 Webhook

3. **设置构建通知**
   - Slack、Email、Discord 等

---

**需要帮助？** 提交 Issue 或查看完整文档 [GITHUB_ACTIONS_DOCKER.md](./GITHUB_ACTIONS_DOCKER.md)
