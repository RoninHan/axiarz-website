# 支付宝支付测试指南

## 问题：支付宝提示"暂时无法查询到付款结果"

这是因为本地开发环境（localhost）无法被支付宝服务器访问，导致异步回调无法送达。

## 解决方案

### 方案1：使用内网穿透工具（推荐）

使用 ngrok、localtunnel 等工具将本地服务暴露到公网。

#### 使用 ngrok:

1. **安装 ngrok**
```bash
# macOS
brew install ngrok

# 或直接下载
# https://ngrok.com/download
```

2. **启动本地服务**
```bash
npm run dev
```

3. **启动 ngrok（新终端）**
```bash
ngrok http 3000
```

4. **复制 ngrok 提供的 URL**
```
Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
```

5. **更新环境变量**
```bash
# .env.local
NEXT_PUBLIC_APP_URL="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
```

6. **重启应用**
```bash
# 停止当前服务 (Ctrl+C)
npm run dev
```

#### 使用 localtunnel:

```bash
# 安装
npm install -g localtunnel

# 启动（在另一个终端）
lt --port 3000

# 会得到一个 URL，比如：
# your url is: https://random-name.loca.lt

# 更新 .env.local
NEXT_PUBLIC_APP_URL="https://random-name.loca.lt"
```

### 方案2：修改为仅同步返回模式（临时方案）

如果只是想测试支付流程，不需要异步回调验证，可以：

1. **订单在用户确认支付后直接标记为已支付**
2. **跳过异步回调验证**

这个方案不适合生产环境，因为用户可能不真正支付就声称已支付。

### 方案3：部署到测试服务器

将应用部署到有公网IP的服务器上进行测试。

## 当前支付流程

```
1. 用户点击支付
   ↓
2. 后端生成支付宝表单
   - returnUrl: 同步返回地址（用户支付后浏览器跳转）
   - notifyUrl: 异步回调地址（支付宝服务器POST请求）
   ↓
3. 跳转到支付宝支付页面
   ↓
4. 用户完成支付
   ↓
5. 支付宝处理：
   【同步】浏览器跳转到 returnUrl (带参数)
   【异步】服务器POST到 notifyUrl (验证支付)
   ↓
6. 前端：验证URL参数，更新订单状态
   后端：验证签名，确认支付状态
```

## 测试账号（支付宝沙箱）

登录 https://open.alipay.com/develop/sandbox/app 获取测试账号

### 买家账号示例：
- 账号：jxarau8176@sandbox.com
- 登录密码：111111
- 支付密码：111111

### 卖家账号示例：
- 账号：查看沙箱账号页面
- 登录密码：111111
- 支付密码：111111

## 调试建议

### 1. 查看支付宝返回的完整URL
支付成功后，浏览器地址栏会包含支付宝返回的参数：
```
http://localhost:3000/orders/xxx/pay/success?
  charset=utf-8&
  out_trade_no=ORD123456&
  method=alipay.trade.page.pay.return&
  total_amount=799.00&
  sign=xxxx&
  trade_no=2024010122001234567890&
  auth_app_id=2021000148665299&
  version=1.0&
  app_id=2021000148665299&
  sign_type=RSA2&
  seller_id=2088123456789012&
  timestamp=2024-01-01+12:00:00
```

### 2. 检查控制台日志
```bash
# 前端控制台（浏览器）
支付宝返回参数: { ... }
支付验证结果: { ... }

# 后端日志（终端）
📥 收到支付宝异步回调
📋 支付宝回调参数: { ... }
✅ 订单 ORD123456 支付成功
```

### 3. 本地测试时的注意事项

- ❌ **异步回调不会触发**（localhost无法访问）
- ✅ **同步返回会正常工作**（浏览器跳转）
- ✅ **可以验证前端流程**
- ✅ **可以测试UI和用户体验**

## 生产环境配置

在生产环境，确保：

1. **NEXT_PUBLIC_APP_URL 设置为真实域名**
```bash
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

2. **使用正式支付宝配置**（不是沙箱）

3. **配置HTTPS**（支付宝要求）

4. **配置支付宝应用的回调地址白名单**

## 常见问题

### Q: localhost 能测试支付吗？
A: 能测试同步返回流程，但异步回调不会触发。建议使用 ngrok。

### Q: 支付宝沙箱和正式环境有什么区别？
A: 
- 沙箱：测试环境，使用测试账号，不会真实扣款
- 正式：生产环境，使用真实账号，会真实扣款

### Q: 如何知道支付是否真的成功？
A: 异步回调是最可靠的验证方式，同步返回可能被用户伪造。

### Q: 为什么去掉了 passback_params？
A: 在沙箱环境中，此参数可能导致"无法查询付款结果"错误。我们改用订单号来关联订单。
