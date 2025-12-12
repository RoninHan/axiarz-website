# Axiarz Website - 科技产品独立站

基于 Next.js 14.0.3 (App Router)、Tailwind CSS 3.4.1、TypeScript 5.2.2、PostgreSQL 16.1 的完整独立站项目。

## 技术栈

- **前端框架**: Next.js 14.0.3 (App Router)
- **样式**: Tailwind CSS 3.4.1
- **语言**: TypeScript 5.2.2
- **数据库**: PostgreSQL 16.1
- **ORM**: Prisma 5.10.2
- **认证**: JWT (jsonwebtoken 9.0.2)
- **图表**: Chart.js 4.4.8

## 功能特性

### 前台功能
- ✅ 首页展示（品牌优势、产品精选、客户口碑）
- ✅ 产品列表和详情页
- ✅ 购物车管理
- ✅ 收货地址管理
- ✅ 订单创建和追踪
- ✅ 支付方式动态配置（支持支付宝、微信、PayPal）

### 后台管理
- ✅ 管理员登录认证
- ✅ 仪表盘（数据统计、图表展示）
- ✅ 用户管理（查询、启用/禁用）
- ✅ 产品管理（增删改查、上下架、库存管理）
- ✅ 订单管理（查询、状态更新、物流信息）
- ✅ 支付配置管理（动态配置支付方式参数、启用/禁用、排序）

## 项目结构

```
axiarz-website/
├── app/
│   ├── admin/              # 后台管理页面
│   ├── client/             # 前台用户页面
│   ├── api/                # API 路由
│   └── globals.css         # 全局样式
├── components/
│   ├── admin/              # 后台组件
│   └── client/            # 前台组件
├── lib/                   # 工具函数
├── prisma/                # 数据库模型和迁移
├── types/                 # TypeScript 类型定义
└── public/                # 静态资源
```

## 快速开始

### 1. 环境要求

- Node.js 18+ 
- PostgreSQL 16.1
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/axiarz_db?schema=public"

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 管理员初始账号
ADMIN_EMAIL="admin@axiarz.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="Super Admin"

# 应用地址
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 填充初始数据（包括管理员账号和支付配置）
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问：
- 前台: http://localhost:3000/client
- 后台: http://localhost:3000/admin/login

### 6. 生产构建

```bash
npm run build
npm start
```

## 数据库初始化

项目启动时会自动检测数据库连接和表结构，如果不存在会自动创建。初始数据包括：

- 超级管理员账号（从环境变量读取）
- 默认权限配置
- 支付方式配置模板（支付宝、微信、PayPal，默认未启用）

## 默认管理员账号

- 邮箱: `admin@axiarz.com` (可在 .env 中修改)
- 密码: `admin123456` (可在 .env 中修改)

## 支付配置

后台管理 → 支付配置，可以：

1. 启用/禁用支付方式
2. 配置支付参数（AppID、密钥等）
3. 调整支付方式排序
4. 前台自动同步配置状态

支持的支付方式：
- 支付宝 (alipay)
- 微信支付 (wechat)
- PayPal (paypal)

## UI 设计规范

- **主色**: 黑色 (#000000)、白色 (#FFFFFF)
- **辅助色**: 橙色 (#FF7F00)
- **中性色**: 浅灰 (#F5F5F5)、中灰 (#CCCCCC)
- **字体**: Microsoft YaHei
- **圆角**: 4px
- **间距**: 模块间距 30px-80px，组件内间距 20px

## 开发脚本

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 生成 Prisma Client
npm run db:generate

# 数据库迁移
npm run db:migrate

# 推送数据库变更（开发用）
npm run db:push

# 填充初始数据
npm run db:seed
```

## 注意事项

1. 生产环境请务必修改 `JWT_SECRET` 为强密钥
2. 支付配置中的敏感信息（如私钥）建议加密存储
3. 数据库连接信息请妥善保管
4. 首次启动前确保 PostgreSQL 服务已启动

## 许可证

MIT

