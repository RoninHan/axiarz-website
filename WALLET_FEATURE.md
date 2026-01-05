# 钱包功能更新说明

## 新增功能

### 1. 修改密码
- 位置：个人中心 -> 修改密码标签页
- 功能：用户可以修改自己的登录密码
- API: `POST /api/auth/change-password`

### 2. 钱包功能
- 位置：个人中心 -> 我的钱包标签页
- 功能：
  - 查看账户余额
  - 充值
  - 提现
  - 查看交易记录
- API:
  - `GET /api/client/wallet` - 获取钱包信息和交易记录
  - `POST /api/client/wallet/recharge` - 充值
  - `POST /api/client/wallet/withdraw` - 提现

## 数据库更新

需要运行以下命令来更新数据库：

```bash
# 生成迁移文件
npx prisma migrate dev --name add_wallet_feature

# 或者直接推送到数据库（开发环境）
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

## 新增数据库表

### wallets (用户钱包表)
- `id`: 主键
- `userId`: 用户ID（唯一）
- `balance`: 余额
- `frozen`: 冻结金额
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### wallet_transactions (钱包交易记录表)
- `id`: 主键
- `userId`: 用户ID
- `type`: 交易类型（RECHARGE/WITHDRAW/PAYMENT/REFUND）
- `amount`: 交易金额
- `balance`: 交易后余额
- `description`: 交易描述
- `relatedId`: 关联订单ID（可选）
- `status`: 状态（pending/completed/failed）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

## 修改的文件

### 前端
- `app/(client)/profile/page.tsx` - 个人中心页面（新增标签页）
  - 个人信息标签页
  - 修改密码标签页
  - 我的钱包标签页

### 后端API
- `app/api/auth/change-password/route.ts` - 修改密码API（新建）
- `app/api/client/wallet/route.ts` - 钱包信息API（新建）
- `app/api/client/wallet/recharge/route.ts` - 充值API（新建）
- `app/api/client/wallet/withdraw/route.ts` - 提现API（新建）

### 数据库
- `prisma/schema.prisma` - 添加了 Wallet 和 WalletTransaction 模型

## 使用说明

1. 首先运行数据库迁移命令更新数据库结构
2. 访问个人中心页面（`/profile`）
3. 可以切换不同标签页：
   - **个人信息**：修改姓名、手机号、头像
   - **修改密码**：修改登录密码
   - **我的钱包**：查看余额、充值、提现、查看交易记录

## 注意事项

1. 充值和提现仅为演示功能，实际生产环境需要对接真实的支付网关
2. 提现操作会创建待审核的交易记录，实际需要管理员审核
3. 钱包余额使用 Decimal 类型确保精度
4. 所有API都需要用户登录认证

## 后续优化建议

1. 添加充值支付网关对接（支付宝、微信支付）
2. 添加管理后台的提现审核功能
3. 添加钱包余额变动的消息通知
4. 添加交易记录的详细筛选和导出功能
5. 添加钱包使用限额和安全验证
