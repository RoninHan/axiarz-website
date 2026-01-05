# 钱包支付功能

## 功能概述

用户可以使用钱包余额购买商品，钱包支付与支付宝、微信支付等第三方支付方式并列，作为一种支付选项。

## 功能特性

- ✅ 钱包作为支付方式选项
- ✅ 显示钱包余额
- ✅ 余额不足提示
- ✅ 支付即时完成（无需跳转）
- ✅ 自动扣款并创建交易记录
- ✅ 支付后自动更新订单状态

## 实现流程

### 1. 获取支付方式列表

**API**: `GET /api/client/payment-methods`

返回所有启用的支付方式，包括钱包选项（如果用户已登录）：

```typescript
// 返回数据示例
[
  {
    id: "wallet",
    name: "wallet",
    displayName: "钱包余额",
    enabled: true,
    sortOrder: -1,
    config: {
      balance: 1500.00  // 用户钱包余额
    }
  },
  {
    id: "xxx",
    name: "alipay",
    displayName: "支付宝",
    enabled: true,
    sortOrder: 1
  }
  // ... 其他支付方式
]
```

**实现逻辑**:
- 获取所有启用的 `PaymentConfig`
- 检查用户是否登录
- 如果登录，查询用户钱包余额
- 将钱包选项添加到支付方式列表的最前面（sortOrder: -1）

### 2. 结账页面显示

**页面**: `app/(client)/checkout/page.tsx`

支付方式选择器会显示：
- 钱包图标 (💰) 和余额
- 其他支付方式（支付宝、微信等）

```tsx
{method.name === 'wallet' && (
  <div className="mt-1 text-sm text-gray-600">
    余额: ¥{method.config.balance.toFixed(2)}
  </div>
)}
```

### 3. 创建订单并支付

用户点击"提交订单"按钮后：

1. **创建订单** (`POST /api/client/orders`)
   - 验证购物车不为空
   - 检查库存
   - 创建订单（状态：pending，支付状态：unpaid）
   - 扣减库存
   - 清空购物车

2. **发起支付** (`POST /api/client/orders/{id}/pay`)
   - 如果选择钱包支付，执行钱包支付逻辑
   - 如果选择第三方支付，跳转到支付网关

### 4. 钱包支付逻辑

**API**: `POST /api/client/orders/{id}/pay`
**参数**: `{ paymentMethod: 'wallet' }`

执行步骤：

1. **验证钱包存在**
   ```typescript
   const wallet = await prisma.wallet.findUnique({
     where: { userId: auth.id }
   })
   if (!wallet) {
     return error('钱包不存在，请先充值')
   }
   ```

2. **检查余额是否充足**
   ```typescript
   if (walletBalance < orderAmount) {
     return error('钱包余额不足')
   }
   ```

3. **原子操作：扣款 + 创建交易 + 更新订单**
   ```typescript
   await prisma.$transaction([
     // 扣除余额
     prisma.wallet.update({
       data: { balance: newBalance }
     }),
     // 创建支付交易记录
     prisma.walletTransaction.create({
       data: {
         type: 'PAYMENT',
         amount: orderAmount,
         balance: newBalance,
         description: `支付订单 ${orderNumber}`,
         relatedId: orderId,
         status: 'completed'
       }
     }),
     // 更新订单状态为已支付
     prisma.order.update({
       data: {
         status: 'paid',
         paymentMethod: 'wallet',
         paymentStatus: 'paid'
       }
     })
   ])
   ```

4. **返回支付成功**
   ```typescript
   return {
     success: true,
     data: {
       paymentMethod: 'wallet',
       orderId,
       orderNumber,
       amount,
       newBalance
     }
   }
   ```

### 5. 前端处理支付结果

**钱包支付**（即时完成）：
```typescript
if (selectedPayment === 'wallet') {
  messageApi.success('支付成功！')
  setTimeout(() => router.push(`/orders/${orderId}`), 1000)
}
```

**第三方支付**（需要跳转）：
```typescript
else if (payData.data.paymentUrl) {
  const paymentWindow = window.open('', '_self')
  paymentWindow.document.write(payData.data.paymentUrl)
}
```

## 数据库变更

### WalletTransaction 新增类型

- `PAYMENT`: 支付订单（扣款）
- `RECHARGE`: 充值（入账）
- `REFUND`: 退款（入账）
- `WITHDRAW`: 提现（扣款，已移除功能）

### 交易记录字段

| 字段 | 说明 |
|------|------|
| relatedId | 关联订单ID（支付/退款时记录） |
| status | completed（支付成功）/ pending / failed |
| description | 如："支付订单 ORD1234567890" |

## 用户体验优势

### 相比第三方支付

| 特性 | 钱包支付 | 第三方支付 |
|------|----------|-----------|
| 支付速度 | 即时完成 | 需要跳转 |
| 用户体验 | 无需离开网站 | 跳转到支付宝/微信 |
| 手续费 | 无 | 可能有手续费 |
| 适用场景 | 小额支付、老用户 | 大额支付、新用户 |

## 安全性措施

1. **原子事务**: 使用 `prisma.$transaction` 确保扣款、记录、订单状态同步更新
2. **余额验证**: 支付前检查余额是否充足
3. **权限验证**: 确认订单属于当前用户
4. **状态检查**: 只允许 `pending` 状态的订单支付
5. **幂等性**: 已支付订单不允许重复支付

## 测试场景

### 正常流程
1. 用户充值钱包 ¥1000
2. 添加商品到购物车（总价 ¥500）
3. 进入结账页面
4. 选择"钱包余额"支付方式（显示余额 ¥1000）
5. 提交订单
6. 立即支付成功
7. 余额变为 ¥500
8. 订单状态变为"已支付"
9. 交易记录中显示"支付订单 ORD..."

### 余额不足
1. 用户钱包余额 ¥200
2. 商品总价 ¥500
3. 选择"钱包余额"支付
4. 提交订单
5. 提示"钱包余额不足，当前余额 ¥200，需要 ¥500"
6. 支付失败，订单状态仍为"待支付"
7. 用户可选择其他支付方式或充值后重新支付

### 无钱包
1. 新用户从未充值（无钱包记录）
2. 选择"钱包余额"支付
3. 提示"钱包不存在，请先充值"
4. 支付失败

## 业务场景

### 适用场景
- 👍 老客户快速复购
- 👍 小额商品购买
- 👍 促销活动后的余额消费
- 👍 避免手续费

### 不适用场景
- 👎 新用户首次购买（需先充值）
- 👎 大额商品（用户可能余额不足）

## 后续优化建议

1. **余额不足智能提示**
   - 显示"差 ¥XXX，立即充值"按钮
   - 一键跳转到充值页面
   - 充值金额自动填充差额

2. **混合支付**
   - 允许部分钱包余额 + 第三方支付
   - 例如：余额 ¥200，订单 ¥500，支付宝补 ¥300

3. **余额优先提示**
   - 如果余额充足，默认选中钱包支付
   - 提示"使用余额支付可节省手续费"

4. **支付优惠**
   - 钱包支付享受折扣
   - 充值返现活动

5. **退款到钱包**
   - 订单退款时退回到钱包
   - 创建 `REFUND` 类型交易记录

## 完成功能清单

- ✅ 钱包作为支付选项
- ✅ 显示钱包余额
- ✅ 余额充足时即时支付
- ✅ 余额不足时错误提示
- ✅ 支付成功更新订单状态
- ✅ 创建支付交易记录
- ✅ 扣除钱包余额
- ✅ 原子事务保证数据一致性
- ✅ 与第三方支付共存
- ✅ 前端区分钱包/第三方支付流程
