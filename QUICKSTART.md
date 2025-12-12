# 快速启动指南

## 前置要求

1. **Node.js 18+** 已安装
2. **PostgreSQL 16.1** 已安装并运行
3. **npm** 或 **yarn** 包管理器

## 步骤 1: 安装依赖

```bash
npm install
```

## 步骤 2: 配置环境变量

复制 `env.example` 为 `.env`：

```bash
cp env.example .env
```

编辑 `.env` 文件，修改数据库连接信息：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/axiarz_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_EMAIL="admin@axiarz.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Super Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**重要**: 
- 将 `username` 和 `password` 替换为你的 PostgreSQL 用户名和密码
- 确保数据库 `axiarz_db` 已创建（或修改为你想要的数据库名）
- 生产环境请使用强密钥替换 `JWT_SECRET`

## 步骤 3: 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 创建数据库表
npm run db:migrate

# 填充初始数据（包括管理员账号）
npm run db:seed
```

## 步骤 4: 启动开发服务器

```bash
npm run dev
```

## 步骤 5: 访问应用

- **前台**: http://localhost:3000/client
- **后台登录**: http://localhost:3000/admin/login

### 默认管理员账号

- 邮箱: `admin@axiarz.com` (在 .env 中配置)
- 密码: `admin123456` (在 .env 中配置)

## 常见问题

### 数据库连接失败

1. 确保 PostgreSQL 服务正在运行
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 确保数据库已创建

### Prisma 迁移失败

如果遇到迁移错误，可以尝试：

```bash
# 重置数据库（注意：会删除所有数据）
npx prisma migrate reset

# 或者直接推送 schema（开发环境）
npm run db:push
```

### 端口被占用

如果 3000 端口被占用，Next.js 会自动使用下一个可用端口（如 3001）

## 下一步

1. 登录后台管理系统
2. 配置支付方式（后台 → 支付配置）
3. 添加产品（后台 → 产品管理）
4. 开始使用！

## 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

生产环境注意事项：
- 使用强 `JWT_SECRET`
- 使用安全的数据库连接
- 配置 HTTPS
- 设置环境变量 `NODE_ENV=production`

