# 支付配置回调地址修复

## 问题描述

之前支付宝的 `notifyUrl`（异步回调通知地址）和 `returnUrl`（同步跳转地址）使用了硬编码的环境变量 `NEXT_PUBLIC_APP_URL`，这不符合最佳实践：

1. `NEXT_PUBLIC_APP_URL` 是前端环境变量，不应该在后端支付逻辑中使用
2. 回调地址应该由管理员在后台配置，而不是硬编码在代码中
3. 不同环境（开发/测试/生产）可能需要不同的回调地址

## 解决方案

### 1. 数据库配置结构调整

在 `PaymentConfig` 的 `config` JSON 字段中添加：
- `notifyUrl`: 支付异步回调通知地址（**必填**）
- `returnUrl`: 支付完成后的同步跳转地址（可选，不填则从 notifyUrl 推导）

#### 支付宝配置示例

```json
{
  "appId": "2021xxxxxxxxxxxxx",
  "privateKey": "MIIEvQIBADANBgkq...",
  "publicKey": "MIIBIjANBgkqhki...",
  "gateway": "https://openapi.alipay.com/gateway.do",
  "notifyUrl": "https://yourdomain.com/api/payment/callback",
  "returnUrl": "https://yourdomain.com"
}
```

### 2. 代码修改

#### 修改的文件

1. **`lib/payment/alipay.ts`**
   - ✅ 从配置中读取 `notifyUrl`
   - ✅ 验证 `notifyUrl` 是否配置
   - ✅ 移除硬编码的 `NEXT_PUBLIC_APP_URL`

2. **`app/api/client/orders/[id]/pay/route.ts`**
   - ✅ 从配置中读取 `returnUrl` 或推导基础 URL
   - ✅ 动态构建支付完成跳转地址

3. **`app/api/client/wallet/recharge/route.ts`**
   - ✅ 从配置中读取 `returnUrl` 或推导基础 URL
   - ✅ 动态构建充值完成跳转地址

4. **`app/api/admin/payment-configs/route.ts`**
   - ✅ 验证支付宝配置时检查 `notifyUrl` 是否存在

5. **`app/api/admin/payment-configs/[id]/route.ts`**
   - ✅ 验证支付宝配置时检查 `notifyUrl` 是否存在

6. **`prisma/seed.ts`**
   - ✅ 添加 `notifyUrl` 和 `returnUrl` 字段到初始配置模板

### 3. 配置方法

#### 方法 1：通过后台管理界面

1. 登录后台管理系统
2. 进入 **支付配置管理**
3. 编辑支付宝配置
4. 填写以下字段：
   - **notifyUrl**: `https://yourdomain.com/api/payment/callback`（必填）
   - **returnUrl**: `https://yourdomain.com`（可选）

#### 方法 2：通过数据库直接更新

```sql
UPDATE payment_configs 
SET config = jsonb_set(
  config, 
  '{notifyUrl}', 
  '"https://yourdomain.com/api/payment/callback"'
)
WHERE name = 'alipay';

-- 可选：设置 returnUrl
UPDATE payment_configs 
SET config = jsonb_set(
  config, 
  '{returnUrl}', 
  '"https://yourdomain.com"'
)
WHERE name = 'alipay';
```

#### 方法 3：通过 API

```bash
curl -X PUT https://yourdomain.com/api/admin/payment-configs/{id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "appId": "2021xxxxxxxxxxxxx",
      "privateKey": "MIIEvQIBADANBgkq...",
      "publicKey": "MIIBIjANBgkqhki...",
      "gateway": "https://openapi.alipay.com/gateway.do",
      "notifyUrl": "https://yourdomain.com/api/payment/callback",
      "returnUrl": "https://yourdomain.com"
    }
  }'
```

## 回调地址说明

### notifyUrl（异步通知）

- **用途**: 支付宝服务器在支付完成后会向此地址发送 POST 请求
- **必填**: 是
- **格式**: `https://yourdomain.com/api/payment/callback`
- **要求**: 
  - 必须是公网可访问的 HTTPS 地址
  - 服务器需要正确处理支付宝的异步通知
  - 返回 `success` 字符串表示处理成功

### returnUrl（同步跳转）

- **用途**: 用户支付完成后浏览器跳转的基础地址
- **必填**: 否（不填则从 notifyUrl 推导）
- **格式**: `https://yourdomain.com`（不需要包含路径）
- **实际跳转地址**:
  - 订单支付: `{returnUrl}/orders/{orderId}/pay/success`
  - 钱包充值: `{returnUrl}/profile?tab=wallet&recharge=success`

## 迁移指南

### 现有系统升级步骤

1. **更新代码**
   ```bash
   git pull origin main
   ```

2. **重新部署**
   ```bash
   npm run build
   npm start
   # 或使用 Docker
   docker-compose up -d --build
   ```

3. **配置回调地址**
   - 登录后台管理系统
   - 进入支付配置
   - 为支付宝配置添加 `notifyUrl` 字段

4. **测试支付流程**
   - 创建测试订单
   - 完成支付流程
   - 确认回调正常工作

## 注意事项

### ⚠️ 重要

1. **notifyUrl 必须配置**
   - 如果未配置，支付创建时会抛出错误
   - 错误信息：`支付宝配置缺少回调通知地址(notifyUrl)，请在后台支付配置中设置`

2. **本地开发环境**
   - 本地开发时 notifyUrl 可能无法被支付宝访问
   - 建议使用 [ngrok](https://ngrok.com/) 或类似工具暴露本地服务
   - 或者直接使用支付宝沙箱环境的模拟回调

3. **生产环境要求**
   - notifyUrl 必须是 HTTPS
   - 域名必须是公网可访问的
   - 服务器防火墙需要允许支付宝服务器的访问

4. **向后兼容**
   - 代码保留了 `process.env.NEXT_PUBLIC_APP_URL` 作为最后的 fallback
   - 但强烈建议配置 `notifyUrl` 而不是依赖环境变量

## 测试建议

### 单元测试

```typescript
describe('Alipay Service', () => {
  it('should throw error when notifyUrl is not configured', async () => {
    // 测试未配置 notifyUrl 时的错误处理
  })

  it('should use configured notifyUrl', async () => {
    // 测试使用配置的 notifyUrl
  })

  it('should fallback to derived returnUrl', async () => {
    // 测试 returnUrl 的推导逻辑
  })
})
```

### 集成测试

1. 配置支付宝沙箱环境
2. 设置正确的 notifyUrl（使用 ngrok 等工具）
3. 创建测试订单并完成支付
4. 验证异步回调和同步跳转是否正常

## 相关文件

- `lib/payment/alipay.ts` - 支付宝服务
- `app/api/client/orders/[id]/pay/route.ts` - 订单支付 API
- `app/api/client/wallet/recharge/route.ts` - 钱包充值 API
- `app/api/payment/callback/route.ts` - 支付回调处理
- `prisma/seed.ts` - 初始数据种子
- `app/api/admin/payment-configs/route.ts` - 支付配置管理 API
- `app/api/admin/payment-configs/[id]/route.ts` - 支付配置管理 API

## 更新日期

2026-01-11
