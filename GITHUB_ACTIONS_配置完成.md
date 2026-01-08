# ✅ GitHub Actions 自动化 Docker 构建配置完成

## 📋 配置摘要

已成功配置 GitHub Actions 工作流，实现自动构建 Docker 镜像并推送到 Docker Hub 和 GitHub Container Registry。

## ✨ 已完成的配置

### 1. GitHub Actions 工作流
**文件**: `.github/workflows/docker-publish.yml`

**功能**:
- ✅ 多架构支持（linux/amd64, linux/arm64）
- ✅ 自动触发（推送到 main 分支、创建版本标签）
- ✅ 手动触发（支持自定义版本号）
- ✅ 智能缓存（GitHub Actions Cache）
- ✅ 双仓库推送（Docker Hub + GHCR）
- ✅ 自动版本标签生成
- ✅ 智能跳过（忽略文档更新）

### 2. 文档
- ✅ **GITHUB_ACTIONS_SETUP.md** - 快速设置指南（5分钟配置）
- ✅ **GITHUB_ACTIONS_DOCKER.md** - 完整使用文档（详细说明）
- ✅ **README.md** - 添加徽章和快速开始部分

### 3. 优化配置
- ✅ `.dockerignore` - 已存在，优化构建速度
- ✅ `Dockerfile` - 多阶段构建，生产就绪
- ✅ `docker-compose.yml` - 本地开发和测试

## 🚀 下一步操作

### 立即可以做的事情：

#### 1. 配置 GitHub Secrets（必需）

**方法 A: 使用 GitHub CLI**
```bash
gh auth login
gh secret set DOCKERHUB_USERNAME -b"roninwin"
gh secret set DOCKERHUB_TOKEN  # 粘贴从 Docker Hub 获取的 token
gh secret list  # 验证
```

**方法 B: 使用网页**
1. 访问：https://github.com/RoninHan/axiarz-website/settings/secrets/actions
2. 添加两个 secrets：
   - `DOCKERHUB_USERNAME`: roninwin
   - `DOCKERHUB_TOKEN`: (从 Docker Hub 获取)

**获取 Docker Hub Token**:
1. 访问：https://hub.docker.com/settings/security
2. 创建 New Access Token
3. 描述：github-actions-axiarz
4. 权限：Read, Write, Delete
5. 复制生成的 token

#### 2. 触发第一次构建

**选项 A: 推送代码**
```bash
git add .
git commit -m "feat: 配置 GitHub Actions 自动化 Docker 构建"
git push origin main
```

**选项 B: 创建版本标签**
```bash
git tag v1.0.6
git push origin v1.0.6
```

**选项 C: 手动触发**
```bash
gh workflow run "Build and Push Docker Image"
```

#### 3. 查看构建状态

```bash
# 使用 CLI
gh run list --workflow="Build and Push Docker Image"
gh run watch

# 使用网页
open https://github.com/RoninHan/axiarz-website/actions
```

#### 4. 使用构建的镜像

```bash
# 拉取镜像
docker pull roninwin/axiarz-website:latest

# 运行容器
docker run -d -p 3000:3000 roninwin/axiarz-website:latest

# 查看 Docker Hub
open https://hub.docker.com/r/roninwin/axiarz-website/tags
```

## 📊 工作流特性

### 触发方式
| 触发条件 | 生成的标签 | 说明 |
|---------|-----------|------|
| 推送到 main | `latest`, `main`, `main-<sha>` | 自动构建最新版本 |
| 标签 v1.0.5 | `v1.0.5`, `v1.0`, `v1`, `latest` | 语义化版本发布 |
| 手动触发 | 自定义版本 | 灵活控制发布 |

### 构建目标
| 目标 | 镜像地址 | 用途 |
|-----|---------|------|
| Docker Hub | `roninwin/axiarz-website` | 公开分发 |
| GHCR | `ghcr.io/roninhan/axiarz-website` | GitHub 集成 |

### 支持架构
| 架构 | 平台 | 说明 |
|-----|------|------|
| linux/amd64 | Intel/AMD | 通用服务器、PC |
| linux/arm64 | ARM | Apple Silicon、AWS Graviton |

## 📁 相关文件

```
.
├── .github/
│   └── workflows/
│       └── docker-publish.yml          # ✅ GitHub Actions 工作流
├── .dockerignore                        # ✅ Docker 忽略文件
├── Dockerfile                           # ✅ Docker 构建文件
├── docker-compose.yml                   # ✅ Docker Compose 配置
├── GITHUB_ACTIONS_SETUP.md              # ✅ 快速设置指南（新建）
├── GITHUB_ACTIONS_DOCKER.md             # ✅ 完整文档（更新）
└── README.md                            # ✅ 添加徽章和说明（更新）
```

## 🎯 推荐工作流程

### 开发流程
```bash
# 1. 本地开发
npm run dev

# 2. 提交代码
git add .
git commit -m "feat: 新功能"
git push origin main

# 3. 自动触发构建
# GitHub Actions 自动构建并推送镜像

# 4. 拉取最新镜像测试
docker pull roninwin/axiarz-website:latest
docker run -p 3000:3000 roninwin/axiarz-website:latest
```

### 发布流程
```bash
# 1. 确保代码已测试
npm test

# 2. 创建版本标签
git tag v1.0.6
git push origin v1.0.6

# 3. 等待构建完成
gh run watch

# 4. 验证镜像
docker pull roninwin/axiarz-website:v1.0.6
docker run -p 3000:3000 roninwin/axiarz-website:v1.0.6

# 5. 部署到生产环境
# 使用构建好的镜像部署
```

## 📚 文档链接

- **快速设置（5分钟）**: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- **完整文档**: [GITHUB_ACTIONS_DOCKER.md](./GITHUB_ACTIONS_DOCKER.md)
- **部署指南**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Docker Hub**: https://hub.docker.com/r/roninwin/axiarz-website
- **GitHub Actions**: https://github.com/RoninHan/axiarz-website/actions

## ⚠️ 重要提醒

1. **必须配置 Secrets** 才能推送到 Docker Hub
2. **首次构建** 大约需要 10-15 分钟（包含多架构构建）
3. **后续构建** 因为缓存，通常只需 2-3 分钟
4. **构建失败** 时查看 Actions 日志定位问题
5. **Docker Hub 免费账户** 有拉取次数限制（200次/6小时）

## 🎉 已完成！

你的项目现在拥有：
- ✅ 全自动 Docker 镜像构建
- ✅ 多架构支持
- ✅ 版本管理
- ✅ 持续集成/持续部署（CI/CD）

开始使用吧！🚀

---

**需要帮助？** 
- 查看快速设置指南：[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- 查看完整文档：[GITHUB_ACTIONS_DOCKER.md](./GITHUB_ACTIONS_DOCKER.md)
- 提交 Issue：https://github.com/RoninHan/axiarz-website/issues
