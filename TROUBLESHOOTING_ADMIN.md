# 管理员管理系统故障排查指南

## 问题：获取管理员列表失败

### 可能的原因和解决方案

#### 1. 未登录或Token过期

**症状：** API返回 403 或显示"无权限"

**解决方案：**
1. 访问 `/admin/login` 登录管理后台
2. 使用超级管理员账号登录：
   - 邮箱：`admin@axiarz.com`
   - 密码：`admin123`

#### 2. 当前账号不是超级管理员

**症状：** API返回 `{ success: false, error: '无权限' }`

**原因：** 只有 `super_admin` 角色可以访问管理员管理功能

**解决方案：**
确认当前登录账号的角色为 `super_admin`

```bash
# 检查数据库中的管理员角色
npx tsx -e "
import { prisma } from './lib/prisma';
async function check() {
  const admins = await prisma.admin.findMany({
    select: { email: true, role: true, status: true }
  });
  console.table(admins);
  await prisma.\$disconnect();
}
check();
"
```

#### 3. 数据库连接问题

**症状：** 500 错误或数据库连接失败

**解决方案：**
1. 检查 `.env` 文件中的数据库连接字符串
2. 确保 PostgreSQL 服务正在运行
3. 运行 `npx prisma db push` 确保数据库架构是最新的

#### 4. Permission 关系查询问题

**症状：** API 返回错误但没有明确信息

**原因：** Admin 和 Permission 的关联表可能有问题

**解决方案：**
检查 AdminPermission 表是否存在：

```bash
npx prisma studio
```

在 Prisma Studio 中查看：
- `admins` 表
- `permissions` 表  
- `admin_permissions` 表（关联表）

#### 5. 前端页面访问控制

**症状：** 页面加载后显示"无权限访问此页面"

**原因：** `currentUser` 不是超级管理员

**解决方案：**
前端页面会在加载时调用 `/api/auth/me` 获取当前用户信息。确保：
1. 已经登录
2. Token 有效
3. 角色是 `super_admin`

### 验证步骤

#### 步骤 1: 确认超级管理员存在

```bash
npx tsx create-super-admin.ts
```

应该输出：
```
✅ 超级管理员已存在: admin@axiarz.com
```

#### 步骤 2: 验证权限数据

```bash
npx tsx prisma/seed-permissions.ts
```

应该输出：
```
开始初始化权限...
成功初始化 43 个权限
```

#### 步骤 3: 测试登录

访问 `/admin/login`，使用以下凭据：
- 邮箱：`admin@axiarz.com`
- 密码：`admin123`

登录成功后应该跳转到 `/admin`

#### 步骤 4: 访问管理员管理

点击侧边栏的"管理员管理"或直接访问 `/admin/admins`

如果一切正常，应该看到管理员列表页面。

### 调试技巧

#### 查看浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看是否有错误信息

#### 查看 Network 请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 访问 `/admin/admins` 页面
4. 查找 `/api/admin/admins` 请求
5. 检查：
   - 状态码（应该是 200）
   - 响应数据
   - 请求头中的 Cookie（应该包含 token）

#### 查看服务器日志

如果使用 `npm run dev` 运行项目，查看终端输出：
- `verifyAdmin` 函数会输出调试信息
- 查看是否有数据库查询错误

### 常见错误信息

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `无权限` | 不是超级管理员 | 使用 super_admin 账号登录 |
| `未登录` | Token 不存在或过期 | 重新登录 |
| `管理员不存在` | Token 中的 ID 无效 | 清除 Cookie 重新登录 |
| `Property 'courierCompany' does not exist` | 数据库模型未同步 | 运行 `npx prisma db push` |
| `Network Error` | 服务器未运行 | 运行 `npm run dev` |

### API 端点测试

可以使用以下命令直接测试 API（需要先获取 token）：

```bash
# 1. 登录获取 token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@axiarz.com","password":"admin123"}'

# 2. 使用返回的 token 访问管理员列表
curl http://localhost:3000/api/admin/admins \
  -H "Cookie: token=YOUR_TOKEN_HERE"
```

### 数据库检查

如果怀疑是数据库问题，可以直接查询：

```sql
-- 检查管理员
SELECT id, email, name, role, status FROM admins;

-- 检查权限
SELECT COUNT(*) FROM permissions;

-- 检查管理员权限关联
SELECT 
  a.email, 
  COUNT(ap.id) as permission_count 
FROM admins a
LEFT JOIN admin_permissions ap ON a.id = ap.admin_id
GROUP BY a.id, a.email;
```

### 重置步骤（最后手段）

如果以上都不起作用，尝试重置：

```bash
# 1. 重置数据库
npx prisma db push --force-reset

# 2. 运行初始化脚本
npx prisma db seed

# 3. 创建超级管理员
npx tsx create-super-admin.ts

# 4. 初始化权限
npx tsx prisma/seed-permissions.ts

# 5. 重启开发服务器
npm run dev
```

### 联系支持

如果问题仍然存在，请提供以下信息：
1. 浏览器控制台的错误信息（截图）
2. Network 请求的响应数据
3. 服务器终端的日志输出
4. 数据库中的管理员数据（运行上面的 SQL 查询）
