# GitHub Actions Docker 自动化 - 快速参考卡

## ⚡ 一键命令

```bash
# === 配置 Secrets ===
gh secret set DOCKERHUB_USERNAME -b"roninwin"
gh secret set DOCKERHUB_TOKEN  # 粘贴 token
gh secret list  # 验证

# === 触发构建 ===
git tag v1.0.6 && git push origin v1.0.6  # 版本发布
git push origin main                       # 推送到主分支
gh workflow run "Build and Push Docker Image"  # 手动触发

# === 查看状态 ===
gh run list --workflow="Build and Push Docker Image" --limit 5
gh run watch  # 实时查看

# === 使用镜像 ===
docker pull roninwin/axiarz-website:latest
docker run -d -p 3000:3000 roninwin/axiarz-website:latest
```

## 🔗 快速链接

| 资源 | 链接 |
|------|------|
| 🐙 GitHub Actions | https://github.com/RoninHan/axiarz-website/actions |
| 🐳 Docker Hub | https://hub.docker.com/r/roninwin/axiarz-website/tags |
| 📦 GHCR | https://github.com/RoninHan/axiarz-website/pkgs/container/axiarz-website |
| 🔑 Secrets 配置 | https://github.com/RoninHan/axiarz-website/settings/secrets/actions |
| 🔐 Docker Token | https://hub.docker.com/settings/security |

## 📋 触发规则

| 操作 | 触发 | 生成标签 |
|------|------|---------|
| `git push origin main` | ✅ | `latest`, `main` |
| `git push origin v1.0.5` | ✅ | `v1.0.5`, `v1.0`, `v1`, `latest` |
| 更新 `*.md` 文件 | ❌ | - |
| 手动触发 | ✅ | 自定义 |

## 🏗️ 构建信息

- **时间**: 首次 ~10分钟，后续 ~2-3分钟
- **架构**: amd64, arm64
- **目标**: Docker Hub + GHCR
- **缓存**: GitHub Actions Cache

## 📚 文档

- [5分钟快速设置](./GITHUB_ACTIONS_SETUP.md)
- [完整使用文档](./GITHUB_ACTIONS_DOCKER.md)
- [配置完成说明](./GITHUB_ACTIONS_配置完成.md)

## 🆘 常见问题

**Q: 如何查看构建失败原因？**
```bash
gh run list --workflow="Build and Push Docker Image"
gh run view <run-id> --log
```

**Q: 如何重新运行失败的构建？**
```bash
gh run rerun <run-id>
```

**Q: 如何验证 Secrets 配置？**
```bash
gh secret list
# 应该看到: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN
```

**Q: 如何查看镜像支持的架构？**
```bash
docker buildx imagetools inspect roninwin/axiarz-website:latest
```

## ✅ 检查清单

在第一次使用前：
- [ ] 已在 Docker Hub 创建 Access Token
- [ ] 已配置 GitHub Secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
- [ ] 已验证 Secrets (`gh secret list`)
- [ ] 已触发第一次构建（推送代码或标签）
- [ ] 已查看构建状态（成功 ✅）
- [ ] 已测试拉取镜像

---

**🚀 立即开始：** [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
