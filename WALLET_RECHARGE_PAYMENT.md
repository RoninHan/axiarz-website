# 钱包充值支付流程

## 概述

钱包充值功能已改进为使用支付网关（支付宝），而不是直接更新余额。这与订单支付使用相同的支付流程。

## 支付流程

### 1. 前端发起充值请求

用户在个人中心钱包标签页：
- 选择充值金额（可自定义或快速选择 ¥100/500/1000/5000）
- 选择支付方式（支付宝/微信/PayPal）
- 点击"确认充值"按钮

**前端代码** (`app/(client)/profile/page.tsx`):
```typescript
const handleRecharge = async () => {
  const response = await fetch('/api/client/wallet/recharge', {
    method: 'POST',
    body: JSON.stringify({ 
      amount: amt,
      paymentMethod: selectedPayment 
    }),
  })
  
  const data = await response.json()
  
  // 跳转到支付宝支付页面
  if (data.data?.paymentUrl) {
    const paymentWindow = window.open('', '_self')
    paymentWindow.document.write(data.data.paymentUrl)
  }
}
```

### 2. 后端创建充值交易记录

**API路由** (`app/api/client/wallet/recharge/route.ts`):

1. 验证用户登录状态和充值金额
2. 检查支付方式是否启用
3. 创建钱包充值交易记录（状态：`pending`）
4. 调用支付宝支付服务生成支付URL
5. 返回支付URL给前端

```typescript
// 创建交易记录（pending状态）
const transaction = await prisma.walletTransaction.create({
  data: {
    userId,
    type: 'RECHARGE',
    amount: amountDecimal,
    balance: wallet.balance, // 当前余额
    description: `通过支付宝充值 ¥${amount}`,
    status: 'pending', // 等待支付完成
  },
})

// 调用支付宝支付
const alipayService = (await import('@/lib/payment/alipay')).default
const result = await alipayService.createPayment(
  transaction.id,  // 使用交易ID作为订单号
  transaction.id,  
  amount,
  `钱包充值 ¥${amount}`,
  returnUrl
)

return { paymentUrl: result.paymentUrl }
```

### 3. 用户完成支付

- 前端跳转到支付宝支付页面（HTML表单）
- 用户扫码或登录支付宝完成支付
- 支付宝重定向用户回到网站

### 4. 支付宝异步回调

**回调API** (`app/api/payment/callback/route.ts`):

支付宝服务器会向回调URL发送POST请求：

1. 验证支付宝签名
2. 检查支付状态（`TRADE_SUCCESS` 或 `TRADE_FINISHED`）
3. 根据 `out_trade_no`（交易ID）查找充值记录
4. 更新钱包余额和交易状态

```typescript
// 查找充值交易
const walletTransaction = await prisma.walletTransaction.findFirst({
  where: { 
    id: verificationResult.outTradeNo,
    type: 'RECHARGE',
    status: 'pending'
  }
})

if (walletTransaction) {
  // 计算新余额
  const newBalance = Number(wallet.balance) + Number(walletTransaction.amount)
  
  // 原子操作：更新钱包和交易
  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId: walletTransaction.userId },
      data: { balance: newBalance }
    }),
    prisma.walletTransaction.update({
      where: { id: walletTransaction.id },
      data: {
        status: 'completed',
        balance: newBalance
      }
    })
  ])
}
```

5. 返回 `success` 给支付宝

## 数据库设计

### Wallet 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 钱包ID |
| userId | String | 用户ID（唯一） |
| balance | Decimal | 账户余额 |
| frozen | Decimal | 冻结金额 |

### WalletTransaction 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 交易ID |
| userId | String | 用户ID |
| type | String | 交易类型（RECHARGE/WITHDRAW/PAYMENT/REFUND） |
| amount | Decimal | 交易金额 |
| balance | Decimal | 交易后余额 |
| description | String | 交易描述 |
| status | String | 交易状态（pending/completed/failed） |

## 交易状态说明

### pending（待处理）
- 充值交易刚创建时的初始状态
- 等待支付网关确认

### completed（已完成）
- 支付成功后的状态
- 余额已更新

### failed（失败）
- 支付创建失败
- 支付超时或被取消

## 安全性考虑

1. **签名验证**: 所有支付宝回调都经过签名验证
2. **幂等性**: 使用交易ID作为唯一标识，防止重复处理
3. **原子操作**: 使用数据库事务确保余额和交易状态同步更新
4. **状态检查**: 只处理 `pending` 状态的交易，避免重复充值

## 与订单支付的区别

| 特性 | 订单支付 | 钱包充值 |
|------|----------|----------|
| 订单号 | order.orderNumber | transaction.id |
| 回调处理 | 更新订单状态 | 更新钱包余额 |
| 返回URL | /orders/{id}/pay/success | /profile?tab=wallet&recharge=success |
| 业务逻辑 | 标记订单已支付 | 增加钱包余额 |

## 测试流程

1. 登录客户端账户
2. 进入"个人中心" -> "钱包"标签页
3. 点击"充值"按钮
4. 输入金额或选择快速金额
5. 选择支付宝支付方式
6. 点击"确认充值"
7. 跳转到支付宝支付页面（沙箱环境）
8. 使用沙箱账户完成支付
9. 支付成功后返回网站
10. 查看钱包余额已增加
11. 查看交易记录中有充值记录（状态：completed）

## 已实现功能

- ✅ 创建充值交易记录
- ✅ 调用支付宝支付API
- ✅ 生成支付表单并跳转
- ✅ 处理支付宝异步回调
- ✅ 验证支付签名
- ✅ 更新钱包余额
- ✅ 更新交易状态
- ✅ 显示交易历史

## 待实现功能

- ⏳ 微信支付集成
- ⏳ PayPal支付集成
- ⏳ 支付失败处理和重试
- ⏳ 充值优惠活动
